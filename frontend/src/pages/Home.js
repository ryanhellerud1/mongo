import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { userInfo } = useUser();

  return (
    <div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            {userInfo ? (
              <>
                <h1 className="display-4 mb-4">Welcome back, {userInfo.name}!</h1>
                <p className="lead mb-4">
                  You are successfully logged in to the application.
                </p>
                <div className="card bg-light p-4 mb-4">
                  <h3>Your Profile</h3>
                  <p><strong>Name:</strong> {userInfo.name}</p>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p><strong>Account ID:</strong> {userInfo._id}</p>
                </div>
              </>
            ) : (
              <>
                <h1 className="display-4 mb-4">Welcome to Our Platform</h1>
                <p className="lead mb-4">
                  This is a simple full stack application built with React, Node.js, Express, and MongoDB.
                  Create an account to get started!
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Sign Up
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg">
                    Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 