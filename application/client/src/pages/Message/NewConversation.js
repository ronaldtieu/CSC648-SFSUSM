import React, { useState } from 'react';
import { searchUsers } from '../../service/profileService';
import { createConversation } from '../../service/messageService';

const NewConversation = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const token = sessionStorage.getItem('accessToken');

  // Perform the user search
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

  // Select a user from the search results
  const handleSelectUser = (user) => {
    // Avoid adding the same user twice
    setSelectedUsers(prev => {
      if (prev.find(u => u.ID === user.ID)) return prev;
      return [...prev, user];
    });
  };

  // Create a conversation with the selected users
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    const receiverIds = selectedUsers.map(user => user.ID);

    // Log the inputs being used for the conversation creation
    console.log('Creating conversation with the following inputs:');
    console.log('Token (for user authentication):', token);
    console.log('Receiver IDs:', receiverIds);
    console.log('Selected Users:', selectedUsers);

    try {
      const response = await createConversation(receiverIds, token);
      if (response.success) {
        console.log('Conversation created with id:', response.conversationId);
        alert(`Conversation created with id: ${response.conversationId}`);
      } else {
        console.error('Error creating conversation:', response.message);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="new-conversation">
      <h1>New Conversation</h1>
      <div>
        <input
          type="text"
          placeholder="Search users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <ul>
        {results.map((user) => (
          <li key={user.ID}>
            {user.FirstName} {user.LastName} ({user.Email})
            <button onClick={() => handleSelectUser(user)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedUsers.length > 0 && (
        <div>
          <h2>Selected Users</h2>
          <ul>
            {selectedUsers.map((user) => (
              <li key={user.ID}>
                {user.FirstName} {user.LastName}
              </li>
            ))}
          </ul>
          <button onClick={handleCreateConversation}>
            Create Conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default NewConversation;