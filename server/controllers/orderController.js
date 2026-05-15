const admin = require('firebase-admin');

// Create a new order (server-side validated)
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode, couponDiscount, user: userId, email } = req.body;

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
      status: 'Processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('orders').add(orderData);

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

    res.status(201).json({
      _id: docRef.id,
      id: docRef.id,
      ...orderData,
      status: 'Processing'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order. Please try again.' });
  }
};

module.exports = { createOrder };
