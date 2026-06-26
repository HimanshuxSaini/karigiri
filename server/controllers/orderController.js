const admin = require('firebase-admin');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// Create a new order (server-side validated)
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode, couponDiscount, user: userId, email, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.phone || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate phone number format (basic Indian phone validation)
    const phone = shippingAddress.phone?.replace(/\s/g, '');
    if (phone && (phone.length < 10 || phone.length > 13)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Validate pincode
    const pincode = shippingAddress.postalCode || shippingAddress.pincode;
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Please provide a valid 6-digit pincode' });
    }

    // Server-side price validation: fetch real product prices from Firestore
    const db = admin.firestore();
    let calculatedSubtotal = 0;
    let calculatedDelivery = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.id;
      if (!productId) {
        return res.status(400).json({ message: `Invalid product reference for item: ${item.name}` });
      }

      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }

      const productData = productDoc.data();
      const realPrice = Number(productData.price) || 0;
      const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 50)); // Cap at 50 per item
      const deliveryCharge = Number(productData.deliveryCharge) || 0;

      // Check stock
      if (productData.inStock === false) {
        return res.status(400).json({ message: `${productData.name} is currently out of stock` });
      }
      
      // Check stockCount if it exists
      if (productData.stockCount !== undefined && productData.stockCount < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${productData.name}. Only ${productData.stockCount} left.` });
      }

      calculatedSubtotal += realPrice * quantity;
      calculatedDelivery += deliveryCharge * quantity;

      validatedItems.push({
        name: productData.name,
        quantity,
        image: productData.image,
        price: realPrice,
        size: item.size || 'One Size',
        category: productData.category,
        product: productId,
        deliveryCharge
      });
    }

    // Check if first order for free delivery
    const existingOrders = await db.collection('orders')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    const isFirstOrder = existingOrders.empty;
    const finalDelivery = isFirstOrder ? 0 : calculatedDelivery;

    // Apply coupon discount (trust the validated amount from the coupon service)
    const validatedCouponDiscount = Math.min(Number(couponDiscount) || 0, calculatedSubtotal);

    const totalPrice = Math.max(0, calculatedSubtotal - validatedCouponDiscount + finalDelivery);

    // Verify Razorpay signature if payment method is Razorpay
    if (paymentMethod === 'Razorpay') {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing Razorpay payment details' });
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
        .update(body.toString())
        .digest('hex');
        
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    // Create the order document
    const orderData = {
      orderItems: validatedItems,
      shippingAddress: {
        address: shippingAddress.address || shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: pincode,
        phone: phone
      },
      paymentMethod: paymentMethod || 'WhatsApp / QR Code',
      subtotal: calculatedSubtotal,
      couponCode: couponCode || null,
      couponDiscount: validatedCouponDiscount,
      deliveryCharges: finalDelivery,
      totalPrice,
      user: userId,
      email: email.toLowerCase(),
      status: paymentMethod === 'Razorpay' ? 'Paid' : 'Processing',
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_order_id: razorpay_order_id || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('orders').add(orderData);

    // Update stock counts
    try {
      const batch = db.batch();
      for (const item of validatedItems) {
        const productRef = db.collection('products').doc(item.product);
        const productDoc = await productRef.get();
        if (productDoc.exists) {
          const currentStock = productDoc.data().stockCount;
          if (currentStock !== undefined) {
            const newStock = Math.max(0, currentStock - item.quantity);
            batch.update(productRef, {
              stockCount: newStock,
              inStock: newStock > 0,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }
      await batch.commit();
    } catch (stockErr) {
      console.error('Failed to update stock counts:', stockErr);
    }

    // Automatically increment coupon usage server-side if a valid coupon was used
    if (couponCode) {
      try {
        const couponSnapshot = await db.collection('coupons')
          .where('code', '==', couponCode.toUpperCase().trim())
          .limit(1)
          .get();
          
        if (!couponSnapshot.empty) {
          const couponDoc = couponSnapshot.docs[0];
          await couponDoc.ref.update({
            usedCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (couponErr) {
        // Don't fail the whole order if just updating the coupon usage stat fails
        console.error('Failed to auto-increment coupon count:', couponErr);
      }
    }

    // Send Order Confirmation Email asynchronously
    try {
      const itemsHtml = validatedItems.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `).join('');

      const mailOptions = {
        to: email.toLowerCase(),
        subject: `Order Confirmation - PrathamKarigiri (#${docRef.id.slice(-6).toUpperCase()})`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #fff; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #5C4033; margin: 0; font-size: 24px; letter-spacing: 2px;">PrathamKarigiri</h1>
            </div>
            <h2 style="color: #333; text-align: center;">Thank you for your order!</h2>
            <p style="color: #666; font-size: 14px; text-align: center;">We've received your order and are getting it ready to ship.</p>
            
            <div style="margin: 30px 0; background-color: #fcfcfc; padding: 20px; border-radius: 8px;">
              <h3 style="color: #5C4033; margin-top: 0;">Order Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${docRef.id}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${paymentMethod || 'WhatsApp / QR Code'}</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #5C4033;">Item</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid #5C4033;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; text-align: right;">Subtotal:</td>
                    <td style="padding: 10px; font-weight: bold; text-align: right;">₹${calculatedSubtotal}</td>
                  </tr>
                  ${validatedCouponDiscount > 0 ? `
                  <tr>
                    <td style="padding: 10px; text-align: right; color: #d9534f;">Discount:</td>
                    <td style="padding: 10px; text-align: right; color: #d9534f;">-₹${validatedCouponDiscount}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 10px; text-align: right;">Delivery:</td>
                    <td style="padding: 10px; text-align: right;">₹${finalDelivery}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: 800; text-align: right; font-size: 16px; border-top: 2px solid #5C4033;">Total:</td>
                    <td style="padding: 10px; font-weight: 800; text-align: right; font-size: 16px; border-top: 2px solid #5C4033;">₹${totalPrice}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="margin-top: 30px;">
              <h3 style="color: #5C4033;">Shipping Address</h3>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                ${shippingAddress.address || shippingAddress.street}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} ${pincode}<br/>
                Phone: ${phone}
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">If you have any questions about your order, please contact us.</p>
          </div>
        `
      };
      
      // We don't await this so the response is fast. We catch errors internally so it doesn't crash the server.
      sendEmail(mailOptions).catch(err => console.error('Failed to send order email:', err));
    } catch (emailErr) {
      console.error('Error preparing order email:', emailErr);
    }

    res.status(201).json({
      _id: docRef.id,
      id: docRef.id,
      ...orderData,
      status: paymentMethod === 'Razorpay' ? 'Paid' : 'Processing'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order. Please try again.' });
  }
};

module.exports = { createOrder };
