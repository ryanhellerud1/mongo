import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductVariants.css';

const API_URL = 'http://localhost:5001/api';

const ProductVariants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    name: '',
    price: '',
    countInStock: '',
    attributes: []
  });
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token || '';
        const response = await axios.get(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProduct(response.data);
        setVariants(response.data.variants || []);
        setError(null);
      } catch (err) {
        setError('Failed to load product. Please try again.');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Handle new variant input changes
  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant({
      ...newVariant,
      [name]: value
    });
  };

  // Handle new attribute input changes
  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setNewAttribute({
      ...newAttribute,
      [name]: value
    });
  };

  // Add attribute to new variant
  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setNewVariant({
        ...newVariant,
        attributes: [...newVariant.attributes, { ...newAttribute }]
      });
      setNewAttribute({ name: '', value: '' });
    }
  };

  // Remove attribute from new variant
  const removeAttribute = (index) => {
    const updatedAttributes = newVariant.attributes.filter((_, i) => i !== index);
    setNewVariant({
      ...newVariant,
      attributes: updatedAttributes
    });
  };

  // Add new variant
  const addVariant = () => {
    if (newVariant.name && newVariant.price && newVariant.countInStock) {
      // Create a clean variant object
      const variantToAdd = {
        name: newVariant.name,
        price: parseFloat(newVariant.price),
        countInStock: parseInt(newVariant.countInStock),
        attributes: newVariant.attributes
      };
      
      // Add to local state
      setVariants([...variants, variantToAdd]);
      
      // Reset form
      setNewVariant({
        name: '',
        price: '',
        countInStock: '',
        attributes: []
      });
    } else {
      alert('Please fill in all required fields for the variant');
    }
  };

  // Remove variant
  const removeVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };

  // Save all variants to the product
  const saveVariants = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token || '';
      
      await axios.put(`${API_URL}/products/${id}`, {
        variants: variants
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Redirect back to product page
      navigate(`/admin/products/${id}`);
    } catch (err) {
      setError('Failed to save variants. Please try again.');
      console.error('Save variants error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="variants-container">
      <h1>Manage Variants for {product?.name}</h1>
      
      <div className="variants-list">
        <h3>Current Variants</h3>
        {variants.length === 0 ? (
          <p className="no-variants">No variants defined yet</p>
        ) : (
          <table className="variants-table">
            <thead>
              <tr>
                <th>Variant Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Attributes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={index}>
                  <td>{variant.name}</td>
                  <td>${variant.price.toFixed(2)}</td>
                  <td>{variant.countInStock}</td>
                  <td>
                    {variant.attributes && variant.attributes.length > 0 ? (
                      <ul className="attributes-list">
                        {variant.attributes.map((attr, attrIndex) => (
                          <li key={attrIndex}>
                            <strong>{attr.name}:</strong> {attr.value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>No attributes</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-remove" 
                      onClick={() => removeVariant(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="add-variant-section">
        <h3>Add New Variant</h3>
        <div className="variant-form">
          <div className="variant-main-inputs">
            <div className="form-group">
              <label htmlFor="name">Variant Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newVariant.name}
                onChange={handleVariantChange}
                placeholder="e.g. Red / Large / 128GB"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newVariant.price}
                onChange={handleVariantChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="countInStock">Stock Quantity *</label>
              <input
                type="number"
                id="countInStock"
                name="countInStock"
                value={newVariant.countInStock}
                onChange={handleVariantChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="variant-attributes">
            <h4>Variant Attributes</h4>
            <div className="attribute-inputs">
              <div className="form-group">
                <label htmlFor="attr-name">Attribute Name</label>
                <input
                  type="text"
                  id="attr-name"
                  name="name"
                  value={newAttribute.name}
                  onChange={handleAttributeChange}
                  placeholder="e.g. Color"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="attr-value">Attribute Value</label>
                <input
                  type="text"
                  id="attr-value"
                  name="value"
                  value={newAttribute.value}
                  onChange={handleAttributeChange}
                  placeholder="e.g. Red"
                />
              </div>
              
              <button 
                type="button" 
                className="btn-add"
                onClick={addAttribute}
              >
                Add Attribute
              </button>
            </div>
            
            {newVariant.attributes.length > 0 && (
              <div className="added-attributes">
                <h5>Added Attributes:</h5>
                <ul>
                  {newVariant.attributes.map((attr, index) => (
                    <li key={index}>
                      <strong>{attr.name}:</strong> {attr.value}
                      <button 
                        type="button" 
                        className="btn-remove-small"
                        onClick={() => removeAttribute(index)}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="variant-actions">
            <button 
              type="button" 
              className="btn-add-variant"
              onClick={addVariant}
            >
              Add This Variant
            </button>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="btn-cancel"
          onClick={() => navigate(`/admin/products/${id}`)}
        >
          Cancel
        </button>
        <button 
          type="button" 
          className="btn-save"
          onClick={saveVariants}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save All Variants'}
        </button>
      </div>
    </div>
  );
};

export default ProductVariants; 