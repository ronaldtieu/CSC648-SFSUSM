const API_BASE_URL = 'http://localhost:4000/search';

export const fetchSearchResults = async (query) => {
  try {
    if (!query) {
      throw new Error('Search query is required.');
    }

    const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch search results. Received HTTP status: ${response.status}.`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('The response format was not JSON as expected.');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Search request was not successful.');
    }

    return data.results;
  } catch (error) {
    throw error;
  }
};