import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';
import NotFoundImage from './../components/Images/404.png'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Oops! Page not found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="home-button">
          Go to Homepage
        </Link>
      </div>
     
      <div className="not-found-illustration">
        <img 
          src={NotFoundImage}
          alt="Not Found" 
        />
      </div>
    </div>
  );
};

export default NotFound;
