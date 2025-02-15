import React, { useState, useEffect } from 'react';
import { getConversationMembers, addUserToConversation } from '../../service/messageService';
import { searchUsers } from '../../service/profileService';
import './Participants.css';

const Participants = ({ conversationId, currentUser }) => {
  const [conversationParticipants, setConversationParticipants] = useState([]);
  const [error, setError] = useState('');
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [participantQuery, setParticipantQuery] = useState('');
  const [participantSuggestions, setParticipantSuggestions] = useState([]);

  // Fetch conversation members on mount and when conversationId changes
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    getConversationMembers(conversationId, token)
      .then((data) => {
        if (data.success && data.members) {
          setConversationParticipants(data.members);
        }
      })
      .catch((err) => {
        // Optionally handle error
      });
  }, [conversationId]);

  // Fetch participant suggestions when adding a participant
  useEffect(() => {
    if (addingParticipant && participantQuery.trim().length > 1 && currentUser && currentUser.id) {
      searchUsers(participantQuery, currentUser.id)
        .then((data) => {
          if (data.success) {
            setParticipantSuggestions(data.users);
          } else {
            setParticipantSuggestions([]);
          }
        })
        .catch((err) => {
          setParticipantSuggestions([]);
        });
    } else {
      setParticipantSuggestions([]);
    }
  }, [participantQuery, addingParticipant, currentUser]);

  // Handle adding a participant to the conversation
  const handleAddParticipant = async (user) => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const data = await addUserToConversation(conversationId, user.id, token);
      if (data.success) {
        setConversationParticipants((prev) => [...prev, user]);
        setParticipantQuery('');
        setParticipantSuggestions([]);
        setAddingParticipant(false);
      } else {
        setError(data.message || 'Failed to add participant.');
      }
    } catch (err) {
      setError('An error occurred while adding participant.');
    }
  };

  // Create a string of participant names (e.g., "John Doe, Jane Smith")
  const participantNames = conversationParticipants.map(
    (member) => `${member.FirstName} ${member.LastName}`
  );

  return (
    <div className="participants-container">
      <div className="participants-header">
        Participants: {participantNames.length > 0 ? participantNames.join(', ') : 'None'}
        <button onClick={() => setAddingParticipant(true)}>Add Participants</button>
      </div>
      {addingParticipant && (
        <div className="add-participant">
          <input
            type="text"
            placeholder="Search users to add"
            value={participantQuery}
            onChange={(e) => setParticipantQuery(e.target.value)}
          />
          {participantSuggestions.length > 0 && (
            <ul className="participant-suggestions">
              {participantSuggestions.map((user) => (
                <li key={user.id} onClick={() => handleAddParticipant(user)}>
                  {user.firstName} {user.lastName} ({user.email})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Participants;