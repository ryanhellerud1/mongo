import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
import slugify from 'slugify';

class Product extends Model {
  // Instance method to update rating (example)
  async updateRatingStats() {
    const reviews = await this.getReviews(); // Assuming 'getReviews' is available after association
    if (reviews.length === 0) {
      this.rating = 0;
      this.numReviews = 0;
    } else {
      this.numReviews = reviews.length;
      this.rating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }
    return this.save();
  }

  // Virtual for URL
  get url() {
    return `/products/${this.slug}`;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING), // For storing multiple image URLs
      allowNull: false,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.FLOAT, // FLOAT for average rating
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    numReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // DECIMAL for currency
      allowNull: false,
      defaultValue: 0,
    },
    countInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // userId and categoryId will be added via associations
  },
  {
    sequelize,
    modelName: 'Product',
    timestamps: true,
    hooks: {
      beforeValidate: (product) => { // Use beforeValidate for slug generation
        if (product.name && (!product.slug || product.changed('name'))) { // Generate slug if name is present and changed or slug is not set
          product.slug = slugify(product.name);
        }
      },
    },
  }
);

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { // Name of the reviewer, could be from User model if linked
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // userId and productId will be added via associations
  },
  {
    sequelize,
    modelName: 'Review',
    timestamps: true,
  }
);

class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { // e.g., 'Color', 'Size'
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: { // e.g., 'Red', 'XL'
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    countInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sku: {
      type: DataTypes.STRING,
    },
    // productId will be added via association
  },
  {
    sequelize,
    modelName: 'ProductVariant',
    timestamps: false,
  }
);

export { Product, Review, ProductVariant };
