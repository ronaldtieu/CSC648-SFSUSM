import React, { useState, useEffect } from 'react';
import { 
  getConversationMembers, 
  addUserToConversation, 
  removeUserFromConversation 
} from '../../service/messageService';
import { searchUsers } from '../../service/profileService';
import './Participants.css';

const Participants = ({ conversationId, currentUser }) => {
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch conversation members when conversationId changes
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    getConversationMembers(conversationId, token)
      .then((data) => {
        if (data.success && data.members) {
          setParticipants(data.members);
        }
      })
      .catch((err) => {
        console.error("Error fetching conversation members:", err);
      });
  }, [conversationId]);

  // Fetch participant suggestions when adding a participant
  useEffect(() => {
    if (adding && query.trim().length > 1 && currentUser && currentUser.id) {
      console.log("Calling searchUsers with query:", query, "and userId:", currentUser.id);
      searchUsers(query, currentUser.id)
        .then((data) => {
          console.log("searchUsers response:", data);
          if (data.success) {
            setSuggestions(data.users);
          } else {
            setSuggestions([]);
          }
        })
        .catch((err) => {
          console.error("Error in searchUsers:", err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [query, adding, currentUser]);

  // Handle adding a participant
  const handleAdd = async (user) => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const data = await addUserToConversation(conversationId, user.ID, token);
      if (data.success) {
        setParticipants((prev) => [...prev, user]);
        setQuery('');
        setSuggestions([]);
        setAdding(false);
      } else {
        setError(data.message || 'Failed to add participant.');
      }
    } catch (err) {
      setError('An error occurred while adding participant.');
    }
  };

  // Handle removing a participant
  const handleRemove = async (userId) => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const data = await removeUserFromConversation(conversationId, userId, token);
      if (data.success) {
        setParticipants((prev) => prev.filter((member) => member.ID !== userId));
      } else {
        setError(data.message || 'Failed to remove participant.');
      }
    } catch (err) {
      setError('An error occurred while removing participant.');
    }
  };

  // Build a string of participant names (e.g., "John Doe, Jane Smith")
  const participantNames = participants.map(
    (member) => `${member.FirstName} ${member.LastName}`
  ).join(', ');

  // Truncate the display if the names string is too long
  const maxChars = 50;
  let displayNames = participantNames;
  if (participantNames.length > maxChars) {
    displayNames = participantNames.substring(0, maxChars) + '...';
  }

  return (
    <>
      {/* Banner Section */}
      <div className="participants-banner">
        <span>Participants: {participantNames ? displayNames : 'None'}</span>
        <button onClick={() => setShowPopup(true)}>View Participants</button>
      </div>

      {/* Modal Popup */}
      {showPopup && (
        <div className="participants-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="participants-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-button" onClick={() => setShowPopup(false)}>
              &times;
            </button>
            <h2>Participants</h2>
            <ul className="participants-list">
              {participants.map((member) => (
                <li key={member.ID}>
                  {member.FirstName} {member.LastName} ({member.Email})
                  <button onClick={() => handleRemove(member.ID)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="add-participant-section">
              {adding ? (
                <>
                  <input
                    type="text"
                    placeholder="Search users to add"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {suggestions.length > 0 && (
                    <ul className="participant-suggestions">
                      {suggestions.map((user) => (
                        <li key={user.ID} onClick={() => handleAdd(user)}>
                          {user.FirstName} {user.LastName} ({user.Email})
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => setAdding(false)}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setAdding(true)}>Add Participant</button>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default Participants;