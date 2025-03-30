import express from 'express';
import { 
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all categories (public)
router.get('/', getCategories);

// Get single category by id (public)
router.get('/:id', getCategoryById);

// Create category (admin only)
router.post('/', protect, admin, createCategory);

// Update category (admin only)
router.put('/:id', protect, admin, updateCategory);

// Delete category (admin only)
router.delete('/:id', protect, admin, deleteCategory);

export default router; 