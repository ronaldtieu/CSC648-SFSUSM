import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useHistory } from 'react-router-dom';

const LandingPage = () => {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetch('http://localhost:4000/api/users/check-session', {
      method: 'GET',
      credentials: 'include'  // Include cookies with the request
    })
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        console.log('User is logged in:', data.user);
        history.push('/home'); // Redirect to home if already logged in
      } else {
        console.log('User is not logged in');
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
  }, [history]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/api/users/login', {  // Ensure the port matches your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrId, password }),
        credentials: 'include',  // Include cookies with the request
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('accessToken', data.accessToken);  // Store the JWT or session info
        window.location.href = '/home';  // Redirect to the home page after successful login
      } else {
        setBackendMessage(data.message);
      }
    } catch (error) {
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
}

export default LandingPage;