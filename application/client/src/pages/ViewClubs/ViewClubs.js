import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getAllClubs } from '../../service/clubService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const ViewClubs = ({ token }) => {
  const [clubs, setClubs] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory(); 

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllClubs(token);
        console.log('getAllClubs: Data from backend:', data);
        if (data.success) {
          // If your backend returns the clubs in data.groups, use that.
          setClubs(data.groups || []);
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

    fetchClubs();
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
      ) : clubs.length === 0 ? (
        <p>No clubs available.</p>
      ) : (
        <ul>
          {clubs.map((club) => (
            <li key={club.ID}>
              <span
                onClick={() => handleClubClick(club.ID)}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                <strong>{club.Name}</strong>
              </span>{' '}
              - Admin ID: {club.AdminID}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewClubs;