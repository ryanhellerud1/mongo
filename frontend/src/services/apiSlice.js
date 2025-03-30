import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API base URL
const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api';

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('userInfo') 
        ? JSON.parse(localStorage.getItem('userInfo')).token
        : null;
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'User', 'Category'],
  endpoints: (builder) => ({}),
}); 