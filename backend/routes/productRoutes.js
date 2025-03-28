const express = require('express');
const router = express.Router();
const { 
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
  getProductsByCategory
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Special routes must be defined before generic routes to avoid conflicts
router.get('/top', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.get('/count', protect, admin, getProductCount);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);

// CRUD routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Reviews
router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router; 