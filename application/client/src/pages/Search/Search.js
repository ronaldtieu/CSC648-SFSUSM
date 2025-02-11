import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSearchResults } from '../../service/searchService';
import PostStructure from '../../components/PostStructure/PostStructure';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const Search = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getResults = async () => {
      try {
        const searchData = await fetchSearchResults(query);
        setResults(searchData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (query) {
      getResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading)
    return (
      <div className="loading-container">
        <LoadingScreen />
      </div>
    );
  if (error) return <div className="error-screen">Error: {error}</div>;
  if (!results || (!results.users.length && !results.posts.length))
    return <div className="no-results-screen">No results found</div>;

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      <div className="search-users">
        <h3>Users</h3>
        {results.users && results.users.length > 0 ? (
          <ul>
            {results.users.map(user => (
              <li key={user.ID}>
                {user.FirstName} {user.LastName}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </div>
      <div className="search-posts">
        <h3>Posts</h3>
        {results.posts && results.posts.length > 0 ? (
          results.posts.map(post => (
            <PostStructure key={post.ID} post={post} />
          ))
        ) : (
          <p>No posts found</p>
        )}
      </div>
    </div>
  );
};

export default Search;