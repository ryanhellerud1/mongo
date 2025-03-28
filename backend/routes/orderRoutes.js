const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Special routes must be defined before generic routes to avoid conflicts
router.route('/myorders').get(protect, getMyOrders);
router.route('/stats').get(protect, admin, getOrderStats);

// Main routes
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.route('/:id')
  .get(protect, getOrderById);

// Order status update routes
router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router; 