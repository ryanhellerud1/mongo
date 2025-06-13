import sequelize from '../../config/database.js';
import User from './userSqlModel.js';
import Category from './categorySqlModel.js';
import { Product, Review, ProductVariant } from './productSqlModel.js';
import { Order, OrderItem } from './orderSqlModel.js';

// User associations
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.hasMany(Product, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.hasMany(Category, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Category associations
Category.belongsTo(User, { foreignKey: 'userId' });
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Product associations
Product.belongsTo(User, { foreignKey: 'userId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Product.hasMany(ProductVariant, { foreignKey: 'productId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }); // Prevent product deletion if in order

// Review associations
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// ProductVariant associations
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Sync all models (optional here, usually done in server.js)
// sequelize.sync({ alter: true });

// Export all models and sequelize instance
export {
  sequelize,
  User,
  Category,
  Product,
  Review,
  ProductVariant,
  Order,
  OrderItem,
};
