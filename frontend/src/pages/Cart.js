import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const Cart = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const { 
    cartItems, 
    removeFromCart, 
    addToCart,
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice 
  } = useCart();

  // Handle quantity change
  const updateCartQuantity = (product, qty) => {
    addToCart(product, qty, product.variant || null);
  };

  // Navigate to checkout
  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  return (
    <div className="cart-page">
      <h1 className="mb-4">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items */}
          <div className="col-md-8">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.variant?._id || 'no-variant'}`} className="card mb-3">
                  <div className="row g-0">
                    <div className="col-md-2">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="img-fluid rounded-start cart-item-image"
                          style={{ height: '100px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="cart-item-placeholder">
                          <i className="fas fa-image fa-3x text-secondary"></i>
                        </div>
                      )}
                    </div>
                    <div className="col-md-10">
                      <div className="card-body">
                        <div className="row">
                          {/* Item Details */}
                          <div className="col-md-6">
                            <h5 className="card-title">
                              <Link to={`/product/${item._id}`}>{item.name}</Link>
                            </h5>
                            {item.variant && (
                              <p className="card-text text-muted small">
                                Variant: {item.variant.name}
                              </p>
                            )}
                            <p className="card-text fw-bold">${item.price.toFixed(2)}</p>
                          </div>
                          
                          {/* Quantity Control */}
                          <div className="col-md-3">
                            <div className="input-group input-group-sm">
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateCartQuantity(item, Math.max(1, item.qty - 1))}
                                disabled={item.qty <= 1}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <input 
                                type="number" 
                                min="1" 
                                max={item.countInStock}
                                className="form-control text-center" 
                                value={item.qty} 
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value);
                                  if (newQty > 0 && newQty <= item.countInStock) {
                                    updateCartQuantity(item, newQty);
                                  }
                                }}
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateCartQuantity(item, Math.min(item.countInStock, item.qty + 1))}
                                disabled={item.qty >= item.countInStock}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                          
                          {/* Remove Button & Price */}
                          <div className="col-md-3 d-flex flex-column justify-content-between">
                            <button 
                              className="btn btn-sm btn-outline-danger align-self-end"
                              onClick={() => removeFromCart(item)}
                            >
                              <i className="fas fa-trash"></i> Remove
                            </button>
                            <p className="card-text text-end mb-0">
                              <strong>${(item.price * item.qty).toFixed(2)}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Continue Shopping */}
            <div className="d-flex justify-content-between my-4">
              <Link to="/" className="btn btn-outline-primary">
                <i className="fas fa-arrow-left me-2"></i> Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>
                    {shippingPrice === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      `$${shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (10%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total</strong>
                  <strong className="text-primary">${totalPrice.toFixed(2)}</strong>
                </div>
                
                {/* Free Shipping Notice */}
                {itemsPrice < 100 && (
                  <div className="alert alert-info small mb-3">
                    <i className="fas fa-truck me-2"></i>
                    Add ${(100 - itemsPrice).toFixed(2)} more to get FREE shipping!
                  </div>
                )}
                
                <div className="d-grid">
                  <button 
                    className="btn btn-primary"
                    onClick={checkoutHandler}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 