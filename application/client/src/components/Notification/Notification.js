import React from 'react';
import { useHistory } from 'react-router-dom';
import './Notification.css'; // Import the CSS file

const Notification = ({ notifications = [], closeDropdown }) => {
  const history = useHistory();

  // Mock notifications data
  const mockNotifications = [
    'Notification 1', 'Notification 2', 'Notification 3', 'Notification 4', 'Notification 5',
    'Notification 6', 'Notification 7', 'Notification 8', 'Notification 9', 'Notification 10'
  ];

  // Use mock notifications if no notifications are provided
  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

  return (
    <div className="notification-dropdown"> {/* Updated class name */}
      <ul>
        {displayNotifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
      <button
        className="show-more-button"
        onClick={() => {
          closeDropdown();
          history.push('/notifications');
        }}
        title="Show More"
      >
        ...
      </button>
    </div>
  );
};

export default Notification;