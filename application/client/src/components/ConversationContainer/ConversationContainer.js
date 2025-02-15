import React, { useState } from 'react';
import { sendMessage } from '../../service/messageService';
import Participants from '../../components/ConversationParticipants/Participants';
import './ConversationContainer.css';

const ConversationContainer = ({ 
  conversationId, 
  currentUser, 
  messages, 
  setMessages, 
  socketRef 
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState('');

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const data = await sendMessage(conversationId, messageContent, token);
      if (data.success) {
        const newMessage = {
          messageId: data.messageId,
          content: messageContent,
          sentAt: new Date().toISOString(),
          senderId: currentUser.id,
          senderFirstName: currentUser.firstName,
          senderLastName: currentUser.lastName,
        };
        setMessages((prev) => [...prev, newMessage]);
        socketRef.current.emit('sendMessage', newMessage);
        setMessageContent('');
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('An error occurred while sending the message.');
    }
  };

  return (
    <div className="conversation-container">
      {/* Render the Participants component at the top */}
      <Participants conversationId={conversationId} currentUser={currentUser} />

      {/* Message display */}
      <div className="conversation-messages">
        <ul>
          {messages.map((msg) => (
            <li
              key={msg.messageId}
              className={`message-item ${msg.senderId === currentUser.id ? 'own-message' : 'other-message'}`}
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

      {/* Message input area */}
      <div className="message-input">
        <textarea
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        ></textarea>
        <button onClick={handleSendMessage}>Send Message</button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ConversationContainer;