# Backend Data Structure Documentation

## 1. User Model (`userModel.js`)

**Purpose:** Represents a user in the system. This model stores user credentials, personal information, and administrative status.

**Fields:**

*   **`name`**:
    *   Data Type: `String`
    *   `required`: true
    *   Purpose: The full name of the user.
*   **`email`**:
    *   Data Type: `String`
    *   `required`: true
    *   `unique`: true
    *   `lowercase`: true
    *   Purpose: The email address of the user, used for login and communication. It's unique and stored in lowercase.
*   **`password`**:
    *   Data Type: `String`
    *   `required`: true
    *   Purpose: The hashed password for user authentication.
*   **`isAdmin`**:
    *   Data Type: `Boolean`
    *   `required`: true
    *   `default`: false
    *   Purpose: Indicates if the user has administrative privileges. Defaults to `false`.
*   **`timestamps`**:
    *   Data Type: `Object` (automatically managed by Mongoose)
    *   Purpose: Adds `createdAt` and `updatedAt` fields to the document, tracking when it was created and last updated.

**Relationships:**

*   A `User` can be referenced by `Category` (in the `user` field).
*   A `User` can be referenced by `Product` (in the `user` field).
*   A `User` can be referenced by `Review` (in `productSchema`'s `reviews.user` field).
*   A `User` can be referenced by `Order` (in the `user` field).

**Virtuals/Methods/Hooks:**

*   **`matchPassword(enteredPassword)` method:**
    *   Purpose: Compares an entered password with the stored hashed password to validate login attempts. Uses `bcrypt.compare`.
*   **`pre('save')` hook:**
    *   Purpose: Automatically hashes the password using `bcrypt` before saving a new user or when the password field is modified. It generates a salt and then hashes the password.

## 2. Category Model (`categoryModel.js`)

**Purpose:** Represents a category for organizing products.

**Fields:**

*   **`name`**:
    *   Data Type: `String`
    *   `required`: true
    *   `trim`: true
    *   Purpose: The name of the category. Whitespace will be trimmed.
*   **`description`**:
    *   Data Type: `String`
    *   `default`: `''` (empty string)
    *   Purpose: A brief description of the category.
*   **`user`**:
    *   Data Type: `mongoose.Schema.Types.ObjectId`
    *   `ref`: `'User'`
    *   `required`: true
    *   Purpose: References the `User` who created this category.
*   **`timestamps`**:
    *   Data Type: `Object` (automatically managed by Mongoose)
    *   Purpose: Adds `createdAt` and `updatedAt` fields.

**Relationships:**

*   Belongs to one `User` (who created it).
*   Can be referenced by `Product` (in the `category` field).

## 3. Product Model (`productModel.js`)

**Purpose:** Represents a product available for sale in the application. It includes details, pricing, stock information, reviews, and variants.

**Sub-Schemas:**

*   **`reviewSchema`**:
    *   **`user`**:
        *   Data Type: `mongoose.Schema.Types.ObjectId`
        *   `required`: true
        *   `ref`: `'User'`
        *   Purpose: References the `User` who wrote the review.
    *   **`name`**:
        *   Data Type: `String`
        *   `required`: true
        *   Purpose: The name of the reviewer (likely denormalized from the User model for display).
    *   **`rating`**:
        *   Data Type: `Number`
        *   `required`: true
        *   `min`: 1
        *   `max`: 5
        *   Purpose: The rating given by the user (1 to 5 stars).
    *   **`comment`**:
        *   Data Type: `String`
        *   `required`: true
        *   Purpose: The text content of the review.
    *   **`timestamps`**:
        *   Data Type: `Object`
        *   Purpose: Adds `createdAt` and `updatedAt` for the review.

*   **`productVariantSchema`**:
    *   **`name`**:
        *   Data Type: `String`
        *   `required`: true
        *   Purpose: The name of the product variant (e.g., "Color", "Size").
    *   **`price`**:
        *   Data Type: `Number`
        *   `required`: true
        *   `default`: 0
        *   Purpose: The price of this specific variant. Overrides the main product price if present.
    *   **`countInStock`**:
        *   Data Type: `Number`
        *   `required`: true
        *   `default`: 0
        *   Purpose: The stock quantity for this specific variant.
    *   **`sku`**:
        *   Data Type: `String`
        *   Purpose: Stock Keeping Unit for this variant, if applicable.

**Fields (Main `productSchema`):**

*   **`user`**:
    *   Data Type: `mongoose.Schema.Types.ObjectId`
    *   `required`: true
    *   `ref`: `'User'`
    *   Purpose: References the `User` who created or manages this product.
*   **`name`**:
    *   Data Type: `String`
    *   `required`: true
    *   Purpose: The name of the product.
*   **`images`**:
    *   Data Type: `Array` of `String`
    *   `required`: true (for each string in the array)
    *   Purpose: An array of URLs or paths to the product images.
*   **`description`**:
    *   Data Type: `String`
    *   `required`: true
    *   Purpose: A detailed description of the product.
*   **`variants`**:
    *   Data Type: `Array` of `productVariantSchema`
    *   Purpose: Stores different variations of the product (e.g., different sizes, colors with their own prices and stock).
*   **`brand`**:
    *   Data Type: `String`
    *   Purpose: The brand name of the product.
*   **`category`**:
    *   Data Type: `mongoose.Schema.Types.ObjectId`
    *   `ref`: `'Category'`
    *   `required`: true
    *   Purpose: References the `Category` to which this product belongs.
*   **`reviews`**:
    *   Data Type: `Array` of `reviewSchema`
    *   Purpose: Stores all reviews submitted for this product.
*   **`rating`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0
    *   Purpose: The average rating of the product, calculated from `reviews`.
*   **`numReviews`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0
    *   Purpose: The total number of reviews for this product.
*   **`price`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0
    *   Purpose: The base price of the product. This might be overridden by `variants`.
*   **`countInStock`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0
    *   Purpose: The total stock quantity for the product (if not using variants, or as a sum of variants).
*   **`isFeatured`**:
    *   Data Type: `Boolean`
    *   `default`: false
    *   Purpose: Indicates if the product is a featured product.
*   **`slug`**:
    *   Data Type: `String`
    *   `required`: true
    *   `unique`: true
    *   Purpose: A URL-friendly version of the product name, used for SEO-friendly URLs.
*   **`timestamps`**:
    *   Data Type: `Object`
    *   Purpose: Adds `createdAt` and `updatedAt` fields.

**Relationships:**

*   Belongs to one `User` (who created it).
*   Belongs to one `Category`.
*   Can have many `Reviews` (embedded sub-documents). Each `Review` is associated with a `User`.
*   Can have many `ProductVariants` (embedded sub-documents).
*   Referenced by `Order` items.

**Virtuals/Methods/Hooks:**

*   **`pre('save')` hook (slug generation):**
    *   Purpose: Automatically generates a URL-friendly `slug` from the product `name` before saving if the name is modified. (Note: `slugify` function is used but not defined in the provided snippet; it's assumed to be an external utility).
*   **`url` virtual:**
    *   Purpose: Generates a relative URL path for the product using its slug (e.g., `/products/my-product-slug`).
*   **`updateRatingStats()` method:**
    *   Purpose: Calculates and updates the `rating` and `numReviews` fields based on the current `reviews` array. It then saves the product.

## 4. Order Model (`orderModel.js`)

**Purpose:** Represents a customer's order, including items purchased, shipping details, payment information, and order status.

**Fields:**

*   **`user`**:
    *   Data Type: `mongoose.Schema.Types.ObjectId`
    *   `required`: true
    *   `ref`: `'User'`
    *   Purpose: References the `User` who placed the order.
*   **`orderItems`**:
    *   Data Type: `Array` of `Object`
    *   Each object contains:
        *   **`name`**: `String`, `required`: true (Product name)
        *   **`qty`**: `Number`, `required`: true (Quantity ordered)
        *   **`image`**: `String`, `required`: true (Product image URL)
        *   **`price`**: `Number`, `required`: true (Price at the time of order)
        *   **`product`**: `mongoose.Schema.Types.ObjectId`, `required`: true, `ref`: `'Product'` (Reference to the `Product`)
    *   Purpose: An array of items included in the order.
*   **`shippingAddress`**:
    *   Data Type: `Object`
    *   Contains:
        *   **`address`**: `String`, `required`: true
        *   **`city`**: `String`, `required`: true
        *   **`postalCode`**: `String`, `required`: true
        *   **`country`**: `String`, `required`: true
        *   **`fullName`**: `String`, `required`: true
        *   **`phone`**: `String`, `required`: true
    *   Purpose: The address where the order will be shipped.
*   **`paymentMethod`**:
    *   Data Type: `String`
    *   `required`: true
    *   Purpose: The method used for payment (e.g., "PayPal", "Credit Card").
*   **`paymentResult`**:
    *   Data Type: `Object`
    *   Contains:
        *   **`id`**: `String` (Transaction ID from payment provider)
        *   **`status`**: `String` (Payment status)
        *   **`update_time`**: `String` (Timestamp of payment update)
        *   **`email_address`**: `String` (Payer's email from payment provider)
    *   Purpose: Stores details returned by the payment processor.
*   **`itemsPrice`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0.0
    *   Purpose: The total price of all items in the order, excluding tax and shipping.
*   **`taxPrice`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0.0
    *   Purpose: The amount of tax applied to the order.
*   **`shippingPrice`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0.0
    *   Purpose: The cost of shipping for the order.
*   **`totalPrice`**:
    *   Data Type: `Number`
    *   `required`: true
    *   `default`: 0.0
    *   Purpose: The final total price of the order (itemsPrice + taxPrice + shippingPrice).
*   **`isPaid`**:
    *   Data Type: `Boolean`
    *   `required`: true
    *   `default`: false
    *   Purpose: Indicates if the order has been paid.
*   **`paidAt`**:
    *   Data Type: `Date`
    *   Purpose: The date and time when the order was paid.
*   **`isDelivered`**:
    *   Data Type: `Boolean`
    *   `required`: true
    *   `default`: false
    *   Purpose: Indicates if the order has been delivered.
*   **`deliveredAt`**:
    *   Data Type: `Date`
    *   Purpose: The date and time when the order was delivered.
*   **`status`**:
    *   Data Type: `String`
    *   `required`: true
    *   `enum`: `['pending', 'processing', 'shipped', 'delivered', 'cancelled']`
    *   `default`: `'pending'`
    *   Purpose: The current status of the order.
*   **`trackingNumber`**:
    *   Data Type: `String`
    *   Purpose: The tracking number for the shipment, if applicable.
*   **`timestamps`**:
    *   Data Type: `Object`
    *   Purpose: Adds `createdAt` and `updatedAt` fields.

**Relationships:**

*   Belongs to one `User`.
*   Contains multiple `orderItems`, where each item references a `Product`.

**Virtuals/Methods/Hooks:**

*   **`orderNumber` virtual:**
    *   Purpose: Generates a user-friendly order number (e.g., `ORD-XXXXXX`) based on the last 8 characters of the order's `_id`.
*   **`pre('save')` hook (price calculation):**
    *   Purpose: Automatically calculates `itemsPrice` by summing up `price * qty` for all `orderItems`. Then, it calculates `totalPrice` by adding `itemsPrice`, `shippingPrice`, and `taxPrice`. This occurs if `orderItems` is modified or if the order is new. The prices are formatted to two decimal places.

---
This documentation provides a detailed overview of each Mongoose model, its fields, their configurations, purposes, and how they relate to other models in the system. It also highlights important methods, virtuals, and hooks that contribute to the models' functionalities.
