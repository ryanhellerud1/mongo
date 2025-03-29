import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userInfo } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Optimize the toggling function with debounce to reduce resize events
  const toggleSidebar = useCallback(() => {
    // Using setTimeout to ensure we don't trigger too many resize events
    setTimeout(() => {
      setSidebarOpen(prevState => !prevState);
    }, 0);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Get username from user info
  const userName = userInfo?.name || 'Admin';
  
  // Check if the current route matches the navigation item
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin CMS</h2>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/admin/dashboard') ? 'active' : ''}>
              <Link to="/admin/dashboard">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/admin/products') ? 'active' : ''}>
              <Link to="/admin/products">
                <span className="nav-icon">📦</span>
                <span className="nav-text">Products</span>
              </Link>
            </li>
            <li className={isActive('/admin/categories') ? 'active' : ''}>
              <Link to="/admin/categories">
                <span className="nav-icon">🗂️</span>
                <span className="nav-text">Categories</span>
              </Link>
            </li>
            <li className={isActive('/admin/orders') ? 'active' : ''}>
              <Link to="/admin/orders">
                <span className="nav-icon">🛒</span>
                <span className="nav-text">Orders</span>
              </Link>
            </li>
            <li className={isActive('/admin/users') ? 'active' : ''}>
              <Link to="/admin/users">
                <span className="nav-icon">👥</span>
                <span className="nav-text">Users</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-header">
          <button className="mobile-menu" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="header-actions">
            <Link to="/" className="view-store-link">
              View Store
            </Link>
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <span className="user-name">{userName}</span>
            </div>
          </div>
        </div>
        
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 