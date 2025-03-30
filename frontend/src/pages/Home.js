import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Add query parameters if needed
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        
        const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
        const { data } = await API.get(url);
        setProducts(data.products || data);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger the search
  };

  return (
    <div className="store-container">
      {/* Hero Banner */}
      <div className="hero-banner bg-light py-5 mb-4 text-center">
        <div className="container">
          <h1>Welcome to Our Online Store</h1>
          <p className="lead">Discover amazing products at great prices</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="d-flex justify-content-center mt-4">
            <div className="input-group" style={{ maxWidth: '500px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Sidebar with categories */}
          <div className="col-md-3 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Categories</h5>
              </div>
              <div className="card-body">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="category" 
                    id="all-categories" 
                    value=""
                    checked={selectedCategory === ''}
                    onChange={handleCategoryChange}
                  />
                  <label className="form-check-label" htmlFor="all-categories">
                    All Categories
                  </label>
                </div>
                
                {categories.map((category) => (
                  <div className="form-check" key={category._id}>
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="category" 
                      id={`category-${category._id}`}
                      value={category._id}
                      checked={selectedCategory === category._id}
                      onChange={handleCategoryChange}
                    />
                    <label className="form-check-label" htmlFor={`category-${category._id}`}>
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content - Product Grid */}
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                {selectedCategory 
                  ? `${categories.find(c => c._id === selectedCategory)?.name || 'Products'}`
                  : 'All Products'}
              </h2>
              {searchTerm && (
                <div>Search results for: <strong>{searchTerm}</strong></div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : products.length === 0 ? (
              <div className="alert alert-info">
                No products found. Try a different search or category.
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {products.map((product) => (
                  <div className="col" key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 