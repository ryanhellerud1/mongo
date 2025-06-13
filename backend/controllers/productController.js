import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    images: ['/images/sample.jpg'],
    brand: 'Sample brand',
    category: req.body.category || '64e9b7c735f15480af4c90e1', // Default category ID
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
    slug: 'sample-name-' + Date.now(),
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    slug,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.slug = slug || product.slug;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category')
    .populate('reviews.user', 'name');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json(product);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  
  const products = await Product.find({ status: 'active', isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category');
  
  res.json(products);
});

// @desc    Get product counts
// @route   GET /api/products/count
// @access  Private/Admin
const getProductCount = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ status: 'active' });
  
  res.json({ count: productCount });
});

// @desc    Get products by category id
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  // Get the category and all its subcategories
  const categoryId = req.params.categoryId;
  const category = await Category.findById(categoryId);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Get all subcategories
  const subcategories = await Category.find({ path: mongoose.Types.ObjectId(categoryId) });
  const categoryIds = [categoryId, ...subcategories.map(c => c._id)];
  
  // Get products
  const products = await Product.find({ 
    category: { $in: categoryIds },
    status: 'active'
  })
    .populate('category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  // Get total count for pagination
  const total = await Product.countDocuments({ 
    category: { $in: categoryIds },
    status: 'active'
  });
  
  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total
  });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
}; 