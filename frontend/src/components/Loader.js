import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ size = 'md', inline = false, className = '' }) => {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;
  
  return (
    <div className={`text-center ${inline ? 'd-inline-block' : ''} ${className}`}>
      <Spinner
        animation="border"
        role="status"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          margin: inline ? '0 0.5rem 0 0' : 'auto',
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader; 