import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    description: {
      type: DataTypes.TEXT, // TEXT for longer strings
      defaultValue: '',
    },
    // userId will be added via association
  },
  {
    sequelize,
    modelName: 'Category',
    timestamps: true,
  }
);

export default Category;
