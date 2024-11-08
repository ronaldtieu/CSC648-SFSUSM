import React, { useEffect } from 'react';
import './NotificationsPage.css';

const notifications = [
  'Notification 1',
  'Notification 2',
  'Notification 3',
  'Notification 4',
  'Notification 5',
  'Notification 6',
  'Notification 7',
  'Notification 8',
  'Notification 9',
  'Notification 10'
];

const NotificationsPage = () => {

  useEffect(() => {
    // Session check logic
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/'; // Redirect to landing page if not logged in
    }
  }, []); // runs once right after the page is loaded

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index} className="notification-item">
            {notification}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;