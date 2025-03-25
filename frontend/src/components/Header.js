import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { userInfo, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark text-white py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none">
            <h2>Full Stack App</h2>
          </Link>
          <nav>
            <ul className="list-unstyled d-flex mb-0">
              {userInfo ? (
                <>
                  <li className="me-3">
                    <span className="text-white">Welcome, {userInfo.name}</span>
                  </li>
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