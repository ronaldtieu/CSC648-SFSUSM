import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sendMessage, createConversation, checkExistingConversation } from '../../service/messageService';
import { searchUsers } from '../../service/profileService';
import './Message.css';

const NewConversation = ({ currentUser }) => {
  const history = useHistory();

  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientSuggestions, setRecipientSuggestions] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState('');

  // Fetch recipient suggestions based on the query
  useEffect(() => {
    if (recipientQuery.trim().length > 1 && currentUser && currentUser.id) {
      searchUsers(recipientQuery, currentUser.id)
        .then((data) => {
          if (data.success) {
            setRecipientSuggestions(data.users);
          } else {
            setRecipientSuggestions([]);
          }
        })
        .catch(() => setRecipientSuggestions([]));
    } else {
      setRecipientSuggestions([]);
    }
  }, [recipientQuery, currentUser]);

  // When a recipient is selected, update the query and clear suggestions.
  const handleSelectRecipient = async (user) => {
    setSelectedRecipient(user);
    setRecipientQuery(user.email);
    setRecipientSuggestions([]);

    // Check if an existing conversation already exists
    if (currentUser && currentUser.id) {
      try {
        const existing = await checkExistingConversation([user.id], currentUser.id);
        if (existing.success && existing.conversationId) {
          history.push(`/messages/${existing.conversationId}`);
        }
      } catch (error) {
        console.error('Error checking existing conversation:', error);
      }
    }
  };

  // Create a new conversation and send the first message.
  const handleStartNewConversation = async () => {
    if (!messageContent.trim() || !selectedRecipient) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      // Check again if an existing conversation exists before creating a new one.
      const existing = await checkExistingConversation([selectedRecipient.id], currentUser.id);
      if (existing.success && existing.conversationId) {
        history.push(`/messages/${existing.conversationId}`);
        return;
      }
      // Create a new conversation.
      const createData = await createConversation([selectedRecipient.id], token);
      if (createData.success) {
        const newConversationId = createData.conversationId;
        // Send the initial message.
        const sendData = await sendMessage(newConversationId, messageContent, token);
        if (sendData.success) {
          history.push(`/messages/${newConversationId}`);
        } else {
          setError(sendData.message || 'Failed to send message in new conversation.');
        }
      } else {
        setError(createData.message || 'Failed to create conversation.');
      }
    } catch (err) {
      setError('An error occurred while creating a new conversation.');
    }
  };

  return (
    <div className="new-conversation">
      <h1>New Conversation</h1>
      <div className="recipient-input">
        <label>Recipient:</label>
        <input
          type="text"
          value={recipientQuery}
          onChange={(e) => {
            setRecipientQuery(e.target.value);
            setSelectedRecipient(null);
          }}
          placeholder="Type recipient name or email..."
        />
        {recipientSuggestions.length > 0 && (
          <ul className="recipient-suggestions">
            {recipientSuggestions.map((user) => (
              <li key={user.id} onClick={() => handleSelectRecipient(user)}>
                {user.firstName} {user.lastName} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="message-input">
        <textarea
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        ></textarea>
        <button onClick={handleStartNewConversation} disabled={!selectedRecipient}>
          Start Conversation
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default NewConversation;