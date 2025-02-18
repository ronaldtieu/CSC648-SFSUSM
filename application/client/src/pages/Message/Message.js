import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { getMessages, sendMessage, createConversation, checkExistingConversation } from '../../service/messageService';
import { searchUsers, checkSession } from '../../service/profileService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import ConversationContainer from '../../components/ConversationContainer/ConversationContainer';
import { initializeSocket, disconnectSocket } from '../../service/socket'; 
import './Message.css';

const Message = ({ currentUser: propUser }) => {
  const { conversationId } = useParams();
  const isNewConversation = conversationId === 'new';
  const history = useHistory();
  const location = useLocation();
  const { receiverIds: initialReceiverIds } = location.state || {};

  const [currentUser, setCurrentUser] = useState(propUser);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // States for new conversation branch (recipient search)
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientSuggestions, setRecipientSuggestions] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // Retrieve current user from session if not passed in
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

  // Fetch messages for existing conversations
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

  // Recipient suggestions for new conversation
  useEffect(() => {
    if (isNewConversation && recipientQuery.trim().length > 1 && currentUser && currentUser.id) {
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
  }, [recipientQuery, currentUser, isNewConversation]);

  const handleSelectRecipient = async (user) => {
    setSelectedRecipient(user);
    setRecipientQuery(user.email);
    setRecipientSuggestions([]);
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

  const handleStartNewConversation = async () => {
    if (!messageContent.trim() || !selectedRecipient) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const existing = await checkExistingConversation([selectedRecipient.id], currentUser.id);
      if (existing.success && existing.conversationId) {
        history.push(`/messages/${existing.conversationId}`);
        return;
      }
      const createData = await createConversation([selectedRecipient.id], token);
      if (createData.success) {
        const newConversationId = createData.conversationId;
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

  // Initialize WebSocket for existing conversations using our external socket module
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
      // Clean up the socket connection on unmount
      return () => {
        disconnectSocket();
      };
    }
  }, [conversationId, currentUser, isNewConversation]);

  return (
    <div className="message-page">
      <h1>{isNewConversation ? 'New Conversation' : `Conversation: ${conversationId}`}</h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          {isNewConversation ? (
            <div className="new-conversation">
              <div className="recipient-input">
                <label>Recipient:</label>
                <input
                  type="text"
                  value={recipientQuery}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setRecipientQuery(inputValue);
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
            </div>
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
      )}
    </div>
  );
};

export default Message;