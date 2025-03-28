import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      {stats && (
        <div className="dashboard-grid">
          {/* Summary Cards */}
          <div className="dashboard-card summary-card">
            <div className="card-content">
              <h3>Products</h3>
              <div className="card-value">{stats.productStats.total}</div>
              <div className="card-action">
                <Link to="/admin/products">Manage Products</Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card summary-card">
            <div className="card-content">
              <h3>Categories</h3>
              <div className="card-value">{stats.productStats.categories}</div>
              <div className="card-action">
                <Link to="/admin/categories">Manage Categories</Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card summary-card">
            <div className="card-content">
              <h3>Orders</h3>
              <div className="card-value">{stats.orderStats.total}</div>
              <div className="card-action">
                <Link to="/admin/orders">Manage Orders</Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card summary-card">
            <div className="card-content">
              <h3>Users</h3>
              <div className="card-value">{stats.userStats.total}</div>
              <div className="card-action">
                <Link to="/admin/users">Manage Users</Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card summary-card">
            <div className="card-content">
              <h3>Revenue</h3>
              <div className="card-value">${stats.revenue.total.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="dashboard-card orders-card">
            <div className="card-content">
              <h3>Recent Orders</h3>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orderStats.recent.map(order => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/admin/orders/${order._id}`}>
                          #{order._id.substring(order._id.length - 8)}
                        </Link>
                      </td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>${order.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="card-action">
                <Link to="/admin/orders">View All Orders</Link>
              </div>
            </div>
          </div>
          
          {/* Low Stock */}
          <div className="dashboard-card stock-card">
            <div className="card-content">
              <h3>Low Stock Products</h3>
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>In Stock</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productStats.lowStock.map(product => (
                    <tr key={product._id}>
                      <td>
                        <Link to={`/admin/products/${product._id}`}>
                          {product.name}
                        </Link>
                      </td>
                      <td>
                        <span className={product.countInStock <= 5 ? 'critical-stock' : 'low-stock'}>
                          {product.countInStock}
                        </span>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="card-action">
                <Link to="/admin/products">Manage Inventory</Link>
              </div>
            </div>
          </div>
          
          {/* Order Status */}
          <div className="dashboard-card status-card">
            <div className="card-content">
              <h3>Order Status</h3>
              <div className="status-overview">
                {stats.orderStats.byStatus.map(status => (
                  <div key={status._id} className="status-item">
                    <div className="status-label">{status._id}</div>
                    <div className="status-value">{status.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 