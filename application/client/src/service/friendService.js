const API_BASE_URL = 'http://localhost:4000/friends';

// Send Friend Request
export const sendFriendRequest = async (receiverId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/sendReq`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId }),
            credentials: 'include'  // Ensures cookies (like tokens) are sent
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
    }
};

// Accept Friend Request
export const acceptFriendRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/acceptReq`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

// Decline Friend Request
export const declineFriendRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/declineReq`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Error declining friend request:', error);
        throw error;
    }
};

// Remove Friend
export const removeFriend = async (friendId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/removeFriend`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId }),
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Error removing friend:', error);
        throw error;
    }
};

// Get List of Friends
export const getFriendsList = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/listFriends`, {
            method: 'GET',
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Error retrieving friends list:', error);
        throw error;
    }
};

// Get List of Friend Requests
export const getFriendRequests = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/listFriendReq`, {
            method: 'GET',
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Error retrieving friend requests:', error);
        throw error;
    }
};

