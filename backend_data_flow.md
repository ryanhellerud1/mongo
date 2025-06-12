# Backend Data Flow Documentation

This document explains how data moves through the backend system, from client requests to database interactions, highlighting the roles of different components and middleware.

## 1. High-Level Overview

The backend data flow follows a typical Model-View-Controller (MVC) pattern, adapted for an API architecture:

1.  **Client (Frontend):** A user interacts with the frontend application (likely built with React). This interaction triggers an HTTP request to the backend API (e.g., when a user tries to log in or fetch product data).
2.  **Routes (`backend/routes/`):** The Express.js router receives the request. Based on the URL and HTTP method (GET, POST, PUT, DELETE), it directs the request to the appropriate controller function.
3.  **Middleware (`backend/middleware/`):** Before the controller handles the request, it might pass through one or more middleware functions. These can perform tasks like authentication, authorization, error handling, or request logging.
4.  **Controllers (`backend/controllers/`):** The designated controller function processes the request. This involves:
    *   Validating input data.
    *   Executing business logic (e.g., checking if a user exists, calculating prices).
    *   Interacting with Models to fetch or save data to the database.
5.  **Models (`backend/models/`):** Mongoose models define the schema for data in MongoDB and provide methods to interact with the database (create, read, update, delete - CRUD operations). Controllers use these models to perform database operations.
6.  **Database (MongoDB):** The data is stored and retrieved from a MongoDB database. Mongoose acts as an Object Data Mapper (ODM) between the Node.js application and MongoDB.
7.  **Response:** The controller sends an HTTP response (often in JSON format) back to the client, containing the requested data or a status message.

**Main Technologies:**

*   **Frontend (Client-side):** React (assumed, typical for such backends)
*   **Backend (Server-side):** Node.js with Express.js framework
*   **Database Interaction (ODM):** Mongoose
*   **Database:** MongoDB

## 2. Role of Key Components

### Routes (`backend/routes/`)

*   **Purpose:** Define the API endpoints. They map specific URL paths and HTTP methods to corresponding controller functions.
*   **Example (`backend/routes/userRoutes.js`):**
    *   `router.post('/login', authUser);` maps a `POST` request to `/api/users/login` to the `authUser` function in `userController.js`.
    *   `router.route('/').post(registerUser).get(protect, admin, getUsers);` maps:
        *   `POST` to `/api/users` to `registerUser`.
        *   `GET` to `/api/users` to `getUsers`, but only after passing through `protect` and `admin` middleware.
*   They act as the entry point for all client requests to the backend.

### Controllers (`backend/controllers/`)

*   **Purpose:** Handle the business logic for incoming requests. They orchestrate the interaction between the client, models, and other services.
*   **Responsibilities:**
    *   Receiving request objects (`req`) and preparing response objects (`res`).
    *   Extracting data from request parameters, query strings, or request body.
    *   Validating incoming data.
    *   Calling model methods to interact with the database (e.g., `User.findOne()`, `product.save()`).
    *   Performing calculations or transformations on data.
    *   Sending appropriate HTTP responses with status codes and JSON data.
*   **Example (`backend/controllers/userController.js` - `registerUser`):**
    1.  Extracts `name`, `email`, `password` from `req.body`.
    2.  Checks if a user with the given email already exists using `User.findOne()`.
    3.  If not, creates a new user with `User.create()`.
    4.  Generates a JWT token.
    5.  Sends a `201 Created` response with user details and the token.

### Models (`backend/models/`)

*   **Purpose:** Define the structure of the data and provide an interface for interacting with the MongoDB database.
*   **Responsibilities:**
    *   Defining schemas (blueprints) for documents in MongoDB collections (e.g., `userSchema`, `productSchema`).
    *   Specifying data types, validation rules, default values, and relationships between different data entities (e.g., `ref: 'User'`).
    *   Providing static methods (e.g., `User.findById()`) and instance methods (e.g., `user.matchPassword()`) for CRUD operations and other data manipulations.
    *   Encapsulating pre/post save hooks for actions like password hashing or slug generation.
*   **Example (`backend/models/userModel.js`):**
    *   Defines fields like `name`, `email`, `password`, `isAdmin`.
    *   Includes a `pre('save')` hook to hash passwords before saving.
    *   Provides a `matchPassword` method to compare passwords.

### Middleware (`backend/middleware/`)

Middleware functions are executed sequentially during the request-response cycle. They have access to the request (`req`), response (`res`), and the `next` middleware function in the application’s request-response cycle.

*   **`authMiddleware.js`**:
    *   **`protect`**:
        *   **Purpose:** Secures routes that require user authentication.
        *   **Flow:**
            1.  Checks for a JSON Web Token (JWT) in HTTP cookies (`req.cookies.jwt`) or the `Authorization` header (`Bearer <token>`).
            2.  If a token is found, it verifies the token using `jwt.verify()` and the `JWT_SECRET`.
            3.  If verification is successful, it decodes the token to get the user ID.
            4.  Fetches the user details from the `User` model using the ID (excluding the password).
            5.  Attaches the user object to the `req` object (`req.user`).
            6.  Calls `next()` to pass control to the next middleware or controller.
            7.  If the token is missing or invalid, it sends a `401 Unauthorized` error.
    *   **`admin`**:
        *   **Purpose:** Restricts access to routes that are only for administrators. It should be used *after* the `protect` middleware.
        *   **Flow:**
            1.  Checks if `req.user` exists and if `req.user.isAdmin` is `true`.
            2.  If both conditions are met, it calls `next()`.
            3.  Otherwise, it sends a `401 Unauthorized` error with the message "Not authorized as an admin".

*   **`errorMiddleware.js`**:
    *   **`notFound`**:
        *   **Purpose:** Handles requests for routes that do not exist (404 errors).
        *   **Flow:** If no route matches the request URL, this middleware is triggered. It creates an `Error` object with a "Not Found" message and sets the response status to `404`. It then passes the error to the next error-handling middleware.
    *   **`errorHandler`**:
        *   **Purpose:** A global error handler that catches errors occurring in route handlers and other middleware.
        *   **Flow:**
            1.  Determines the HTTP status code. If the status code is `200` (OK) but an error occurred, it defaults to `500` (Internal Server Error).
            2.  Handles specific Mongoose errors, like `CastError` for invalid ObjectIds, by setting a `404` status and a "Resource not found" message.
            3.  Sends a JSON response containing the error message and, in non-production environments, the error stack trace.

*   **`asyncHandler.js`**:
    *   **Purpose:** A utility function that wraps asynchronous route handlers (controllers) to automatically catch any promise rejections and pass them to the `next` error-handling middleware (`errorHandler`). This avoids the need for explicit `try...catch` blocks in every async controller function.
    *   **Flow:** It takes an async function (`fn`) as input and returns a new function that, when executed, calls `fn(req, res, next)` and attaches a `.catch(next)` to its promise.

## 3. Concrete Data Flow Examples

### Example 1: User Registration & Login

**A. User Registration**

*   **Path:** `POST /api/users`
*   **Flow:**
    1.  **Frontend:** User submits a registration form (name, email, password).
    2.  **Client Request:** Frontend sends a `POST` request to `/api/users` with the user data in the request body.
    3.  **`backend/server.js`:** Express receives the request.
    4.  **`backend/routes/userRoutes.js`:** The route `router.post('/', registerUser);` matches. The `registerUser` controller function is invoked.
    5.  **`backend/controllers/userController.js` (`registerUser` function):**
        *   Extracts `name`, `email`, `password` from `req.body`.
        *   Queries the `User` model: `User.findOne({ email })` to check if the user already exists.
        *   If the user doesn't exist, it calls `User.create({ name, email, password })`.
    6.  **`backend/models/userModel.js` (`User` model):**
        *   The `pre('save')` hook is triggered before saving the new user.
        *   The hook hashes the plain text `password` using `bcrypt.hash()`.
        *   The new user document (with the hashed password) is saved to the MongoDB `users` collection.
    7.  **`backend/controllers/userController.js` (`registerUser` function continued):**
        *   If user creation is successful, it calls `generateToken(res, user._id)`.
    8.  **`backend/utils/generateToken.js` (`generateToken` function):**
        *   Creates a JWT using `jwt.sign()` with the user's ID and `JWT_SECRET`.
        *   Sets this token as an HTTP-only cookie in the response (`res.cookie('jwt', ...)`).
        *   Returns the token string.
    9.  **`backend/controllers/userController.js` (`registerUser` function continued):**
        *   Sends a `201 Created` JSON response to the client, including user details (`_id`, `name`, `email`, `isAdmin`) and the `token`.
    10. **Client Response:** Frontend receives the response, stores user info and token (e.g., in local storage or context), and typically redirects the user.

**B. User Login**

*   **Path:** `POST /api/users/login`
*   **Flow:**
    1.  **Frontend:** User submits a login form (email, password).
    2.  **Client Request:** Frontend sends a `POST` request to `/api/users/login` with credentials in the request body.
    3.  **`backend/routes/userRoutes.js`:** The route `router.post('/login', authUser);` matches. The `authUser` controller function is invoked.
    4.  **`backend/controllers/userController.js` (`authUser` function):**
        *   Extracts `email` and `password` from `req.body`.
        *   Queries the `User` model: `User.findOne({ email })`.
    5.  **`backend/models/userModel.js` (`User` model):**
        *   If a user with the email is found, the `user.matchPassword(password)` method is called.
        *   This method uses `bcrypt.compare()` to compare the submitted plain text password with the stored hashed password.
    6.  **`backend/controllers/userController.js` (`authUser` function continued):**
        *   If the user exists and the password matches:
            *   Calls `generateToken(res, user._id)` (same as in registration).
            *   Sends a `200 OK` JSON response with user details and the token.
        *   If authentication fails (user not found or password incorrect), it throws an error.
    7.  **`backend/middleware/errorMiddleware.js` (`errorHandler`):** If an error was thrown (e.g., "Invalid email or password"), this middleware catches it and sends a `401 Unauthorized` response.
    8.  **Client Response:** Frontend receives the response. On success, it stores user info and token. On failure, it displays an error message.

### Example 2: Admin Creating a Product

*   **Path:** `POST /api/products`
*   **Flow:**
    1.  **Frontend (Admin Panel):** An admin user fills out a form to create a new product (name, price, category, etc.) and submits it.
    2.  **Client Request:** Frontend sends a `POST` request to `/api/products` with the product data in the request body and the admin's JWT (usually in an HTTP-only cookie or Authorization header).
    3.  **`backend/routes/productRoutes.js`:** The route `router.route('/').post(protect, admin, createProduct);` matches.
    4.  **`backend/middleware/authMiddleware.js` (`protect` middleware):**
        *   Extracts and verifies the JWT.
        *   Fetches the admin user's details from the `User` model and attaches them to `req.user`.
        *   Calls `next()`.
    5.  **`backend/middleware/authMiddleware.js` (`admin` middleware):**
        *   Checks if `req.user` exists and `req.user.isAdmin` is `true`.
        *   If true, calls `next()`. Otherwise, sends a `401 Unauthorized` error.
    6.  **`backend/controllers/productController.js` (`createProduct` function):**
        *   If middleware checks pass, this function is executed.
        *   Creates a new `Product` instance with default/sample data and `user: req.user._id` (associating the product with the logged-in admin). It also requires a `category` ID (which might be a default or sent in `req.body.category`).
        *   The `slug` is generated with a simple timestamp initially.
    7.  **`backend/models/productModel.js` (`Product` model):**
        *   The `pre('save')` hook for slug generation is triggered. If the `name` was 'Sample name', the slug might be based on that or the default one provided in the controller.
        *   The new product document is saved to the MongoDB `products` collection.
    8.  **`backend/controllers/productController.js` (`createProduct` function continued):**
        *   Sends a `201 Created` JSON response with the newly created product data.
    9.  **Client Response:** Admin frontend receives the new product data and updates the UI.

### Example 3: Customer Placing an Order

*   **Path:** `POST /api/orders`
*   **Flow:**
    1.  **Frontend (Customer):** User has items in their cart and proceeds to checkout. They provide shipping information and payment method, then click "Place Order".
    2.  **Client Request:** Frontend sends a `POST` request to `/api/orders` with order details (order items, shipping address, payment method, prices) in the request body and the user's JWT.
    3.  **`backend/routes/orderRoutes.js`:** The route `router.post('/', protect, createOrder);` matches.
    4.  **`backend/middleware/authMiddleware.js` (`protect` middleware):**
        *   Extracts and verifies the JWT.
        *   Fetches the user's details from the `User` model and attaches them to `req.user`.
        *   Calls `next()`.
    5.  **`backend/controllers/orderController.js` (`createOrder` function):**
        *   Extracts order data from `req.body`.
        *   Checks if `orderItems` is empty; if so, throws a `400` error.
        *   Creates a new `Order` instance. It maps `orderItems` from the request, ensuring the `product` field in each item is the product ID. It sets `user: req.user._id`.
    6.  **`backend/models/orderModel.js` (`Order` model):**
        *   The `pre('save')` hook for calculating `itemsPrice` and `totalPrice` is triggered (though in this controller, these prices are sent from the client, which is common if calculations are done client-side first; the hook might act as a server-side validation or recalculation if needed or if client-side prices are not trusted).
    7.  **`backend/controllers/orderController.js` (`createOrder` function continued):**
        *   **Stock Update (Interaction with `Product` model):**
            *   Iterates through each `item` in `orderItems`.
            *   For each item, it finds the corresponding `Product` in the database: `Product.findById(item.product)`.
            *   If the product is found, it decrements `product.countInStock` by `item.qty`.
            *   Saves the updated product: `product.save()`. This ensures data consistency.
        *   Saves the new order: `createdOrder = await order.save()`.
    8.  **`backend/models/orderModel.js` (`Order` model continued):**
        *   The order document, with all its details and calculated prices (if the hook is active for recalculation), is saved to the MongoDB `orders` collection.
    9.  **`backend/controllers/orderController.js` (`createOrder` function continued):**
        *   Sends a `201 Created` JSON response with the newly created order data.
    10. **Client Response:** Frontend receives the new order data, clears the cart, and typically redirects the user to an order confirmation or payment page.

This detailed flow illustrates how different components of the backend interact to process requests, manage data, and enforce security and business rules.
