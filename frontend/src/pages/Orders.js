import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import Loader from '../components/Loader';
import { useGetMyOrdersQuery } from '../services/orderApi';
import { formatPrice } from '../utils/formatPrice';

const UserOrders = () => {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  // Redirect if not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=orders');
    }
  }, [userInfo, navigate]);

  // Handle loading state
  if (isLoading) {
    return <Loader />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="alert alert-danger">
        {error?.data?.message || 'Failed to load orders'}
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="mb-4">My Orders</h1>
      
      {orders?.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Start Shopping
          </Link>
        </div>
      ) : (
        <Table striped hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{formatPrice(order.totalPrice)}</td>
                <td>
                  {order.isPaid ? (
                    <span className="text-success">
                      <i className="fas fa-check"></i> {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-danger">
                      <i className="fas fa-times"></i> Not Paid
                    </span>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <span className="text-success">
                      <i className="fas fa-check"></i> {new Date(order.deliveredAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-danger">
                      <i className="fas fa-times"></i> Not Delivered
                    </span>
                  )}
                </td>
                <td>
                  <Link to={`/order/${order._id}`}>
                    <Button variant="light" size="sm">
                      Details
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default UserOrders; 