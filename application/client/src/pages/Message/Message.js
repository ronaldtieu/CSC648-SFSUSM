import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getMessages } from '../../service/messageService';
import { checkSession } from '../../service/profileService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import ConversationContainer from '../../components/ConversationContainer/ConversationContainer';
import { initializeSocket, disconnectSocket } from '../../service/socket'; 
import './Message.css';

const Message = ({ currentUser: propUser }) => {
  const { conversationId } = useParams();
  const isNewConversation = conversationId === 'new';
  const history = useHistory();

  const [currentUser, setCurrentUser] = useState(propUser);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Retrieve current user from session if not provided
  useEffect(() => {
    if (!currentUser) {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        checkSession(token)
          .then((data) => {
            if (data.success && data.user && data.user.id) {
              setCurrentUser(data.user);
            } else {
              setError('Failed to retrieve session information.');
            }
          })
          .catch(() =>
            setError('An error occurred while verifying session information.')
          )
          .finally(() => setLoading(false));
      } else {
        setError('No session token found.');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Redirect to NewConversation page if conversationId indicates a new conversation
  useEffect(() => {
    if (isNewConversation) {
      history.push('/new-conversation');
    }
  }, [isNewConversation, history]);

  // Fetch messages for existing conversation
  useEffect(() => {
    if (!isNewConversation && currentUser && currentUser.id) {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Access token not found.');
        setLoading(false);
        return;
      }
      getMessages(conversationId, token)
        .then((data) => {
          if (data.success) {
            setMessages(data.messages);
          } else {
            setError(data.message || 'Error fetching messages.');
          }
        })
        .catch(() => setError('An error occurred while fetching messages.'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [conversationId, currentUser, isNewConversation]);

  // Initialize WebSocket for real-time updates on existing conversations
  useEffect(() => {
    if (!isNewConversation && currentUser && currentUser.id) {
      initializeSocket(conversationId, currentUser, (message) => {
        setMessages((prevMessages) => {
          // Avoid duplicate messages
          if (prevMessages.some((m) => m.messageId === message.messageId)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      });
      return () => {
        disconnectSocket();
      };
    }
  }, [conversationId, currentUser, isNewConversation]);

  return (
    <div className="message-page">
      <h1>Conversation: {conversationId}</h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <ConversationContainer
          conversationId={conversationId}
          currentUser={currentUser}
          messages={messages}
          setMessages={setMessages}
        />
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Message;