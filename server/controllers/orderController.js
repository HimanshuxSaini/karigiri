const crypto = require('crypto');
const Razorpay = require('razorpay');
const { sendEmail } = require('../utils/emailService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

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

    // Server-side price validation: fetch real product prices from MongoDB
    let calculatedSubtotal = 0;
    let calculatedDelivery = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.id;
      if (!productId) {
        return res.status(400).json({ message: `Invalid product reference for item: ${item.name}` });
      }

      const productData = await Product.findById(productId);
      if (!productData) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }

      let realPrice = Number(productData.price) || 0;
      if (item.size && productData.sizePrices && productData.sizePrices.get(item.size)) {
        realPrice = Number(productData.sizePrices.get(item.size));
      }
      
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
        title: productData.name,
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
    const existingOrders = await Order.find({ email: email.toLowerCase() }).limit(1);
    const isFirstOrder = existingOrders.length === 0;
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
      
      // Fetch extended payment details from Razorpay
      try {
        const razorpayInstance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);
        
        req.extendedPaymentDetails = {
          method: paymentInfo.method,
          card_network: paymentInfo.card?.network || null,
          bank: paymentInfo.bank || null,
          wallet: paymentInfo.wallet || null,
          upi_id: paymentInfo.vpa || null,
          payment_time: paymentInfo.created_at ? new Date(paymentInfo.created_at * 1000) : null,
          fee: paymentInfo.fee ? (paymentInfo.fee / 100) : null,
          tax: paymentInfo.tax ? (paymentInfo.tax / 100) : null
        };
      } catch (err) {
        console.error('Failed to fetch extended Razorpay details:', err);
      }
    }

    // Create the order document
    const orderData = {
      orderItems: validatedItems,
      shippingAddress: {
        line1: shippingAddress.address || shippingAddress.street,
        line2: '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: pincode
      },
      name: shippingAddress.name || email.split('@')[0],
      phone: phone,
      paymentMethod: paymentMethod || 'WhatsApp / QR Code',
      paymentDetails: {
        razorpay_payment_id: razorpay_payment_id || null,
        razorpay_order_id: razorpay_order_id || null,
        razorpay_signature: razorpay_signature || null,
        ...(req.extendedPaymentDetails || {})
      },
      subtotal: calculatedSubtotal,
      appliedCoupon: couponCode ? {
        code: couponCode,
        discountAmount: validatedCouponDiscount
      } : null,
      discount: validatedCouponDiscount,
      deliveryCharge: finalDelivery,
      totalAmount: totalPrice,
      user: userId,
      email: email.toLowerCase(),
      status: paymentMethod === 'Razorpay' ? 'Paid' : 'Processing',
      statusHistory: [{
        status: paymentMethod === 'Razorpay' ? 'Paid' : 'Processing',
        comment: paymentMethod === 'Razorpay' ? 'Payment successful via Razorpay' : 'Order placed',
        timestamp: new Date()
      }],
      deviceInfo: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    };

    const newOrder = await Order.create(orderData);

    // Update stock counts
    try {
      for (const item of validatedItems) {
        const product = await Product.findById(item.product);
        if (product && product.stockCount !== undefined) {
          const newStock = Math.max(0, product.stockCount - item.quantity);
          product.stockCount = newStock;
          product.inStock = newStock > 0;
          await product.save();
        }
      }
    } catch (stockErr) {
      console.error('Failed to update stock counts:', stockErr);
    }

    // Automatically increment coupon usage server-side if a valid coupon was used
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save();
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
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} (x${item.quantity})</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
      `).join('');

      const mailOptions = {
        to: email.toLowerCase(),
        subject: `Order Confirmation - PrathamKarigiri (#${newOrder._id.toString().slice(-6).toUpperCase()})`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #fff; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #5C4033; margin: 0; font-size: 24px; letter-spacing: 2px;">PrathamKarigiri</h1>
            </div>
            <h2 style="color: #333; text-align: center;">Thank you for your order!</h2>
            <p style="color: #666; font-size: 14px; text-align: center;">We've received your order and are getting it ready to ship.</p>
            
            <div style="margin: 30px 0; background-color: #fcfcfc; padding: 20px; border-radius: 8px;">
              <h3 style="color: #5C4033; margin-top: 0;">Order Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${newOrder._id}</p>
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
      ...newOrder.toObject(),
      id: newOrder._id.toString()
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order. Please try again.' });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeletedByAdmin: false }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      comment: status === 'Cancelled' ? (cancellationReason || 'Cancelled by admin') : `Status updated to ${status}`,
      timestamp: new Date()
    });

    if (status === 'Cancelled' && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete order / Flag as Suspicious (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isDeletedByAdmin = true;
    order.status = 'Cancelled (Suspicious)';
    order.statusHistory.push({
      status: 'Cancelled (Suspicious)',
      comment: 'Flagged as suspicious/fake order by admin',
      timestamp: new Date()
    });
    
    await order.save();
    res.json({ message: 'Order flagged as suspicious' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update expected delivery date (Admin)
const updateOrderDeliveryDate = async (req, res) => {
  try {
    const { expectedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.expectedDeliveryDate = expectedDeliveryDate;
    
    // Also record it in status history for audit trail
    if (expectedDeliveryDate) {
      const formattedDate = new Date(expectedDeliveryDate).toLocaleDateString('en-IN');
      order.statusHistory.push({
        status: order.status,
        comment: `Expected delivery date updated to ${formattedDate}`,
        timestamp: new Date()
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating delivery date:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, updateOrderDeliveryDate, deleteOrder };
