const axios = require('axios');
const { connectDB, closeDB } = require('./dbHelper');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';
let authToken = '';
let categoryId = '';
let productId = '';
let orderId = '';

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
        description: 'Test category for order tests'
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

// Create a test product
const createProduct = async (categoryId) => {
  try {
    console.log('\nCreating a test product...');
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'Test product description',
      price: 99.99,
      category: categoryId,
      countInStock: 100,
      brand: 'Test Brand',
      specifications: [
        { title: 'Processor', value: 'Intel i7' },
        { title: 'RAM', value: '16GB' }
      ],
      isFeatured: true,
      images: ['https://example.com/image1.jpg']
    };
    
    const response = await axios.post(`${API_URL}/products`, testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Product created successfully');
    return response.data;
  } catch (error) {
    logError(error, 'product creation');
  }
};

// Create an order
const createOrder = async (productData) => {
  try {
    console.log('\nCreating a test order...');
    
    const orderData = {
      orderItems: [
        {
          product: productData._id,
          name: productData.name,
          image: productData.images[0],
          price: productData.price,
          quantity: 2
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        phone: '123-456-7890'
      },
      paymentMethod: 'PayPal',
      itemsPrice: (productData.price * 2).toFixed(2),
      taxPrice: (productData.price * 2 * 0.1).toFixed(2),
      shippingPrice: '10.00',
      totalPrice: (productData.price * 2 * 1.1 + 10).toFixed(2)
    };
    
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Order created successfully');
    return response.data;
  } catch (error) {
    logError(error, 'order creation');
  }
};

// Get order by ID
const getOrderById = async (id) => {
  try {
    console.log('\nFetching order by ID...');
    const response = await axios.get(`${API_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Order fetched successfully');
    return response.data;
  } catch (error) {
    logError(error, 'get order by id');
  }
};

// Get my orders
const getMyOrders = async () => {
  try {
    console.log('\nFetching my orders...');
    const response = await axios.get(`${API_URL}/orders/myorders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Retrieved ${response.data.length} orders`);
    return response.data;
  } catch (error) {
    logError(error, 'get my orders');
  }
};

// Update order to paid
const updateOrderToPaid = async (id) => {
  try {
    console.log('\nUpdating order to paid...');
    const paymentResult = {
      id: 'PAY-' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: 'test@example.com'
    };
    
    const response = await axios.put(`${API_URL}/orders/${id}/pay`, paymentResult, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Order updated to paid successfully');
    return response.data;
  } catch (error) {
    logError(error, 'update order to paid');
  }
};

// Update order to delivered
const updateOrderToDelivered = async (id) => {
  try {
    console.log('\nUpdating order to delivered...');
    const response = await axios.put(`${API_URL}/orders/${id}/deliver`, 
      { trackingNumber: 'TRACK-' + Date.now() },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Order updated to delivered successfully');
    return response.data;
  } catch (error) {
    logError(error, 'update order to delivered');
  }
};

// Update order status
const updateOrderStatus = async (id, status) => {
  try {
    console.log(`\nUpdating order status to: ${status}...`);
    const response = await axios.put(`${API_URL}/orders/${id}/status`, 
      { 
        status,
        notes: 'Status updated via test'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Order status updated successfully');
    return response.data;
  } catch (error) {
    logError(error, 'update order status');
  }
};

// Cancel order
const cancelOrder = async (id) => {
  try {
    console.log('\nCancelling order...');
    const response = await axios.put(`${API_URL}/orders/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Order cancelled successfully');
    return response.data;
  } catch (error) {
    logError(error, 'cancel order');
  }
};

// Get order stats
const getOrderStats = async () => {
  try {
    console.log('\nFetching order statistics...');
    const response = await axios.get(`${API_URL}/orders/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Order statistics fetched successfully');
    return response.data;
  } catch (error) {
    logError(error, 'get order stats');
  }
};

// Clean up test data
const cleanUp = async () => {
  try {
    console.log('\nCleaning up test data...');
    
    // We don't need to delete the order explicitly since it should be soft-deleted
    
    // Delete the test product if it exists
    if (productId) {
      try {
        await axios.delete(`${API_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Test product deleted');
      } catch (error) {
        console.log('Could not delete test product:', error.message);
      }
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
    console.log('Starting order tests...');
    
    // Connect to database
    console.log('\nConnecting to database...');
    await connectDB();
    
    // Login
    await loginUser();
    
    // Create test category
    const category = await createCategory();
    categoryId = category._id;
    
    // Create test product
    const product = await createProduct(categoryId);
    productId = product._id;
    
    // Create test order
    const order = await createOrder(product);
    orderId = order._id;
    
    // Get order by ID
    await getOrderById(orderId);
    
    // Get my orders
    await getMyOrders();
    
    // Update order to paid
    await updateOrderToPaid(orderId);
    
    // Update order status to shipped
    await updateOrderStatus(orderId, 'shipped');
    
    // Update order to delivered
    await updateOrderToDelivered(orderId);
    
    // Get order stats (admin only)
    await getOrderStats();
    
    // Create another order to test cancellation
    const order2 = await createOrder(product);
    
    // Cancel order
    await cancelOrder(order2._id);
    
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