import React from 'react';

const Orders = () => {
  return (
    <div>
      <h1>My Orders</h1>
      
      <div className="alert alert-info mb-4">
        <i className="fas fa-info-circle me-2"></i>
        This page will display all your orders and their status. You'll be able to view order details, track shipments, and manage returns.
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Order History</h5>
        </div>
        <div className="card-body">
          <p className="text-center py-4">
            <i className="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
            <br />
            You haven't placed any orders yet.
          </p>
          <div className="text-center">
            <a href="/" className="btn btn-primary">
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders; 