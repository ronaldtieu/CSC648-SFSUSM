const API_BASE_URL = 'http://localhost:4000/feed';

// Fetch the user's feed

export const fetchUserFeed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getFeed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session handling
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch user feed. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('fetchUserFeed: Data from backend:', data); // Log the full backend response
  
      if (!data.success) {
        throw new Error('Failed to fetch user feed: success flag is false.');
      }
  
      return data.feed; // Return only the feed array
    } catch (error) {
      console.error('Error in fetchUserFeed:', error);
      throw error;
    }
  };