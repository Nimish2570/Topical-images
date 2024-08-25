import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './../constants';
import api from './../api';
import { Navigate } from 'react-router-dom';

const Register = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    return <Navigate to="/" />;
  }

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/user/register/', {
        username,
        email,
        password,
      });
      console.log(response.data);

      if (response.data) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        // reload the page
        
      }
    } catch (error) {
      if (error.response.status === 400) {
        setError(error.response.data.detail);
      }
      if (error.response.data.username){
        setError(error.response.data.username);
      }
      if (error.response.data.email){
        setError(error.response.data.email);
      }
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required/>

          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Register</button>
          {error && <p className="error">{error}</p>}
          {loading && <p>Loading...</p>}
          
          <p>Already have an account?</p>
          <a href="/login" className="login-link">
            Login
          </a>
          
        </form>
      </div>
    </div>
  );
};

export default Register;
