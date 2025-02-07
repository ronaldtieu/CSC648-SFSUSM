import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { getClubById, updateClub } from '../../service/clubService';

const EditClub = ({ token }) => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const userId = location.state?.userId;

  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.club) {
      setClubName(location.state.club.Name);
      setDescription(location.state.club.Description);
      setLoading(false);
    } else {
      const fetchClub = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await getClubById(id, token);
          if (data) {
            setClubName(data.Name);
            setDescription(data.Description);
          } else {
            setError('Failed to fetch club details.');
          }
        } catch (err) {
          console.error('Error fetching club details:', err);
          setError('Something went wrong while fetching club details.');
        } finally {
          setLoading(false);
        }
      };

      fetchClub();
    }
  }, [id, token, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call updateClub with an object containing clubId, clubName, and description.
      const response = await updateClub({ clubId: id, clubName, description }, token);
      if (response.success) {
        // Redirect back to the club page with updated data.
        history.push(`/club/${id}`, { userId });
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error updating club:', err);
      setError('Failed to update club.');
    }
  };

  if (loading) return <p>Loading club details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Edit Club Details</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clubName">Club Name:</label>
          <input
            type="text"
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Club</button>
      </form>
    </div>
  );
};

export default EditClub;