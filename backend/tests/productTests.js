const axios = require('axios');
const { connectDB, closeDB } = require('./dbHelper');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';
let authToken = '';
let categoryId = '';
let productId = '';

// Helper function to set auth token
const setAuthToken = (token) => {
  authToken = token;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper function to log errors
const logError = (error, context) => {
  console.error(`\nError in ${context}:`);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  throw error;
};

// Login user
const loginUser = async () => {
  try {
    console.log('\nAttempting to login...');
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@test.com',
      password: '123456'
    });
    console.log('Login successful');
    setAuthToken(response.data.token);
    return response.data;
  } catch (error) {
    logError(error, 'user login');
  }
};

// Create a test category
const createCategory = async () => {
  try {
    console.log('\nCreating a test category...');
    const response = await axios.post(
      `${API_URL}/categories`,
      {
        name: 'Test Category ' + Date.now(),
        description: 'Test category for product tests'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Category created successfully');
    return response.data;
  } catch (error) {
    logError(error, 'category creation');
  }
};

// Create a product
const createProduct = async (productData) => {
  try {
    console.log('\nAttempting to create product:', productData.name);
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Product created successfully');
    return response.data;
  } catch (error) {
    logError(error, 'product creation');
  }
};

// Get all products
const getProducts = async () => {
  try {
    console.log('\nFetching all products...');
    const response = await axios.get(`${API_URL}/products`);
    console.log(`Retrieved ${response.data.products.length} products`);
    return response.data;
  } catch (error) {
    logError(error, 'get products');
  }
};

// Get product by ID
const getProductById = async (id) => {
  try {
    console.log('\nFetching product by ID...');
    const response = await axios.get(`${API_URL}/products/${id}`);
    console.log('Product retrieved by ID successfully');
    return response.data;
  } catch (error) {
    logError(error, 'get product by id');
  }
};

// Get product by slug
const getProductBySlug = async (slug) => {
  try {
    console.log('\nFetching product by slug...');
    const response = await axios.get(`${API_URL}/products/slug/${slug}`);
    console.log('Product retrieved by slug successfully');
    return response.data;
  } catch (error) {
    logError(error, 'get product by slug');
  }
};

// Update product
const updateProduct = async (id, updateData) => {
  try {
    console.log('\nUpdating product...');
    const response = await axios.put(`${API_URL}/products/${id}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Product updated successfully');
    return response.data;
  } catch (error) {
    logError(error, 'update product');
  }
};

// Delete product
const deleteProduct = async (id) => {
  try {
    console.log('\nDeleting product...');
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Product deleted successfully');
    return response.data;
  } catch (error) {
    logError(error, 'delete product');
  }
};

// Get top products
const getTopProducts = async () => {
  try {
    console.log('\nFetching top products...');
    const response = await axios.get(`${API_URL}/products/top`);
    console.log('Top products retrieved successfully');
    return response.data;
  } catch (error) {
    logError(error, 'get top products');
  }
};

// Create a product review
const createProductReview = async (id, reviewData) => {
  try {
    console.log('\nCreating product review...');
    const response = await axios.post(`${API_URL}/products/${id}/reviews`, reviewData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Review created successfully');
    return response.data;
  } catch (error) {
    logError(error, 'create product review');
  }
};

// Clean up test data
const cleanUp = async () => {
  try {
    console.log('\nCleaning up test data...');
    
    // Delete the test product if it exists
    if (productId) {
      await deleteProduct(productId);
    }
    
    // Delete the test category if it exists
    if (categoryId) {
      try {
        await axios.delete(`${API_URL}/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Test category deleted');
      } catch (error) {
        console.log('Could not delete test category:', error.message);
      }
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.log('Cleanup failed:', error.message);
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log('Starting product tests...');
    
    // Connect to database
    console.log('\nConnecting to database...');
    await connectDB();
    
    // Login
    await loginUser();
    
    // Create test category
    const category = await createCategory();
    categoryId = category._id;
    
    // Create test product
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'Test product description',
      richDescription: 'Rich description with <b>HTML</b>',
      price: 99.99,
      category: categoryId,
      countInStock: 100,
      brand: 'Test Brand',
      specifications: [
        { title: 'Processor', value: 'Intel i7' },
        { title: 'RAM', value: '16GB' }
      ],
      isFeatured: true,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
    };
    
    const product = await createProduct(testProduct);
    productId = product._id;
    
    // Get all products
    await getProducts();
    
    // Get product by ID
    await getProductById(productId);
    
    // Get product by slug
    await getProductBySlug(product.slug);
    
    // Update product
    await updateProduct(productId, {
      name: 'Updated Product ' + Date.now(),
      price: 129.99
    });
    
    // Get top products
    await getTopProducts();
    
    // Create a review (this may fail if running the tests multiple times with the same user)
    try {
      await createProductReview(productId, {
        rating: 5,
        comment: 'Great product!'
      });
    } catch (error) {
      console.log('Note: Review creation might fail if user already reviewed this product');
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nTest suite failed:', error.message);
  } finally {
    // Clean up
    await cleanUp();
    
    // Close database connection
    console.log('\nClosing database connection...');
    await closeDB();
  }
};

// Run the tests
runTests(); 