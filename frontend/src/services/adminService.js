import axios from 'axios';

const API_URL = 'http://localhost:5001/api/cms';

// Create axios instance with auth token and credentials
const createAuthAxios = () => {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // This will include cookies in the request
  });
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  const authAxios = createAuthAxios();
  const response = await authAxios.get(`${API_URL}/dashboard`);
  return response.data;
};

// Get products for admin dashboard
export const getCmsProducts = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status = '', search = '') => {
  const authAxios = createAuthAxios();
  const response = await authAxios.get(`${API_URL}/products`, {
    params: { page, limit, sortBy, sortOrder, status, search }
  });
  return response.data;
};

// Get products for select dropdown
export const getProductsForSelect = async (search = '') => {
  const authAxios = createAuthAxios();
  const response = await authAxios.get(`${API_URL}/products/select`, {
    params: { search }
  });
  return response.data;
};

// Get categories for select dropdown
export const getCategoriesForSelect = async (search = '') => {
  const authAxios = createAuthAxios();
  const response = await authAxios.get(`${API_URL}/categories/select`, {
    params: { search }
  });
  return response.data;
};

// Batch update products status
export const batchUpdateProducts = async (ids, status) => {
  const authAxios = createAuthAxios();
  const response = await authAxios.put(`${API_URL}/products/batch`, {
    ids,
    status
  });
  return response.data;
};

// Get orders for admin dashboard
export const getCmsOrders = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status = '') => {
  const authAxios = createAuthAxios();
  const response = await authAxios.get(`${API_URL}/orders`, {
    params: { page, limit, sortBy, sortOrder, status }
  });
  return response.data;
}; 