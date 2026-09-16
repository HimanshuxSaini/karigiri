const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (user) {
      res.json(user);
    } else {
      // Create user if not exists
      const newUser = await User.create({
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name || '',
        phone: req.user.phone || ''
      });
      res.json(newUser);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (addresses, etc)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (user) {
      user.displayName = req.body.displayName || user.displayName;
      user.phone = req.body.phone || user.phone;
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ uid: req.user.uid });
    if (!cart) {
      cart = await Cart.create({ uid: req.user.uid, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user cart
// @route   PUT /api/users/cart
// @access  Private
const updateCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ uid: req.user.uid });
    if (!cart) {
      cart = new Cart({ uid: req.user.uid, items: [] });
    }
    cart.items = req.body.items || [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ uid: req.user.uid });
    if (!wishlist) {
      wishlist = await Wishlist.create({ uid: req.user.uid, items: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user wishlist
// @route   PUT /api/users/wishlist
// @access  Private
const updateWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ uid: req.user.uid });
    if (!wishlist) {
      wishlist = new Wishlist({ uid: req.user.uid, items: [] });
    }
    wishlist.items = req.body.items || [];
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.uid }).sort({ createdAt: -1 });
    // Format to have id instead of _id for frontend compatibility
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString()
    }));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// Admin Management (Super Admin only)
// ==========================================

// @desc    Get all admins
// @route   GET /api/users/admins
// @access  Private/SuperAdmin
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-addresses');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grant admin access to a user by email
// @route   POST /api/users/admins/grant
// @access  Private/SuperAdmin
const grantAdmin = async (req, res) => {
  const { email, permissions } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. They must sign in once before being made an admin.' });
    }

    user.role = 'admin';
    user.permissions = permissions || [];
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin permissions
// @route   PUT /api/users/admins/:uid/permissions
// @access  Private/SuperAdmin
const updateAdminPermissions = async (req, res) => {
  const { uid } = req.params;
  const { permissions } = req.body;

  try {
    const user = await User.findOne({ uid });
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    user.permissions = permissions || [];
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke admin access
// @route   POST /api/users/admins/revoke
// @access  Private/SuperAdmin
const revokeAdmin = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ message: 'User ID (uid) is required' });

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'customer';
    user.permissions = [];
    await user.save();

    res.json({ message: 'Admin access revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getCart,
  updateCart,
  getWishlist,
  updateWishlist,
  getMyOrders,
  getAdmins,
  grantAdmin,
  updateAdminPermissions,
  revokeAdmin
};
