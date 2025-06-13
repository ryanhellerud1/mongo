import asyncHandler from '../middleware/asyncHandler.js';
import { Product, Category, Order, User, sequelize } from '../models/sql/index.js';
import { Op } from 'sequelize';

// @desc    Get dashboard statistics
// @route   GET /api/cms/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get product stats
  const totalProducts = await Product.count(); // status: 'active' filter removed
  const totalCategories = await Category.count();

  // Get order stats
  const totalOrders = await Order.count();
  const recentOrders = await Order.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [{ model: User, attributes: ['name', 'email'] }]
  });

  // Revenue stats
  const paidOrders = await Order.findAll({ where: { isPaid: true } });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);

  // User stats
  const totalUsers = await User.count();

  // Get status counts for orders
  const orderStatusCountsRaw = await Order.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
    group: ['status']
  });
  const formattedStatusCounts = orderStatusCountsRaw.map(item => ({
    _id: item.status, // Mongoose style _id for consistency if frontend expects it
    status: item.status,
    count: item.get('count')
  }));

  // Low stock products
  const lowStockProducts = await Product.findAll({
    where: { countInStock: { [Op.lt]: 10 } }, // status: 'active' filter removed
    limit: 5,
    attributes: ['id', 'name', 'countInStock', 'price', 'slug'] // Added id and slug
  });

  res.json({
    productStats: {
      total: totalProducts,
      categories: totalCategories,
      lowStock: lowStockProducts
    },
    orderStats: {
      total: totalOrders,
      recent: recentOrders,
      byStatus: formattedStatusCounts
    },
    userStats: {
      total: totalUsers
    },
    revenue: {
      total: totalRevenue
    }
  });
});

// @desc    Get products for CMS with expanded details
// @route   GET /api/cms/products
// @access  Private/Admin
const getCmsProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrderParam = req.query.sortOrder || 'desc';
  // const status = req.query.status; // status field removed from Product model
  const search = req.query.search;

  const offset = (page - 1) * limit;
  const order = [[sortBy, sortOrderParam.toUpperCase()]];

  const whereClause = {};
  // if (status) whereClause.status = status; // No status field in Sequelize Product model
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where: whereClause,
    include: [{model: Category, attributes: ['id', 'name']}],
    order: order,
    limit: limit,
    offset: offset,
    distinct: true,
  });

  res.json({
    products,
    page: page,
    pages: Math.ceil(count / limit),
    total: count
  });
});

// @desc    Get products with search and filtering for select dropdown
// @route   GET /api/cms/products/select
// @access  Private/Admin
const getProductsForSelect = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const whereClause = {};
  // filter.status = 'active'; // status field removed from Product model

  if (search) {
    whereClause.name = { [Op.iLike]: `%${search}%` };
  }

  const products = await Product.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'price', 'countInStock', 'slug'], // Ensure 'id' is used
    limit: 20
  });

  res.json(products);
});

// @desc    Get categories with search for select dropdown
// @route   GET /api/cms/categories/select
// @access  Private/Admin
const getCategoriesForSelect = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const whereClause = {};
    
  if (search) {
    whereClause.name = { [Op.iLike]: `%${search}%` };
  }

  const categories = await Category.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'slug'], // Ensure 'id' is used
    limit: 20
  });

  res.json(categories);
});

// @desc    Batch update product status (changed to update 'isFeatured')
// @route   PUT /api/cms/products/batch
// @access  Private/Admin
const batchUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, status } = req.body; // 'status' here will represent the boolean for 'isFeatured'

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('No product IDs provided');
  }

  if (typeof status !== 'boolean') { // Expecting boolean for isFeatured
    res.status(400);
    throw new Error('Invalid status provided for isFeatured field (must be true or false)');
  }

  // Updating 'isFeatured' field as 'status' is not on Product model
  const [affectedRowsCount] = await Product.update(
    { isFeatured: status },
    { where: { id: { [Op.in]: ids } } }
  );

  res.json({
    message: `Updated ${affectedRowsCount} products' isFeatured status`,
    modifiedCount: affectedRowsCount
  });
});

// @desc    Get order list with expanded details
// @route   GET /api/cms/orders
// @access  Private/Admin
const getCmsOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrderParam = req.query.sortOrder || 'desc';
  const status = req.query.status;
  // const search = req.query.search; // Search on orders needs specific field definition (e.g., user name, product name in items)
                                     // Omitting direct search for now due to complexity with Sequelize joins for generic search

  const offset = (page - 1) * limit;
  const order = [[sortBy, sortOrderParam.toUpperCase()]];

  const whereClause = {};
  if (status) {
    whereClause.status = status;
  }
  // if (search) { /* Define searchable fields and add to whereClause */ }

  const { count, rows: orders } = await Order.findAndCountAll({
    where: whereClause,
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    order: order,
    limit: limit,
    offset: offset,
    distinct: true,
  });

  res.json({
    orders,
    page: page,
    pages: Math.ceil(count / limit),
    total: count
  });
});

export {
  getDashboardStats,
  getCmsProducts,
  getProductsForSelect,
  getCategoriesForSelect,
  batchUpdateProducts,
  getCmsOrders
}; 