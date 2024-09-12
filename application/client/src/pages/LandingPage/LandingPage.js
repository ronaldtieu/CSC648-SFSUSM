import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const history = useHistory();

  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:4000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrId, password }),
        credentials: 'include',  // Include cookies with the request
      });
  
      const data = await response.json();
  
      if (data.success) {
        console.log('Login successful:', data); // Log the response
        sessionStorage.setItem('accessToken', data.token);
        // Redirect to /home and force a reload
        history.push('/home');
        window.location.reload();  // Reload the page to ensure the state is fully updated
      } else {
        console.log('Login failed:', data.message); // Log the error message
        setBackendMessage(data.message);
      }
    } catch (error) {
      console.log('An unexpected error occurred:', error); // Log unexpected errors
      setBackendMessage('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="landing-page">
      <div className="login-container">
        <h1>Welcome to SFSU Social Media</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or School ID"
            value={emailOrId}
            onChange={(e) => setEmailOrId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <div className="response-box">
          {backendMessage && <p>{backendMessage}</p>}
        </div>
        <a href="#" className="forgot-password">Forgot Password?</a>
        <div className="signup-section">
          <p>Don't have an account? <a href="#">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;