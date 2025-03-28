const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

// @desc    Get dashboard statistics
// @route   GET /api/cms/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get product stats
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalCategories = await Category.countDocuments();
    
    // Get order stats
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email');
    
    // Revenue stats
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // User stats
    const totalUsers = await User.countDocuments();
    
    // Get status counts
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Low stock products
    const lowStockProducts = await Product.find({ countInStock: { $lt: 10 }, status: 'active' })
      .limit(5)
      .select('name countInStock price');
    
    res.json({
      productStats: {
        total: totalProducts,
        categories: totalCategories,
        lowStock: lowStockProducts
      },
      orderStats: {
        total: totalOrders,
        recent: recentOrders,
        byStatus: orderStatusCounts
      },
      userStats: {
        total: totalUsers
      },
      revenue: {
        total: totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get products for CMS with expanded details
// @route   GET /api/cms/products
// @access  Private/Admin
const getCmsProducts = async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = req.query;
    
    // Build query
    const filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Filter by search term
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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

// @desc    Get products with search and filtering for select dropdown
// @route   GET /api/cms/products/select
// @access  Private/Admin
const getProductsForSelect = async (req, res) => {
  try {
    const { search } = req.query;
    
    const filter = { status: 'active' };
    
    // Filter by search term
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(filter)
      .select('_id name price countInStock')
      .limit(20);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get categories with search for select dropdown
// @route   GET /api/cms/categories/select
// @access  Private/Admin
const getCategoriesForSelect = async (req, res) => {
  try {
    const { search } = req.query;
    
    const filter = {};
    
    // Filter by search term
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const categories = await Category.find(filter)
      .select('_id name slug')
      .limit(20);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Batch update product status
// @route   PUT /api/cms/products/batch
// @access  Private/Admin
const batchUpdateProducts = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });
    }
    
    if (!status) {
      return res.status(400).json({ message: 'No status provided' });
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    
    res.json({
      message: `Updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order list with expanded details
// @route   GET /api/cms/orders
// @access  Private/Admin
const getCmsOrders = async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = req.query;
    
    // Build query
    const filter = {};
    
    // Filter by status
    if (status) {
      filter.status = status;
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    
    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getCmsProducts,
  getProductsForSelect,
  getCategoriesForSelect,
  batchUpdateProducts,
  getCmsOrders
}; 