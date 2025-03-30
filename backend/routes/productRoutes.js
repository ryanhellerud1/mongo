import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all products and create new product
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Get top rated products
router.get('/top', getTopProducts);

// Get, update, and delete specific product
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Product reviews
router.post('/:id/reviews', protect, createProductReview);

export default router; 