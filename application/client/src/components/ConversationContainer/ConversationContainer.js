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
    if (!messageContent.trim()) {
      console.log('No message content to send.');
      return;
    }
    
    const token = sessionStorage.getItem('accessToken');
    // console.log('Token retrieved:', token);
    // console.log('Conversation ID:', conversationId);
    // console.log('Message content:', messageContent);

    try {
      const data = await sendMessage(conversationId, messageContent, token);
      // console.log('Response from sendMessage:', data);

      if (data.success) {
        const newMessage = {
          messageId: data.messageId,
          content: messageContent,
          sentAt: new Date().toISOString(),
          senderId: currentUser.id,
          senderFirstName: currentUser.firstName,
          senderLastName: currentUser.lastName,
        };

        // Log the message object and the sender's user ID
        // console.log('Sending message:', newMessage);
        // console.log('Message sent by user:', currentUser.id);
        
        // Append the message to the local state
        setMessages((prev) => [...prev, newMessage]);

        // Check the socketRef before emitting
        if (socketRef && socketRef.current) {
          // console.log('Emitting sendMessage event via socket:', newMessage);
          socketRef.current.emit('sendMessage', newMessage, (ack) => {
            // console.log('Socket acknowledgement received:', ack);
          });
        } else {
          console.warn('SocketRef is missing or not initialized.');
        }
        setMessageContent('');
      } else {
        console.error('Error response from sendMessage:', data.message);
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Send message error:', err);
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