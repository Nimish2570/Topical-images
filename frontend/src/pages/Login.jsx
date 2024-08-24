import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './../constants';
import api from './../api';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      return <Navigate to="/" />;
    }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // To handle any error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/token/', { username, password });
      console.log(response.data);

      if (response.data.access) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
       
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate('/');
      }
    } catch (error) {
      
      setError('Invalid username or password');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account?</p>
        <Link to="/register" className="register-link">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
