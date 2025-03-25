import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-4">
      <div className="container">
        <div className="text-center">
          <p className="mb-0">Full Stack App &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 