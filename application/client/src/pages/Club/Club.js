import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getClubById } from '../../service/clubService';

const Club = ({ token, userId }) => {
  const { id } = useParams();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchClub = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getClubById(id, token);
        if (data) {
          setClub(data);
          if (data.AdminID === userId) {
            setIsAdmin(true);
            setIsMember(true);
          }
          else if (data.members && data.members.includes(userId)) {
            setIsMember(true);
          }
        } else {
          setError('Failed to fetch club.');
        }
      } catch (err) {
        console.error('Error fetching club:', err);
        setError('Something went wrong while fetching the club.');
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id, token, userId]);

  const handleEdit = () => {
    console.log('Editing club...');
  };

  const handleLike = () => {
    console.log('Liked!');
  };

  const handleComment = () => {
    console.log('Commenting...');
  };

  if (loading) return <p>Loading club...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!club) return <p>No club found.</p>;

  return (
    <div>
      <h1>{club.Name}</h1>
      <p>{club.Description}</p>
      <p>Admin ID: {club.AdminID}</p>

      {isAdmin && (
        <div>
          <h3>Admin Options:</h3>
          <button onClick={handleEdit}>Edit Club Details</button>
        </div>
      )}

      {isMember && !isAdmin && (
        <div>
          <h3>Member Actions:</h3>
          <button onClick={handleLike}>Like</button>
          <button onClick={handleComment}>Comment</button>
        </div>
      )}

      {!isMember && (
        <p>You are not a member of this club. You can only view the club details.</p>
      )}

    </div>
  );
};

export default Club;