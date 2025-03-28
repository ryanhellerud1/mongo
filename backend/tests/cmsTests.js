const axios = require('axios');
const { connectDB, closeDB } = require('./dbHelper');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';
let authToken = '';

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

// Test dashboard stats
const testDashboardStats = async () => {
  try {
    console.log('\nFetching dashboard statistics...');
    const response = await axios.get(`${API_URL}/cms/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Dashboard statistics retrieved successfully');
    console.log('Product Stats:', response.data.productStats);
    console.log('Order Stats Count:', response.data.orderStats.total);
    console.log('User Stats Count:', response.data.userStats.total);
    console.log('Total Revenue:', response.data.revenue.total);
    return response.data;
  } catch (error) {
    logError(error, 'dashboard stats');
  }
};

// Test CMS products
const testCmsProducts = async () => {
  try {
    console.log('\nFetching CMS products...');
    const response = await axios.get(`${API_URL}/cms/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Retrieved ${response.data.products.length} products`);
    console.log('Total Products:', response.data.total);
    console.log('Pages:', response.data.pages);
    return response.data;
  } catch (error) {
    logError(error, 'cms products');
  }
};

// Test CMS products select
const testProductsSelect = async () => {
  try {
    console.log('\nFetching products for select...');
    const response = await axios.get(`${API_URL}/cms/products/select`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Retrieved ${response.data.length} products for select`);
    return response.data;
  } catch (error) {
    logError(error, 'products select');
  }
};

// Test CMS categories select
const testCategoriesSelect = async () => {
  try {
    console.log('\nFetching categories for select...');
    const response = await axios.get(`${API_URL}/cms/categories/select`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Retrieved ${response.data.length} categories for select`);
    return response.data;
  } catch (error) {
    logError(error, 'categories select');
  }
};

// Test CMS orders
const testCmsOrders = async () => {
  try {
    console.log('\nFetching CMS orders...');
    const response = await axios.get(`${API_URL}/cms/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Retrieved ${response.data.orders.length} orders`);
    console.log('Total Orders:', response.data.total);
    console.log('Pages:', response.data.pages);
    return response.data;
  } catch (error) {
    logError(error, 'cms orders');
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log('Starting CMS API tests...');
    
    // Connect to database
    console.log('\nConnecting to database...');
    await connectDB();
    
    // Login
    await loginUser();
    
    // Test CMS endpoints
    await testDashboardStats();
    await testCmsProducts();
    await testProductsSelect();
    await testCategoriesSelect();
    await testCmsOrders();
    
    console.log('\nAll CMS API tests completed successfully!');
  } catch (error) {
    console.error('\nTest suite failed:', error.message);
  } finally {
    // Close database connection
    console.log('\nClosing database connection...');
    await closeDB();
  }
};

// Run the tests
runTests(); 