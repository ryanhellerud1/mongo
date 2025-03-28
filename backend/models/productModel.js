const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    richDescription: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
    },
    variants: [
      {
        name: { type: String },
        price: { type: Number },
        countInStock: { type: Number },
        attributes: [{
          name: { type: String },
          value: { type: String }
        }]
      }
    ],
    specifications: [{
      title: { type: String },
      value: { type: String }
    }],
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for URL
productSchema.virtual('url').get(function () {
  return `/products/${this.slug}`;
});

// Calculate average rating
productSchema.methods.updateRatingStats = function () {
  const reviews = this.reviews;
  if (reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = reviews.length;
    this.rating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 