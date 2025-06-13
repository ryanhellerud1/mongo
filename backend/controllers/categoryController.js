import asyncHandler from '../middleware/asyncHandler.js';
import { Category, User } from '../models/sql/index.js'; // Sequelize models

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({}); // Use findAll
  res.json(categories);
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
// const getCategoryTree = async (req, res) => {
//   try {
//     // Sequelize does not have a direct getTree equivalent without additional setup (e.g., sequelize-hierarchy)
//     // This method needs to be re-implemented or removed based on new schema.
//     res.status(501).json({ message: 'Not Implemented' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id); // Use findByPk
  
  if (category) {
    res.json(category); // Response will use 'id'
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  const category = await Category.create({ // Use create
    name,
    description,
    userId: req.user.id, // Associate with logged-in user's id
  });
  
  res.status(201).json(category); // Response will use 'id'
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  const category = await Category.findByPk(req.params.id); // Use findByPk
  
  if (category) {
    category.name = name || category.name;
    category.description = description || category.description;
    // category.userId will remain unchanged unless explicitly updated
    
    const updatedCategory = await category.save(); // Use save
    res.json(updatedCategory); // Response will use 'id'
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id); // Use findByPk
  
  if (category) {
    await category.destroy(); // Use destroy
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get category children
// @route   GET /api/categories/:id/children
// @access  Public
// const getCategoryChildren = async (req, res) => {
//   try {
//     // Sequelize does not have a direct getChildren equivalent without additional setup
//     // This method needs to be re-implemented or removed.
//     const category = await Category.findByPk(req.params.id);
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     // const children = await category.getChildren(); // This would require a specific hierarchy setup
//     res.status(501).json({ message: 'Not Implemented' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// @desc    Get category ancestors
// @route   GET /api/categories/:id/ancestors
// @access  Public
// const getCategoryAncestors = async (req, res) => {
//   try {
//     // Sequelize does not have a direct getAncestors equivalent without additional setup
//     // This method needs to be re-implemented or removed.
//     const category = await Category.findByPk(req.params.id);
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     // const ancestors = await category.getAncestors(); // This would require a specific hierarchy setup
//     res.status(501).json({ message: 'Not Implemented' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

export {
  getCategories,
  // getCategoryTree, // Commented out as it requires specific hierarchy setup
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // getCategoryChildren, // Commented out
  // getCategoryAncestors, // Commented out
}; 