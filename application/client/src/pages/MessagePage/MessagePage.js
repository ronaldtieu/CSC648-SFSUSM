import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getAllConversations, deleteConversation } from '../../service/messageService';
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
  // Holds the conversationId for which delete confirmation is active.
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
  const handleConversationClick = (conversation) => {
    // Don't navigate if the delete confirmation is active.
    if (confirmDeleteId === conversation.conversationId) return;

    console.log("Conversation Participants:", conversation.participants);
    console.log("Current User ID:", userId);

    const isParticipant = conversation.participants.some(
      (p) => p.participantId === userId
    );
    console.log("Is current user a participant?", isParticipant);

    if (isParticipant) {
      history.push(`/messages/${conversation.conversationId}`);
    } else {
      console.error("Access denied. The current user is not a participant in this conversation.");
    }
  };

  // Handler for starting a new conversation.
  const handleStartNewConversation = () => {
    history.push('/messages/new');
  };

  // Handler for confirming deletion of a conversation.
  const handleConfirmDelete = async (conversationId, e) => {
    e.stopPropagation();
    try {
      const response = await deleteConversation(conversationId, tokenToUse);
      if (response.success) {
        console.log('Conversation deleted successfully');
        alert('Conversation deleted successfully');
        setConversations(prev =>
          prev.filter(c => c.conversationId !== conversationId)
        );
      } else {
        console.error('Error deleting conversation:', response.message);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
    setConfirmDeleteId(null);
  };

  // Handler for right-clicking a conversation to toggle inline delete confirmation.
  const handleContextMenu = (e, conversationId) => {
    e.preventDefault();
    // Toggle the confirmation prompt off if already active for the same conversation.
    if (confirmDeleteId === conversationId) {
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(conversationId);
    }
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
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => handleConversationClick(conversation)}
                  onContextMenu={(e) => handleContextMenu(e, conversation.conversationId)}
                >
                  {confirmDeleteId === conversation.conversationId ? (
                    <div className="delete-confirmation" style={{ background: '#ffe6e6', padding: '10px' }}>
                      <p>Are you sure you want to delete this conversation?</p>
                      <button onClick={(e) => handleConfirmDelete(conversation.conversationId, e)}>Yes</button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}>Cancel</button>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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