# E-Commerce Platform

A comprehensive e-commerce platform built with MongoDB, Express, React, and Node.js (MERN stack).

## Features

### User Management
- User registration and login
- JWT authentication
- Role-based access control (Admin/Customer)
- User profile management

### Product Management
- Product catalog with categories
- Product variants and specifications
- Image upload and management
- Stock tracking
- Featured products

### Shopping Experience
- Responsive product grid
- Detailed product pages with image galleries
- Category filtering
- Product search
- Related products
- Ratings and reviews

### Order Management
- Shopping cart functionality
- Order creation and processing
- Order status tracking
- Order history
- Order statistics

### Admin Dashboard
- Sales analytics
- Inventory management
- User management
- Order processing
- Content management system (CMS)

### Technical Features
- Responsive design for mobile and desktop
- MongoDB database integration
- RESTful API architecture
- JWT authentication
- Image upload with multer
- Environment-based configuration

## Project Structure

The project is organized into two main directories:

- **backend/** - Node.js Express server with MongoDB
- **frontend/** - React application with Bootstrap

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (or MongoDB Atlas account)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/ryanhellerud1/e-commerce-platform.git
   cd e-commerce-platform
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

#### Frontend

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENV=development
```

For production, update `.env.production` with your production API URL.

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### User Endpoints
- `POST /api/users` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get hierarchical category tree
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/children` - Get category children
- `GET /api/categories/:id/ancestors` - Get category ancestors
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Product Endpoints
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/top` - Get top-rated products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/count` - Get total product count (admin only)
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/reviews` - Create product review (protected)

### Order Endpoints
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/myorders` - Get current user's orders
- `GET /api/orders/stats` - Get order statistics (admin only)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Upload Endpoint
- `POST /api/upload` - Upload image (admin only)

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **UUID** - Unique identifier generation

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Bootstrap** - CSS framework
- **Axios** - HTTP client
- **Font Awesome** - Icons
- **React Context** - State management

## Screenshots

<img width="1778" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/8946ac09-f025-4cc7-af00-34310838fe0a" />
<img width="1705" alt="Product Management" src="https://github.com/user-attachments/assets/6b8ab124-220f-4859-accb-df01454ece0b" />
<img width="1739" alt="Product Form" src="https://github.com/user-attachments/assets/a5c2ddc2-18b8-4bb2-97a3-78f214a384af" />
<img width="1547" alt="Product Variants" src="https://github.com/user-attachments/assets/57eb12bb-7512-4a50-a72e-3e19a039c53c" />
<img width="1547" alt="Storefront" src="https://github.com/user-attachments/assets/57eb12bb-7512-4a50-a72e-3e19a039c53c" />

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


