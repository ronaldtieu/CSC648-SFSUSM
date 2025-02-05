import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getAllGroups } from '../../service/groupService';

const ViewClubs = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory(); // Hook for navigation

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getAllGroups(token);
        if (data.success) {
          setGroups(data.groups || []);
        } else {
          setError(data.message || 'Failed to fetch clubs.');
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setError('Something went wrong while fetching clubs.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token]);

  // Handler to redirect to the club page with the clubId
  const handleClubClick = (clubId) => {
    console.log('Clicked club id : ', clubId);
    history.push(`/club/${clubId}`);
  };

  return (
    <div>
      <h1>View Clubs</h1>
      {loading && <p>Loading clubs...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && groups.length === 0 && <p>No clubs available.</p>}
      <ul>
        {groups.map((group) => {
          const clubId = group.ID;
          return (
            <li key={clubId}>
              <span
                onClick={() => handleClubClick(clubId)}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                <strong>{group.Name}</strong>
              </span>{' '}
              - Admin ID: {group.AdminID}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ViewClubs;