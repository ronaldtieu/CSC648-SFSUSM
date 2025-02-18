import io from 'socket.io-client';

let socket = null;

/**
 * Initializes the WebSocket connection.
 *
 * @param {string} conversationId - The ID of the conversation.
 * @param {object} currentUser - The current user object.
 * @param {function} onMessageReceived - Callback to handle new messages.
 * @returns {object|null} The socket instance.
 */
export const initializeSocket = (conversationId, currentUser, onMessageReceived) => {
  if (!conversationId || !currentUser || !currentUser.id) {
    console.warn('Socket initialization skipped: missing conversationId or currentUser.');
    return null;
  }
  
  socket = io('http://localhost:4000', { withCredentials: true });
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // If your server uses room-based logic, join the conversation room.
    socket.emit('joinConversation', { conversationId });
  });
  
  socket.on('receiveMessage', (message) => {
    console.log('Received message:', message);
    if (typeof onMessageReceived === 'function') {
      onMessageReceived(message);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  return socket;
};

/**
 * Disconnects the WebSocket connection.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};