import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { getMessages,sendMessage,createConversation,checkExistingConversation,getConversationMembers } from '../../service/messageService';
import { searchUsers, checkSession } from '../../service/profileService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import './Message.css';

const Message = ({ currentUser: propUser }) => {
  const { conversationId } = useParams();
  const isNewConversation = conversationId === 'new';
  const history = useHistory();
  const location = useLocation();
  const { receiverIds: initialReceiverIds } = location.state || {};

  const [currentUser, setCurrentUser] = useState(propUser);
  const [messages, setMessages] = useState([]);
  const [conversationParticipants, setConversationParticipants] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientSuggestions, setRecipientSuggestions] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

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
          .catch(() => {
            setError('An error occurred while verifying session information.');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setError('No session token found.');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (initialReceiverIds) {
        console.log("Initial Receiver IDs:", initialReceiverIds);
      }
    }
  }, [currentUser, conversationId, isNewConversation, initialReceiverIds]);

  useEffect(() => {
    if (!isNewConversation && currentUser && currentUser.id) {
      const token = sessionStorage.getItem('accessToken');
    //   console.log('Token from sessionStorage:', token);
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
        .catch(() => {
          setError('An error occurred while fetching messages.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [conversationId, currentUser, isNewConversation]);

  useEffect(() => {
    if (!isNewConversation && currentUser && currentUser.id) {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      getConversationMembers(conversationId, token)
        .then((data) => {
        //   console.log("getConversationMembers result:", data);
          if (data.success && data.members) {
            setConversationParticipants(data.members);
          }
        })
        .catch((err) => {
          console.error("Error fetching conversation members:", err);
        });
    }
  }, [conversationId, currentUser, isNewConversation]);

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
        .catch(() => {
          setRecipientSuggestions([]);
        });
    } else {
      setRecipientSuggestions([]);
    }
  }, [recipientQuery, currentUser]);

  useEffect(() => {
    if (selectedRecipient) {
      console.log("Selected Recipient:", selectedRecipient);
    }
  }, [selectedRecipient]);

  const handleSelectRecipient = async (user) => {
    setSelectedRecipient(user);
    setRecipientQuery(user.email);
    setRecipientSuggestions([]);
    if (currentUser && currentUser.id) {
      const existing = await checkExistingConversation([user.id], currentUser.id);
      if (existing.success && existing.conversationId) {
        // console.log("Existing conversation found:", existing.conversationId);
        history.push(`/messages/${existing.conversationId}`);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    const token = sessionStorage.getItem('accessToken');
    if (!isNewConversation) {
      try {
        const data = await sendMessage(conversationId, messageContent, token);
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            {
              messageId: data.messageId,
              content: messageContent,
              sentAt: new Date().toISOString(),
              senderId: currentUser.id,
              senderFirstName: currentUser.firstName,
              senderLastName: currentUser.lastName,
            },
          ]);
          setMessageContent('');
        } else {
          setError(data.message || 'Failed to send message.');
        }
      } catch (err) {
        setError('An error occurred while sending the message.');
      }
    } else {
      if (!selectedRecipient) {
        setError('Please select a recipient.');
        return;
      }
      try {
        const createData = await createConversation([selectedRecipient.id], token);
        if (createData.success) {
          const newConversationId = createData.conversationId;
          console.log("New conversation created:", newConversationId);
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
    }
  };

  const participantNames = conversationParticipants.map(
    (member) => `${member.FirstName} ${member.LastName}`
  );
//   console.log("Computed participantNames:", participantNames);

  return (
    <div className="message-page">
      <h1>{isNewConversation ? 'New Conversation' : `Conversation: ${conversationId}`}</h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          {isNewConversation && (
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
          )}
          {!isNewConversation && (
            <div className="conversation-container">
              <div className="conversation-header">
                Participants:{" "}
                {participantNames.length > 0 ? participantNames.join(', ') : 'None'}
              </div>
              <div className="conversation-messages">
                <ul>
                  {messages.map((msg) => (
                    <li
                      key={msg.messageId}
                      className={`message-item ${
                        msg.senderId === currentUser.id ? 'own-message' : 'other-message'
                      }`}
                    >
                      {msg.senderId !== currentUser.id && (
                        <div className="sender-name">
                          {msg.senderFirstName} {msg.senderLastName}
                        </div>
                      )}
                      <p className="message-content">{msg.content}</p>
                      <small className="message-timestamp">{msg.sentAt}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="message-input">
            <textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            ></textarea>
            <button onClick={handleSendMessage}>
              {isNewConversation ? 'Start Conversation' : 'Send Message'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Message;