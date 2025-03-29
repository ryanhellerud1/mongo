import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { userInfo, logout } = useUser();
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle admin dropdown menu
  const toggleAdminMenu = () => {
    setShowAdminMenu(!showAdminMenu);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-dark text-white py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none">
            <h2>Full Stack App</h2>
          </Link>
          <nav>
            <ul className="list-unstyled d-flex mb-0 align-items-center">
              {userInfo ? (
                <>
                  {userInfo.isAdmin && (
                    <li className="me-3 position-relative" ref={dropdownRef}>
                      <button 
                        onClick={toggleAdminMenu} 
                        className="btn btn-outline-light btn-sm"
                      >
                        <i className="fas fa-cog"></i> Admin
                      </button>
                      {showAdminMenu && (
                        <>
                          <div className="position-absolute bg-white text-dark p-2 rounded shadow" 
                               style={{zIndex: 1000, top: '100%', right: 0, width: '200px', minWidth: '200px'}}>
                            <Link to="/admin/dashboard" 
                                  className="d-block p-2 text-decoration-none text-dark admin-dropdown-link">
                              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                            </Link>
                            <Link to="/admin/products" 
                                  className="d-block p-2 text-decoration-none text-dark admin-dropdown-link">
                              <i className="fas fa-box me-2"></i>Products
                            </Link>
                            <Link to="/admin/categories" 
                                  className="d-block p-2 text-decoration-none text-dark admin-dropdown-link">
                              <i className="fas fa-list me-2"></i>Categories
                            </Link>
                            <Link to="/admin/orders" 
                                  className="d-block p-2 text-decoration-none text-dark admin-dropdown-link">
                              <i className="fas fa-shopping-cart me-2"></i>Orders
                            </Link>
                            <Link to="/admin/users" 
                                  className="d-block p-2 text-decoration-none text-dark admin-dropdown-link">
                              <i className="fas fa-users me-2"></i>Users
                            </Link>
                          </div>
                        </>
                      )}
                    </li>
                  )}
                  <li className="me-3">
                    <span className="text-white">Welcome, {userInfo.name}</span>
                  </li>
                  {!userInfo.isAdmin && (
                    <>
                      <li className="me-3">
                        <Link to="/profile" className="text-white text-decoration-none">
                          <i className="fas fa-user-circle me-1"></i> Profile
                        </Link>
                      </li>
                      <li className="me-3">
                        <Link to="/orders" className="text-white text-decoration-none">
                          <i className="fas fa-shopping-bag me-1"></i> My Orders
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-outline-light btn-sm"
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="me-3">
                    <Link to="/register" className="text-white text-decoration-none">
                      <i className="fas fa-user-plus"></i> Register
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-white text-decoration-none">
                      <i className="fas fa-user"></i> Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 