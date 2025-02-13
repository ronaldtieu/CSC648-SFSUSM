import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getAllConversations } from '../../service/messageService';
import { checkSession } from '../../service/profileService'; 
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import './MessagePage.css';

const MessagesPage = ({ token, initialConversations, userId: initialUserId }) => {
  const history = useHistory();
  const tokenToUse = token || sessionStorage.getItem('accessToken');

  const [userId, setUserId] = useState(initialUserId || null);
  const [conversations, setConversations] = useState(initialConversations || []);
  const [loading, setLoading] = useState(!initialConversations || !initialUserId);
  const [error, setError] = useState('');

  // Use checkSession to get user info (and userId) if not already provided
  useEffect(() => {
    if (!tokenToUse) {
      setError('Access token is missing. Please log in.');
      setLoading(false);
      return;
    }
    if (!userId) {
      checkSession(tokenToUse)
        .then((data) => {
          if (data.success && data.user && data.user.id) {
            setUserId(data.user.id);
          } else {
            setError('Failed to retrieve user ID from session.');
          }
        })
        .catch(() => {
          setError('An error occurred while verifying session information.');
        });
    }
  }, [tokenToUse, userId]);

  // Once we have token and userId, fetch conversations.
  useEffect(() => {
    if (!tokenToUse || !userId) return;

    if (conversations.length === 0) {
      getAllConversations(tokenToUse)
        .then((data) => {
          if (data.success) {
            setConversations(data.conversations);
          } else {
            setError(data.message || 'Error fetching conversations.');
          }
        })
        .catch(() => {
          setError('An error occurred while fetching conversations.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [tokenToUse, userId, conversations.length]);

  // Handler for clicking an existing conversation.
  const handleConversationClick = (conversationId) => {
    // Navigate to Message.js with the conversationId.
    history.push(`/messages/${conversationId}`);
  };

  // Handler for starting a new conversation.
  const handleStartNewConversation = () => {
    // For a new conversation, we redirect to a route (e.g., '/messages/new')
    // where Message.js can render a blank conversation shell.
    history.push('/messages/new');
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Messages {userId && `(User: ${userId})`}</h1>
        <button 
          className="start-new-conversation-button" 
          onClick={handleStartNewConversation}
          title="Start New Conversation"
        >
          Start New Conversation
        </button>
      </div>
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {conversations.length > 0 ? (
            <ul>
              {conversations.map((conversation) => (
                <li 
                  key={conversation.conversationId} 
                  className="message-item"
                  onClick={() => handleConversationClick(conversation.conversationId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <strong>Conversation ID:</strong> {conversation.conversationId}
                  </div>
                  <div>
                    <strong>Created At:</strong> {conversation.createdAt}
                  </div>
                  <div>
                    <strong>Participants:</strong>{' '}
                    {conversation.participants
                      .map((p) => `${p.FirstName} ${p.LastName}`)
                      .join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No conversations found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default MessagesPage;