const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getCmsProducts,
  getProductsForSelect,
  getCategoriesForSelect,
  batchUpdateProducts,
  getCmsOrders
} = require('../controllers/cmsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All CMS routes require admin access
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', getCmsProducts);
router.get('/products/select', getProductsForSelect);
router.put('/products/batch', batchUpdateProducts);

// Categories
router.get('/categories/select', getCategoriesForSelect);

// Orders
router.get('/orders', getCmsOrders);

module.exports = router; 