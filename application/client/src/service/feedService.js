const API_BASE_URL = 'http://localhost:4000/feed';

// Fetch the user's feed
export const fetchUserFeed = async () => {
    try {
        console.log('Attempting to fetch user feed from /getUserFeed endpoint...');

        const response = await fetch(`${API_BASE_URL}/getUserFeed`, {
            method: 'GET',
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user feed. Received HTTP status: ${response.status}. Please check if the server is running and the endpoint is correct.`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Received non-JSON response:', text);
            throw new Error('The response format was not JSON as expected. Please ensure the server is returning JSON.');
        }

        const data = await response.json();
        console.log('Successfully fetched user feed:', data);

        if (!data.success) {
            throw new Error('Failed to fetch user feed.');
        }

        return data.posts;
    } catch (error) {
        console.error('An error occurred while fetching user feed:', error.message);
        throw error;
    }
};