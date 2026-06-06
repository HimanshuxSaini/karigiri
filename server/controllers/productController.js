const admin = require('firebase-admin');

// Simple in-memory cache for products
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const invalidateProductsCache = () => {
  productsCache = null;
  productsCacheTime = 0;
};

// @desc    Fetch all products from Firestore
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    if (productsCache && (Date.now() - productsCacheTime < CACHE_DURATION)) {
      return res.json(productsCache);
    }

    const db = admin.firestore();
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    }));

    productsCache = products;
    productsCacheTime = Date.now();
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product from Firestore
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('products').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ _id: doc.id, id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product from Firestore
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const db = admin.firestore();
    const productRef = db.collection('products').doc(req.params.id);
    const doc = await productRef.get();
    
    if (doc.exists) {
      await productRef.delete();
      invalidateProductsCache();
      res.json({ message: 'Product removed from Firestore' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product in Firestore
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const db = admin.firestore();
    const { name, price, description, image, images, brand, category, inStock, subCategory, sizeType, sizes, deliveryCharge, badge } = req.body;
    
    const productData = {
      name,
      price: Number(price),
      description,
      image,
      images: images || [],
      brand: brand || 'KARIGIRI',
      category,
      subCategory: subCategory || '',
      sizeType: sizeType || 'none',
      sizes: sizes || [],
      deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : 0,
      inStock: inStock !== undefined ? inStock : true,
      badge: badge || 'none',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('products').add(productData);
    const savedProduct = await docRef.get();
    
    invalidateProductsCache();
    
    res.status(201).json({
      _id: docRef.id,
      id: docRef.id,
      ...savedProduct.data()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product in Firestore
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const db = admin.firestore();
    const { name, price, description, image, images, brand, category, inStock, subCategory, sizeType, sizes, deliveryCharge, badge } = req.body;
    
    const productRef = db.collection('products').doc(req.params.id);
    const doc = await productRef.get();

    if (doc.exists) {
      const updateData = {
        name: name || doc.data().name,
        price: price !== undefined ? Number(price) : doc.data().price,
        description: description || doc.data().description,
        image: image || doc.data().image,
        images: images || doc.data().images || [],
        brand: brand || doc.data().brand,
        category: category || doc.data().category,
        subCategory: subCategory || doc.data().subCategory || '',
        sizeType: sizeType !== undefined ? sizeType : (doc.data().sizeType || 'none'),
        sizes: sizes !== undefined ? sizes : (doc.data().sizes || []),
        deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : (doc.data().deliveryCharge || 0),
        inStock: inStock !== undefined ? inStock : doc.data().inStock,
        badge: badge !== undefined ? badge : (doc.data().badge || 'none'),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await productRef.update(updateData);
      const updatedDoc = await productRef.get();
      
      invalidateProductsCache();
      
      res.json({
        _id: updatedDoc.id,
        id: updatedDoc.id,
        ...updatedDoc.data()
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct
};

