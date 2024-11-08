const BASE_URL = 'http://localhost:4000/messages'; // Adjust the base URL as necessary

// Create a new conversation
export const createConversation = async (receiverIds, token) => {
    const response = await fetch(`${BASE_URL}/createConversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverIds })
    });
    return response.json();
};

// Send a message within a conversation
export const sendMessage = async (conversationId, messageContent, token) => {
    const response = await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId, messageContent })
    });
    return response.json();
};

// Get messages from a specific conversation
export const getMessages = async (conversationId, token) => {
    const response = await fetch(`${BASE_URL}/${conversationId}/messages`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Delete a conversation
export const deleteConversation = async (conversationId, token) => {
    const response = await fetch(`${BASE_URL}/${conversationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Add a user to a conversation
export const addUserToConversation = async (conversationId, userId, token) => {
    const response = await fetch(`${BASE_URL}/addUserToConversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId, userId })
    });
    return response.json();
};

// Remove a user from a conversation
export const removeUserFromConversation = async (conversationId, userIdToRemove, token) => {
    const response = await fetch(`${BASE_URL}/removeUserFromConversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId, userIdToRemove })
    });
    return response.json();
};

// Get all conversations for the logged-in user
export const getAllConversations = async (token) => {
    const response = await fetch(`${BASE_URL}/allConversations`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Get all members from a conversation
export const getConversationMembers = async (conversationId, token) => {
    const response = await fetch(`${BASE_URL}/allMembersFromConversation`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId })
    });
    return response.json();
};

