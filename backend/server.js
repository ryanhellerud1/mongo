import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import { Sequelize } from 'sequelize'; // Removed, as sequelize instance is now imported
import sequelize from './config/database.js'; // Import from new config file
// import './models/sql/userSqlModel.js'; // Removed, as models are now imported via index.js
import './models/sql/index.js'; // Import model definitions and associations

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB Connection Error:', err));

// Sequelize initialization and connection
// const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://user:password@host:port/database', {
//   dialect: 'postgres',
//   logging: console.log, // Optional: enable logging for debugging
// });

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL Connected');
    // Sync all defined models to the DB.
    // 'alter: true' attempts to make changes to existing tables to match the model definitions.
    // For production, migrations are a safer approach.
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized with models.');
  })
  .catch(err => {
    console.error('PostgreSQL Connection or Sync Error:', err);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
