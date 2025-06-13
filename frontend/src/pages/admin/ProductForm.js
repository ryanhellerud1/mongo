import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoriesForSelect } from '../../services/adminService';
import { uploadImage, uploadMultipleImages } from '../../services/uploadService';
import axios from 'axios';
import api from '../../services/api';
import './ProductForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    richDescription: '',
    brand: '',
    price: '',
    category: '',
    countInStock: '',
    isFeatured: false,
    status: 'active',
    specifications: [],
    images: []
  });
  const [newSpec, setNewSpec] = useState({ title: '', value: '' });
  const [newImage, setNewImage] = useState('');

  // Fetch product by ID if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return; // Skip if adding new product
      
      try {
        setLoading(true);
        // Use api instance which has withCredentials and proper headers set up
        const productUrl = `/products/${id}`;
        console.log('Fetching product from:', productUrl);
        
        const { data } = await api.get(productUrl);
        
        // Format data for form
        const product = data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          richDescription: product.richDescription || '',
          brand: product.brand || '',
          price: product.price || '',
          category: product.category ? product.category._id : '',
          countInStock: product.countInStock || '',
          isFeatured: product.isFeatured || false,
          status: product.status || 'active',
          specifications: product.specifications || [],
          images: product.images || []
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load product. Please try again.');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchProduct();
  }, [id]);

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const data = await getCategoriesForSelect();
      setCategories(data);
    } catch (err) {
      console.error('Categories error:', err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Add specification
  const addSpecification = () => {
    if (newSpec.title && newSpec.value) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, { name: newSpec.title, value: newSpec.value }]
      });
      setNewSpec({ title: '', value: '' });
    }
  };

  // Remove specification
  const removeSpecification = (index) => {
    const updatedSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      specifications: updatedSpecs
    });
  };

  // Add image URL
  const addImage = () => {
    if (newImage) {
      setFormData({
        ...formData,
        images: [...formData.images, newImage]
      });
      setNewImage('');
    }
  };

  // Remove image
  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setImageUploading(true);
      setUploadProgress(0);
      
      // Create a fake progress indicator
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + Math.random() * 10;
          return nextProgress >= 90 ? 90 : nextProgress;
        });
      }, 300);
      
      // Upload multiple images
      const imageUrls = await uploadMultipleImages(files);
      
      // Update form data with new image URLs
      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls]
      });
      
      // Clear progress and stop interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset upload state after a delay
      setTimeout(() => {
        setImageUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload images. Please try again.');
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token || '';
      
      // Format data for API
      const productData = {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock)
      };
      
      // Create or update product
      if (id) {
        await axios.put(`${API_URL}/products/${id}`, productData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_URL}/products`, productData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Redirect to products list
      navigate('/admin/products');
    } catch (err) {
      setError('Failed to save product. Please check the form and try again.');
      console.error('Save product error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="countInStock">Stock Quantity *</label>
            <input
              type="number"
              id="countInStock"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              Featured Product
            </label>
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Enter product description"
          />
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="richDescription">Rich Description</label>
          <textarea
            id="richDescription"
            name="richDescription"
            value={formData.richDescription}
            onChange={handleChange}
            rows="5"
            placeholder="Enter detailed product description (HTML supported)"
          />
        </div>
        
        {/* Specifications */}
        <div className="form-section">
          <h3>Specifications</h3>
          <div className="specification-inputs">
            <input
              type="text"
              placeholder="Title (e.g. Processor)"
              value={newSpec.title}
              onChange={(e) => setNewSpec({ ...newSpec, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Value (e.g. Intel i7)"
              value={newSpec.value}
              onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
            />
            <button 
              type="button" 
              className="btn-add"
              onClick={addSpecification}
            >
              Add
            </button>
          </div>
          
          {formData.specifications.length > 0 && (
            <div className="specifications-list">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td>{spec.name}</td>
                      <td>{spec.value}</td>
                      <td>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeSpecification(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Images */}
        <div className="form-section">
          <h3>Product Images</h3>
          
          {/* Image File Upload */}
          <div className="image-upload-container mb-3">
            <label htmlFor="imageUpload" className="image-upload-label">
              <i className="fas fa-cloud-upload-alt"></i> Upload Images
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="image-upload-input"
              disabled={imageUploading}
            />
            
            {imageUploading && (
              <div className="upload-progress">
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
                <p>Uploading images, please wait...</p>
              </div>
            )}
          </div>
          
          {/* Manual URL Entry */}
          <div className="image-inputs">
            <input
              type="text"
              placeholder="Image URL"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />
            <button 
              type="button" 
              className="btn-add"
              onClick={addImage}
            >
              Add
            </button>
          </div>
          
          {formData.images.length > 0 && (
            <div className="images-list">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Product ${index + 1}`} />
                  <button 
                    type="button" 
                    className="btn-remove"
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || imageUploading}
          >
            {loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 