import React, { useState } from 'react';
import { searchUsers } from '../../service/profileService';

const NewConversation = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const token = sessionStorage.getItem('accessToken');

  const handleSearch = async () => {
    try {
      const data = await searchUsers(query, token);
      if (data.success) {
        setResults(data.users);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="new-conversation">
      <h1>New Conversation</h1>
      <input
        type="text"
        placeholder="Search users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((user) => (
          <li key={user.ID}>
            {user.FirstName} {user.LastName} ({user.Email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewConversation;