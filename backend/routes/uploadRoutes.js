import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

// Upload image route (protected for admins only)
// The 'single' middleware handles a single file with field name 'image'
router.post('/', protect, admin, upload.single('image'), uploadImage);

export default router; 