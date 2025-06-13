import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://postgres:your_password@localhost:5432/your_database_name', {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

export default sequelize;
