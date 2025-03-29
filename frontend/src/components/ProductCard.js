import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Calculate discount percentage if there's both a price and compareAtPrice
  const discountPercentage = product.compareAtPrice && product.price 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : null;

  return (
    <div className="card h-100 product-card">
      {/* Product image */}
      <div className="product-image-container position-relative">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            className="card-img-top" 
            alt={product.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div className="text-center py-5 bg-light">
            <i className="fas fa-image fa-3x text-secondary"></i>
          </div>
        )}
        
        {/* Discount badge */}
        {discountPercentage && discountPercentage > 0 && (
          <div className="position-absolute top-0 start-0 bg-danger text-white m-2 px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Stock badge */}
        {product.countInStock <= 0 && (
          <div className="position-absolute top-0 end-0 bg-secondary text-white m-2 px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
        
        {/* New product badge */}
        {product.isNew && (
          <div className="position-absolute bottom-0 start-0 bg-success text-white m-2 px-2 py-1 rounded">
            New
          </div>
        )}
      </div>
      
      <div className="card-body d-flex flex-column">
        {/* Product category */}
        {product.category && (
          <small className="text-muted mb-1">{product.category.name}</small>
        )}
        
        {/* Product name */}
        <h5 className="card-title">
          <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </h5>
        
        {/* Price */}
        <div className="mt-auto">
          <div className="d-flex align-items-center mb-2">
            <span className="fs-5 fw-bold me-2">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-muted text-decoration-line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          {product.rating !== undefined && (
            <div className="d-flex align-items-center mb-2">
              <div className="me-1">
                {/* Generate 5 stars, filled based on rating */}
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.round(product.rating) ? 'text-warning' : 'text-muted'}`}
                    style={{ fontSize: '0.8rem' }}
                  ></i>
                ))}
              </div>
              <small className="text-muted">
                ({product.numReviews || 0} reviews)
              </small>
            </div>
          )}
          
          {/* Add to cart button */}
          <Link 
            to={`/product/${product._id}`} 
            className={`btn ${product.countInStock > 0 ? 'btn-primary' : 'btn-secondary'} w-100`}
            disabled={product.countInStock <= 0}
          >
            {product.countInStock > 0 ? 'View Product' : 'Out of Stock'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 