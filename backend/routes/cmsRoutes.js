import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getDashboardStats, getCmsProducts, getProductsForSelect, getCategoriesForSelect, batchUpdateProducts, getCmsOrders } from '../controllers/cmsController.js';

const router = express.Router();

// CMS routes
router.get('/', (req, res) => {
  res.json({ message: 'CMS API is working' });
});

// Dashboard stats route
router.get('/dashboard', protect, admin, getDashboardStats);

// Product routes
router.get('/products', protect, admin, getCmsProducts);
router.get('/products/select', protect, admin, getProductsForSelect);
router.put('/products/batch', protect, admin, batchUpdateProducts);

// Category routes
router.get('/categories/select', protect, admin, getCategoriesForSelect);

// Order routes
router.get('/orders', protect, admin, getCmsOrders);

export default router; 