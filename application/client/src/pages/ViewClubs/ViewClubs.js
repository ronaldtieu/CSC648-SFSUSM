import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getAllGroups } from '../../service/groupService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const ViewClubs = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory(); 

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getAllGroups(token);
        if (data.success) {
          setGroups(data.groups || []);
          if (data.currentUserId) {
            setCurrentUserId(data.currentUserId);
          }
        } else {
          setError(data.message || 'Failed to fetch clubs.');
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Something went wrong while fetching clubs.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token]);

  useEffect(() => {
    if (currentUserId) {
      console.log('Current session user ID in ViewClubs.js:', currentUserId);
    }
  }, [currentUserId]);

  const handleClubClick = (clubId) => {
    console.log('Clicked club id:', clubId);
    history.push(`/club/${clubId}`, { userId: currentUserId });
  };

  return (
    <div>
      <h1>View Clubs</h1>
      {loading ? (
        <div className="loading-container">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : groups.length === 0 ? (
        <p>No clubs available.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.ID}>
              <span
                onClick={() => handleClubClick(group.ID)}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                <strong>{group.Name}</strong>
              </span>{' '}
              - Admin ID: {group.AdminID}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewClubs;