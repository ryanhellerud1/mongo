import React from 'react';
import { useUser } from '../context/UserContext';

const Profile = () => {
  const { userInfo } = useUser();

  return (
    <div>
      <h1>My Profile</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">User Information</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Name:</div>
            <div className="col-md-9">{userInfo?.name}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Email:</div>
            <div className="col-md-9">{userInfo?.email}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Account Type:</div>
            <div className="col-md-9">{userInfo?.isAdmin ? 'Administrator' : 'Customer'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Joined:</div>
            <div className="col-md-9">
              {userInfo?.createdAt 
                ? new Date(userInfo.createdAt).toLocaleDateString() 
                : 'Not available'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        More profile features are coming soon, including:
        <ul className="mt-2">
          <li>Updating profile information</li>
          <li>Changing your password</li>
          <li>Managing saved addresses</li>
          <li>Payment methods</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile; 