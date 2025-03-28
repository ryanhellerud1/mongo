const axios = require('axios');
const { connectDB, closeDB } = require('./dbHelper');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';
let authToken = '';
let electronicsId = '';
let smartphonesId = '';

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

// Test user registration
const registerUser = async () => {
  try {
    console.log('\nAttempting to register admin user...');
    const response = await axios.post(`${API_URL}/users`, {
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      isAdmin: true
    });
    console.log('User registered successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'user registration');
  }
};

// Test user login
const loginUser = async () => {
  try {
    console.log('\nAttempting to login...');
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@test.com',
      password: '123456'
    });
    console.log('Login successful:', response.data);
    setAuthToken(response.data.token);
    return response.data;
  } catch (error) {
    logError(error, 'user login');
  }
};

// Test category creation
const createCategory = async (categoryData) => {
  try {
    console.log('\nAttempting to create category:', categoryData.name);
    const response = await axios.post(`${API_URL}/categories`, categoryData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Category created successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'category creation');
  }
};

// Test getting all categories
const getCategories = async () => {
  try {
    console.log('\nAttempting to get all categories...');
    const response = await axios.get(`${API_URL}/categories`);
    console.log('Categories retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'get categories');
  }
};

// Test getting category tree
const getCategoryTree = async () => {
  try {
    console.log('\nAttempting to get category tree...');
    const response = await axios.get(`${API_URL}/categories/tree`);
    console.log('Category tree retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'get category tree');
  }
};

// Test getting single category
const getCategory = async (id) => {
  try {
    console.log('\nAttempting to get single category...');
    const response = await axios.get(`${API_URL}/categories/${id}`);
    console.log('Single category retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'get single category');
  }
};

// Test getting category children
const getCategoryChildren = async (id) => {
  try {
    console.log('\nAttempting to get category children...');
    const response = await axios.get(`${API_URL}/categories/${id}/children`);
    console.log('Category children retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'get category children');
  }
};

// Test getting category ancestors
const getCategoryAncestors = async (id) => {
  try {
    console.log('\nAttempting to get category ancestors...');
    const response = await axios.get(`${API_URL}/categories/${id}/ancestors`);
    console.log('Category ancestors retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'get category ancestors');
  }
};

// Test updating category
const updateCategory = async (id, updateData) => {
  try {
    console.log('\nAttempting to update category...');
    const response = await axios.put(`${API_URL}/categories/${id}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Category updated successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'update category');
  }
};

// Test deleting category
const deleteCategory = async (id) => {
  try {
    console.log('\nAttempting to delete category...');
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Category deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    logError(error, 'delete category');
  }
};

// Helper function to clear existing test categories
const clearTestCategories = async () => {
  try {
    console.log('\nClearing any existing test categories...');
    
    // Try to find categories by name and delete them
    const categories = await axios.get(`${API_URL}/categories`);
    for (const category of categories.data) {
      if (category.name === 'Electronics' || 
          category.name === 'Smartphones' ||
          category.name === 'Updated Electronics' ||
          category.name === 'Electronics 2023' ||
          category.name.includes('Test')) {
        try {
          await axios.delete(`${API_URL}/categories/${category._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log(`Deleted existing category: ${category.name}`);
        } catch (error) {
          // Ignore errors - just trying to clean up
        }
      }
    }
    console.log('Clean-up completed');
  } catch (error) {
    console.log('Clean-up failed, but continuing with tests:', error.message);
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log('Starting category tests...\n');

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();

    // 1. Login or register if login fails
    try {
      console.log('\nAttempting to login first...');
      await loginUser();
    } catch (error) {
      console.log('Login failed, attempting to register...');
      await registerUser();
      await loginUser();
    }
    
    // 1.5 Clear any existing test categories from previous runs
    await clearTestCategories();

    // 2. Create root category (Electronics)
    const electronics = await createCategory({
      name: 'Electronics Test ' + Date.now(),
      description: 'Electronic devices and accessories',
      image: 'https://example.com/electronics.jpg'
    });
    electronicsId = electronics._id;

    // 3. Create subcategory (Smartphones)
    const smartphones = await createCategory({
      name: 'Smartphones Test ' + Date.now(),
      description: 'Mobile phones and accessories',
      parent: electronicsId,
      image: 'https://example.com/smartphones.jpg'
    });
    smartphonesId = smartphones._id;

    // 4. Get all categories
    await getCategories();

    // 5. Get category tree
    await getCategoryTree();

    // 6. Get single category
    await getCategory(electronicsId);

    // 7. Get category children
    await getCategoryChildren(electronicsId);

    // 8. Get category ancestors
    await getCategoryAncestors(smartphonesId);

    // 9. Update category
    await updateCategory(electronicsId, {
      name: 'Updated Electronics Test ' + Date.now(),
      description: 'Updated description'
    });

    // 10. Delete categories (in reverse order)
    await deleteCategory(smartphonesId);
    await deleteCategory(electronicsId);

    console.log('\nAll tests completed successfully!');
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