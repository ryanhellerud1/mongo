const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    image: {
      type: String,
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    path: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
categorySchema.pre('save', function(next) {
  // Always generate slug from name
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

// Update level and path when parent changes
categorySchema.pre('save', async function(next) {
  if (!this.isModified('parent')) {
    return next();
  }

  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    this.level = parent.level + 1;
    this.path = [...parent.path, parent._id];
  } else {
    this.level = 0;
    this.path = [];
  }
  next();
});

// Method to get all child categories
categorySchema.methods.getChildren = async function() {
  return await this.constructor.find({ parent: this._id });
};

// Method to get all ancestor categories
categorySchema.methods.getAncestors = async function() {
  return await this.constructor.find({ _id: { $in: this.path } });
};

// Static method to get category tree
categorySchema.statics.getTree = async function() {
  const categories = await this.find({ parent: null });
  const tree = await Promise.all(
    categories.map(async (category) => {
      const children = await category.getChildren();
      return {
        ...category.toObject(),
        children,
      };
    })
  );
  return tree;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 