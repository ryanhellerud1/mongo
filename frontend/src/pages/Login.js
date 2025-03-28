import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUser } from '../context/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useUser();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);
      
      console.log('Sending login request...');
      
      const { data } = await api.post('/users/login', { email, password });

      console.log('Login successful:', data);
      login(data);
      
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Login failed: ${error.message}`
      );
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center my-4">Sign In</h1>
          {message && <div className="alert alert-danger">{message}</div>}
          {loading && <div className="text-center">Loading...</div>}
          <form onSubmit={submitHandler}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Sign In
              </button>
            </div>
          </form>

          <div className="py-3 text-center">
            New Customer? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 