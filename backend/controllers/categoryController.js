const Category = require('../models/categoryModel');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = async (req, res) => {
  try {
    const tree = await Category.getTree();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug')
      .populate('path', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, parent, image } = req.body;

    // Check if parent exists if provided
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    // Generate slug from name
    const slugify = require('slugify');
    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({
      name,
      description,
      parent,
      image,
      slug,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description, parent, image, status } = req.body;

    // Check if parent exists if provided
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    category.name = name || category.name;
    category.description = description || category.description;
    category.parent = parent || category.parent;
    category.image = image || category.image;
    if (status) category.status = status;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has children
    const hasChildren = await Category.findOne({ parent: category._id });
    if (hasChildren) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories' 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category children
// @route   GET /api/categories/:id/children
// @access  Public
const getCategoryChildren = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const children = await category.getChildren();
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category ancestors
// @route   GET /api/categories/:id/ancestors
// @access  Public
const getCategoryAncestors = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const ancestors = await category.getAncestors();
    res.json(ancestors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryChildren,
  getCategoryAncestors,
}; 