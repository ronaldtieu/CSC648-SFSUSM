import React, { useEffect } from 'react';
import './MessagePage.css';

const messages = [
  'Message 1',
  'Message 2',
  'Message 3',
  'Message 4',
  'Message 5',
  'Message 6',
  'Message 7',
  'Message 8',
  'Message 9',
  'Message 10'
];

const MessagesPage = () => {

  useEffect(() => {
    // Session check logic
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/'; // Redirect to landing page if not logged in
    }
  }, []); // runs once right after the page is loaded

  return (
    <div className="messages-page">
      <h1>Messages</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index} className="message-item">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesPage;