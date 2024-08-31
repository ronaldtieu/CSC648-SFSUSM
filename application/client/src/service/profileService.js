// profileService.js

const API_BASE_URL = 'http://localhost:4000/users';


// Function to fetch user profile data from the session API
export const fetchUserProfile = async () => {
    try {
      console.log('Attempting to fetch user profile from /check-session endpoint...');
  
      const response = await fetch(`${API_BASE_URL}/check-session`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile. Received HTTP status: ${response.status}. Please check if the server is running and the endpoint is correct.`);
      }
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();  // Attempt to get the text response
        console.error('Received non-JSON response:', text);  // Log the response for debugging
        throw new Error('The response format was not JSON as expected. Please ensure the server is returning JSON.');
      }
  
      const data = await response.json();
      console.log('Successfully fetched user profile data:', data);
  
      if (!data.loggedIn) {
        throw new Error('The user is not logged in. Please log in and try again.');
      }
  
      return data.user; // Return user data
    } catch (error) {
      console.error('An error occurred while fetching the user profile:', error.message);
      throw error; // Re-throw error for handling in the calling function
    }
  };

// Function to update user profile
export const updateUserProfile = async (profileData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message); // Handle error from the backend
    }

    return data; // Return response data
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error; // Re-throw error for handling in the calling function
  }
};