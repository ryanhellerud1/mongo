import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { userInfo } = useUser();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/products/${id}`
        );
        setProduct(data);
        
        // Set default variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load product. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/products?limit=4`
        );
        setRelatedProducts(data.products || data || []);
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };

    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product.countInStock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.countInStock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const addToCart = () => {
    // Placeholder for cart functionality
    alert(`Added ${quantity} of ${product.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="alert alert-danger">
        {error || 'Product not found'}
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.compareAtPrice && product.price 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : null;

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link to={`/?category=${product.category._id}`}>{product.category.name}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Product Images */}
        <div className="col-md-6 mb-4">
          <div className="product-images">
            <div className="main-image mb-3">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="img-fluid rounded"
                />
              ) : (
                <div className="text-center py-5 bg-light rounded">
                  <i className="fas fa-image fa-5x text-secondary"></i>
                </div>
              )}
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-container d-flex">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail me-2 ${index === activeImage ? 'active-thumbnail' : ''}`}
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: '80px', 
                      height: '80px', 
                      cursor: 'pointer',
                      border: index === activeImage ? '2px solid #007bff' : '1px solid #dee2e6'
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="img-fluid h-100 w-100" 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>
          
          {/* Rating */}
          {product.rating !== undefined && (
            <div className="d-flex align-items-center mb-3">
              <div className="me-2">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.round(product.rating) ? 'text-warning' : 'text-muted'}`}
                  ></i>
                ))}
              </div>
              <span className="text-muted">
                {product.rating.toFixed(1)} ({product.numReviews || 0} reviews)
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <h3 className="me-3 mb-0">${product.price.toFixed(2)}</h3>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-muted text-decoration-line-through fs-5">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
              {discountPercentage && discountPercentage > 0 && (
                <span className="badge bg-danger ms-2">{discountPercentage}% OFF</span>
              )}
            </div>
          </div>
          
          {/* Stock Status */}
          <div className="mb-3">
            {product.countInStock > 0 ? (
              <div className="text-success">
                <i className="fas fa-check-circle me-1"></i> In Stock ({product.countInStock} available)
              </div>
            ) : (
              <div className="text-danger">
                <i className="fas fa-times-circle me-1"></i> Out of Stock
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <h5>Description</h5>
            <p>{product.description}</p>
          </div>
          
          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <h5>Variants</h5>
              <div className="d-flex flex-wrap">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    type="button"
                    className={`btn me-2 mb-2 ${selectedVariant && selectedVariant._id === variant._id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity */}
          <div className="mb-4">
            <h5>Quantity</h5>
            <div className="input-group" style={{ width: '150px' }}>
              <button className="btn btn-outline-secondary" type="button" onClick={decrementQuantity}>
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                className="form-control text-center" 
                value={quantity} 
                onChange={handleQuantityChange}
                min="1"
                max={product.countInStock || 10}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={incrementQuantity}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          {/* Add to Cart */}
          <div className="d-grid gap-2 mb-4">
            <button 
              className="btn btn-primary btn-lg"
              onClick={addToCart}
              disabled={product.countInStock <= 0}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          
          {/* Product Specs */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="product-specs mb-4">
              <h5>Specifications</h5>
              <table className="table table-striped">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <th style={{ width: '30%' }}>{spec.name}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Admin Edit Link */}
          {userInfo && userInfo.isAdmin && (
            <div className="mt-3">
              <Link to={`/admin/products/${product._id}`} className="btn btn-outline-secondary">
                <i className="fas fa-edit me-1"></i> Edit Product
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products mt-5">
          <h3 className="mb-4">Related Products</h3>
          <div className="row">
            {relatedProducts
              .filter(item => item._id !== product._id)
              .slice(0, 4)
              .map(product => (
                <div className="col-6 col-md-3 mb-4" key={product._id}>
                  <div className="card h-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        className="card-img-top" 
                        alt={product.name}
                        style={{ height: '160px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-center py-4 bg-light">
                        <i className="fas fa-image fa-2x text-secondary"></i>
                      </div>
                    )}
                    <div className="card-body">
                      <h6 className="card-title">
                        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </h6>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="fw-bold">${product.price.toFixed(2)}</span>
                        <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 