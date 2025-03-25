# Full Stack MERN Application

A simple full stack application built with MongoDB, Express, React, and Node.js.

## Features

- User registration and login
- JWT authentication
- MongoDB database integration
- Responsive UI with Bootstrap

## Project Structure

The project is organized into two main directories:

- **backend/** - Node.js Express server
- **frontend/** - React application

## Setup

### Prerequisites

- Node.js
- MongoDB (or MongoDB Atlas account)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/ryanhellerud1/mongo.git
   cd mongo
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

Create a `.env` file in the backend directory with the following variables:

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

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

- `POST /api/users` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected route)

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React, React Router, Bootstrap, Axios 