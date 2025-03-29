const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, uploadImage } = require('../controllers/uploadController');

const router = express.Router();

// Upload image route (protected for admins only)
// The 'single' middleware handles a single file with field name 'image'
router.post('/', protect, admin, upload.single('image'), uploadImage);

module.exports = router; 