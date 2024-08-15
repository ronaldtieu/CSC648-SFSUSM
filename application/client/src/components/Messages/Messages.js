import React from 'react';
import { useHistory } from 'react-router-dom';
import { FaEllipsisH } from 'react-icons/fa'; // Import the ellipsis icon
import './Messages.css';

const Messages = ({ messages, closeDropdown }) => {
  const history = useHistory();

  const handleShowMore = () => {
    closeDropdown();
    history.push('/messages');
  };

  return (
    <div className="messages-dropdown">
      <ul>
        {messages.slice(0, 5).map((message, index) => (
          <li key={index} className="message-item">
            {message}
          </li>
        ))}
      </ul>
      <button onClick={handleShowMore} className="show-more-button">
        <FaEllipsisH style={{ color: 'black' }} /> {/* Setting the color of the ellipsis to black */}
      </button>
    </div>
  );
};

export default Messages;