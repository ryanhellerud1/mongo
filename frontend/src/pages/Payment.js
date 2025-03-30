import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import CheckoutSteps from '../components/CheckoutSteps';

const Payment = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const { shippingAddress, savePaymentMethod } = useCart();
  
  // Default payment method
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  
  // Redirect if not logged in or no shipping address
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=payment');
    } else if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [userInfo, shippingAddress, navigate]);
  
  // Handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    
    // Save payment method
    savePaymentMethod(paymentMethod);
    
    // Proceed to place order
    navigate('/placeorder');
  };
  
  return (
    <div className="payment-page">
      <CheckoutSteps step1 step2 step3 />
      
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Payment Method</h2>
              
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                  <Form.Label as="legend">Select Payment Method</Form.Label>
                  <div className="mt-3">
                    <Form.Check
                      type="radio"
                      label="PayPal or Credit Card"
                      id="PayPal"
                      name="paymentMethod"
                      value="PayPal"
                      checked={paymentMethod === 'PayPal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="radio"
                      label="Stripe"
                      id="Stripe"
                      name="paymentMethod"
                      value="Stripe"
                      checked={paymentMethod === 'Stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="radio"
                      label="Cash On Delivery"
                      id="COD"
                      name="paymentMethod"
                      value="Cash On Delivery"
                      checked={paymentMethod === 'Cash On Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>
                </Form.Group>
                
                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary">
                    Continue to Review Order
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 