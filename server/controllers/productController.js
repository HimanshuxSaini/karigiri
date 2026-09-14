const Product = require('../models/Product');

// Simple in-memory cache for products
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const invalidateProductsCache = () => {
  productsCache = null;
  productsCacheTime = 0;
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    if (productsCache && (Date.now() - productsCacheTime < CACHE_DURATION)) {
      return res.json(productsCache);
    }

    const products = await Product.find({ isArchived: false }).sort({ createdAt: -1 });

    // Format to include both _id and id for backwards compatibility
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString()
    }));

    productsCache = formattedProducts;
    productsCacheTime = Date.now();
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({ ...product.toObject(), id: product._id.toString() });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (product) {
      invalidateProductsCache();
      res.json({ message: 'Product removed from MongoDB' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, brand, category, inStock, subCategory, sizeType, sizes, sizePrices, deliveryCharge, badge, stockCount, isReturnable, returnDays } = req.body;
    
    let finalInStock = inStock !== undefined ? inStock : true;
    if (stockCount !== undefined) {
      finalInStock = Number(stockCount) > 0;
    }

    const productData = {
      name,
      price: Number(price),
      description,
      image,
      images: images || [],
      brand: brand || 'PrathamKarigiri',
      category,
      subCategory: subCategory || '',
      sizeType: sizeType || 'none',
      sizes: sizes || [],
      sizePrices: sizePrices || {},
      deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : 0,
      inStock: finalInStock,
      stockCount: stockCount !== undefined ? Number(stockCount) : 0,
      badge: badge || 'none',
      isReturnable: isReturnable || false,
      returnDays: returnDays ? Number(returnDays) : 7
    };

    const newProduct = await Product.create(productData);
    invalidateProductsCache();
    
    res.status(201).json({
      ...newProduct.toObject(),
      id: newProduct._id.toString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, brand, category, inStock, subCategory, sizeType, sizes, sizePrices, deliveryCharge, badge, stockCount, isReturnable, returnDays } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      let finalInStock = inStock !== undefined ? inStock : product.inStock;
      if (stockCount !== undefined) {
        finalInStock = Number(stockCount) > 0;
      }

      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.images = images || product.images;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.sizeType = sizeType !== undefined ? sizeType : product.sizeType;
      product.sizes = sizes !== undefined ? sizes : product.sizes;
      product.sizePrices = sizePrices !== undefined ? sizePrices : product.sizePrices;
      product.deliveryCharge = deliveryCharge !== undefined ? Number(deliveryCharge) : product.deliveryCharge;
      product.inStock = finalInStock;
      if (stockCount !== undefined) product.stockCount = Number(stockCount);
      product.badge = badge !== undefined ? badge : product.badge;
      product.isReturnable = isReturnable !== undefined ? isReturnable : product.isReturnable;
      product.returnDays = returnDays !== undefined ? Number(returnDays) : product.returnDays;

      const updatedProduct = await product.save();
      invalidateProductsCache();
      
      res.json({
        ...updatedProduct.toObject(),
        id: updatedProduct._id.toString()
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
