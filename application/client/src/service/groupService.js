const BASE_URL = 'http://localhost:4000/groups'; 

// Create a new group
export const createGroup = async (groupName) => {
    const response = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // Ensures session cookie is sent
        body: JSON.stringify({ groupName })  // Do NOT send adminId manually
    });

    return response.json();
};

// Update group information
export const updateGroup = async (groupId, groupName, token) => {
    const response = await fetch(`${BASE_URL}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId, groupName })
    });
    return response.json();
};

// Delete a group
export const deleteGroup = async (groupId, token) => {
    const response = await fetch(`${BASE_URL}/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId })
    });
    return response.json();
};

// Add a member to a group
export const addMember = async (groupId, userId, token) => {
    const response = await fetch(`${BASE_URL}/addMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId, userId })
    });
    return response.json();
};

// Remove a member from a group
export const removeMember = async (groupId, userId, token) => {
    const response = await fetch(`${BASE_URL}/removeMember`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId, userId })
    });
    return response.json();
};

// Get group details
export const getGroupDetails = async (groupId, token) => {
    const response = await fetch(`${BASE_URL}/details/${groupId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Fetch group posts
export const getGroupPosts = async (groupId, token) => {
    const response = await fetch(`${BASE_URL}/posts/${groupId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Fetch all groups
export const getAllGroups = async (token) => {
    const response = await fetch(`${BASE_URL}/getAllGroups`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include' 
    });
    return response.json();
};

// Request to join a group
export const requestJoinGroup = async (groupId, token) => {
    const response = await fetch(`${BASE_URL}/requestJoin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ groupId })
    });
    return response.json();
};

// Respond to a join request (approve or decline)
export const respondToJoinRequest = async (joinRequestId, action, token) => {
    const response = await fetch(`${BASE_URL}/respondJoinRequest`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ joinRequestId, action })
    });
    return response.json();
};

// Show join requests for a group
export const showJoinRequests = async (groupId, token) => {
    const response = await fetch(`${BASE_URL}/showJoinRequests/${groupId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};