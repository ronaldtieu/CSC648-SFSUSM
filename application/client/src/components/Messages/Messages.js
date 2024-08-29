import React from 'react';
import { useHistory } from 'react-router-dom';
import './Messages.css'; // Import the CSS file

const Messages = ({ messages = [], closeDropdown }) => {
  const history = useHistory();

  // Mock messages data
  const mockMessages = [
    'Message 1', 'Message 2', 'Message 3', 'Message 4', 'Message 5',
    'Message 6', 'Message 7', 'Message 8', 'Message 9', 'Message 10'
  ];

  // Use mock messages if no messages are provided
  const displayMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <div className="messages-dropdown"> {/* Updated class name */}
      <ul>
        {displayMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <button
        className="show-more-button"
        onClick={() => {
          closeDropdown();
          history.push('/messages');
        }}
        title="Show More"
      >
        ...
      </button>
    </div>
  );
};

export default Messages;