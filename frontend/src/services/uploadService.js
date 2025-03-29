import axios from 'axios';

/**
 * Upload an image to the server
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  try {
    // Get authentication token from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token || '';
    
    // Create form data to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    // Set up headers with auth token
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };
    
    // Make the API call
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/upload`,
      formData,
      config
    );
    
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images to the server
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<string[]>} - Array of URLs of the uploaded images
 */
export const uploadMultipleImages = async (files) => {
  try {
    // Upload each file and collect promises
    const uploadPromises = Array.from(files).map(file => uploadImage(file));
    
    // Wait for all uploads to complete
    const imageUrls = await Promise.all(uploadPromises);
    
    return imageUrls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload one or more images');
  }
}; 