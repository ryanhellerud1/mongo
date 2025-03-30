import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies with requests
});

// Add token to all requests if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    // Note: This is only needed if your API supports both cookie and token auth
    // For our application, we're primarily using HTTP-only cookies
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Check authentication status - debugging helper
export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/users/checkAuth');
    return { authenticated: true, user: response.data.user };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false, error };
  }
};

export default api; 