import React from 'react';
import { useHistory } from 'react-router-dom';
import { FaEllipsisH } from 'react-icons/fa'; // Import the ellipsis icon
import './Notification.css';

const Notification = ({ notifications, closeDropdown }) => {
  const history = useHistory();

  const handleShowMore = () => {
    closeDropdown();
    history.push('/notifications');
  };

  return (
    <div className="notification-dropdown">
      <ul>
        {notifications.slice(0, 5).map((notification, index) => (
          <li key={index} className="notification-item">
            {notification}
          </li>
        ))}
      </ul>
      <button onClick={handleShowMore} className="show-more-button">
        <FaEllipsisH style={{ color: 'black' }} /> {/* Use the ellipsis icon and set color to black */}
      </button>
    </div>
  );
};

export default Notification;