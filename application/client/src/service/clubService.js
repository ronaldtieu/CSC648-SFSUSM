const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/groups';

// Helper function to get headers with the authorization token
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Create a new club
export const createClub = async (clubName, description, token) => {
  console.log('createClub payload:', { groupName: clubName, description });
  
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify({ groupName: clubName, description })
  });
  
  const data = await response.json();
  console.log('createClub: Data from backend:', data);
  return data;
};

// Update club information
export const updateClub = async ({ clubId, clubName, description }, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ groupId: clubId, groupName: clubName, description }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update club. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('updateClub: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to update club.');
    }

    return data;
  } catch (error) {
    console.error('Error in updateClub:', error);
    throw error;
  }
};

// Delete a club
export const deleteClub = async (clubId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      credentials: 'include',
      // Note: For DELETE with a request body, include the data in the "body" property.
      body: JSON.stringify({ groupId: clubId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete club. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('deleteClub: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete club.');
    }

    return data;
  } catch (error) {
    console.error('Error in deleteClub:', error);
    throw error;
  }
};

// Add a member to the club
export const addMember = async (clubId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/addMember`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ groupId: clubId, userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add member. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('addMember: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to add member.');
    }

    return data;
  } catch (error) {
    console.error('Error in addMember:', error);
    throw error;
  }
};

// Remove a member from the club (Admin only)
export const removeMember = async (clubId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/removeMember`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ groupId: clubId, userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove member. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('removeMember: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to remove member.');
    }

    return data;
  } catch (error) {
    console.error('Error in removeMember:', error);
    throw error;
  }
};

// Get club details
export const getClubDetails = async (clubId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${clubId}/details`, {
      method: 'GET',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch club details. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('getClubDetails: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch club details.');
    }

    return data.groupDetails;
  } catch (error) {
    console.error('Error in getClubDetails:', error);
    throw error;
  }
};

// Fetch club posts
export const getClubPosts = async (clubId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${clubId}/posts`, {
      method: 'GET',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch club posts. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('getClubPosts: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch club posts.');
    }

    return data.posts;
  } catch (error) {
    console.error('Error in getClubPosts:', error);
    throw error;
  }
};

// Get all clubs
export const getAllClubs = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getAllGroups`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  return response.json();
};

// Get all members of a club
export const getClubMembers = async (clubId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/getGroupMembers?groupId=${clubId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch club members. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('getClubMembers: Data from backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch club members.');
    }

    return data.members;
  } catch (error) {
    console.error('Error in getClubMembers:', error);
    throw error;
  }
};

// Get Data from Club
export const getClubById = async (clubId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getGroupById/${clubId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch club. Status: ${response.status}`);
      }
  
      const data = await response.json();
    //   console.log('getClubById: Data from backend:', data);
  
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch club.');
      }
  
      return data.group;
    } catch (error) {
      console.error('Error in getClubById:', error);
      throw error;
    }
  };

// Request to join a group
export const requestJoinClub = async (groupId, token) => {
  const response = await fetch(`${API_BASE_URL}/requestJoin`, {
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
  const response = await fetch(`${API_BASE_URL}/respondJoinRequest`, {
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
  const response = await fetch(`${API_BASE_URL}/showJoinRequests/${groupId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  return response.json();
};

