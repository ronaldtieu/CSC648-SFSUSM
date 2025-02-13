const API_BASE_URL = 'http://localhost:4000/users';


// Function to fetch user profile data from the session API
export const fetchUserProfile = async () => {
  try {
      console.log('Attempting to fetch user profile from /userInfo endpoint...');

      const response = await fetch(`${API_BASE_URL}/userInfo`, {
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

      if (!data.success) {
          throw new Error('The user is not logged in. Please log in and try again.');
      }

      // Extract the fields you need from the middleware's response
      const userProfile = {
          firstName: data.user.FirstName, 
          lastName: data.user.LastName,   
          email: data.user.Email,
          studentId: data.user.StudentID, 
          major: data.user.Major,
          minor: data.user.Minor,
          pronouns: data.user.Pronouns,
      };

      return userProfile; // Return the extracted user data
  } catch (error) {
      console.error('An error occurred while fetching the user profile:', error.message);
      throw error; // Re-throw error for handling in the calling function
  }
};

// Function to check session
export const checkSession = async () => {
    try {
        console.log('Checking session...');

        const response = await fetch(`${API_BASE_URL}/check-session`, {
            method: 'GET',
            credentials: 'include',  // Include cookies with the request
        });

        if (!response.ok) {
            throw new Error(`Failed to check session. Received HTTP status: ${response.status}.`);
        }

        const data = await response.json();
        console.log('Session check result:', data);

        return data; // Return session status and user data if available
    } catch (error) {
        console.error('Error checking session:', error.message);
        throw error; // Re-throw error for handling in the calling function
    }
};

// Function to edit user profile
export const updateUserProfile = async (profileData) => {
  try {
      const response = await fetch(`${API_BASE_URL}/edit-profile`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(profileData),
      });

      if (!response.ok) {
          throw new Error(`Failed to update profile. Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
          throw new Error(data.message || 'Failed to update profile.');
      }

      return data;
  } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
  }
};

// Function to log out the user by clearing the JWT cookie
export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Ensure cookies are included
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.clear(); // Clear the session storage
            window.location.href = '/'; // Redirect to the login page by reloading the page
        } else {
            console.error('Logout failed:', data.message);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

export const fetchMajors = async () => {
    try {
        const response = await fetch (`${API_BASE_URL}/majors`, {
            method: 'GET',
            credential: 'include', // ensuring all cookies are included
        });

        if(!response.ok) {
            throw new Error (`Response error. Status: ${response.status}`);
        }

        const data = await response.json();
        if(!data.success) {
            throw new Error ('Data fetch failed when fetching the majors.');
        }
        return data.message;
    }
    catch (error) {
        console.error('Try catch error when fetching majors: ', error.message);
        throw error;
    }
};

export const fetchMinors = async () => {
    try {
        const response = await fetch (`${API_BASE_URL}/minors`, {
            method: 'GET',
            credential: 'include', // ensuring all cookies are included
        });

        if(!response.ok) {
            throw new Error (`Response error. Status ${response.status}`);
        }

        const data = await response.json();
        if(!data.success) {
            throw new Error (`Data fetch failed when fetching the minors`)
        }
        return data.message;
    }
    catch(error) {
        console.error('Try catch errro when fetching minors: ', error.message);
        throw error;
    }
}

 
export const fetchUserById = async (id) => {
    if (!id) {
      throw new Error('User ID is required.');
    }
  
    const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile. Received HTTP status: ${response.status}.`);
    }
  
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('The response format was not JSON as expected.');
    }
  
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'User profile request was not successful.');
    }
  
    // Return the full user object as it was received
    // console.log('Returning full user object:', data.user);
    return data.user;
  };

export const registerUser = async (registrationData) => {
    try {
      console.log('Attempting to register a new user...');
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      });
  
      if (!response.ok) {
        throw new Error(`Registration failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Registration response:', data);
      return data;
    } catch (error) {
      console.error('Error registering user:', error.message);
      throw error;
    }
};