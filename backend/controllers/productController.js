const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = 10,
      page = 1,
      search,
      featured
    } = req.query;

    // Build query
    const filter = { status: 'active' };

    // Filter by category (including subcategories)
    if (category) {
      const categoryObj = await Category.findOne({ slug: category });
      if (categoryObj) {
        // Get all subcategories (children of this category)
        const subcategories = await Category.find({ path: categoryObj._id });
        const categoryIds = [categoryObj._id, ...subcategories.map(c => c._id)];
        filter.category = { $in: categoryIds };
      }
    }

    // Filter by brand
    if (brand) {
      filter.brand = brand;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Filter by search term
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter featured products
    if (featured) {
      filter.isFeatured = featured === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const products = await Product.find(filter)
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('reviews.user', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('reviews.user', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      price,
      category,
      countInStock,
      brand,
      specifications,
      isFeatured,
      images
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Generate slug from name
    const slugify = require('slugify');
    const slug = slugify(name, { lower: true, strict: true });

    const product = await Product.create({
      name,
      slug,
      description,
      richDescription,
      brand,
      price,
      category,
      countInStock,
      specifications: specifications || [],
      isFeatured: isFeatured || false,
      images: images || []
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (likely on slug)
      res.status(400).json({ message: 'Product with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      price,
      category,
      countInStock,
      brand,
      specifications,
      isFeatured,
      images,
      status
    } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (richDescription !== undefined) product.richDescription = richDescription;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (brand !== undefined) product.brand = brand;
    if (specifications) product.specifications = specifications;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (images) product.images = images;
    if (status) product.status = status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (likely on slug)
      res.status(400).json({ message: 'Product with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete by changing status
    product.status = 'deleted';
    await product.save();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    const products = await Product.find({ status: 'active' })
      .sort({ rating: -1 })
      .limit(limit)
      .populate('category');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    const products = await Product.find({ status: 'active', isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product counts
// @route   GET /api/products/count
// @access  Private/Admin
const getProductCount = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ status: 'active' });
    
    res.json({ count: productCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    await product.updateRatingStats();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get products by category id
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get the category and all its subcategories
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getFeaturedProducts,
  getProductCount,
  createProductReview,
  getProductsByCategory,
}; 