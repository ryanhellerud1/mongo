import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCmsProducts, batchUpdateProducts, getCategoriesForSelect } from '../../services/adminService';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getCmsProducts(page, 10, sortBy, sortOrder, statusFilter, searchTerm);
      setProducts(data.products);
      setTotalPages(data.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesForSelect();
      setCategories(data);
    } catch (err) {
      console.error('Categories error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchProducts();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleCheckProduct = (e, productId) => {
    if (e.target.checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBatchAction = async (status) => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      await batchUpdateProducts(selectedProducts, status);
      fetchProducts();
      setSelectedProducts([]);
    } catch (err) {
      alert('Failed to update products');
      console.error('Batch update error:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="products-management">
      <h1>Products Management</h1>

      <div className="management-actions">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="filter-box">
            <select value={statusFilter} onChange={handleFilter}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
        <div className="action-buttons">
          <Link to="/admin/products/new" className="btn-primary">
            Add New Product
          </Link>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="batch-actions">
          <span>{selectedProducts.length} products selected</span>
          <button onClick={() => handleBatchAction('active')} className="btn-success">
            Activate
          </button>
          <button onClick={() => handleBatchAction('inactive')} className="btn-warning">
            Deactivate
          </button>
          <button onClick={() => handleBatchAction('deleted')} className="btn-danger">
            Delete
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleCheckAll}
                      checked={selectedProducts.length === products.length && products.length > 0}
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('countInStock')} className="sortable">
                    Stock {sortBy === 'countInStock' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={e => handleCheckProduct(e, product._id)}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category ? getCategoryName(product.category._id) : 'None'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={
                        product.countInStock === 0 ? 'out-of-stock' :
                        product.countInStock < 5 ? 'low-stock' : ''
                      }>
                        {product.countInStock}
                      </span>
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/products/${product._id}`} className="btn-edit">
                          Edit
                        </Link>
                        <Link to={`/admin/products/${product._id}/variants`} className="btn-variant">
                          Variants
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsManagement; 