import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { getClubById } from '../../service/clubService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PostStructure from '../../components/PostStructure/PostStructure';
import CommentSection from '../../components/CommentSection/CommentSection';

import './Club.css'; 

const Club = ({ token }) => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  // Get the current user ID from the location state
  const userId = location.state?.userId;

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.warn('No userId provided in location state');
      return;
    }

    const fetchClub = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getClubById(id, token);
        if (data) {
          setClub(data);
          console.log('Club Admin ID:', data.AdminID);
          console.log('Current User ID:', userId);

          if (data.AdminID === userId) {
            setIsAdmin(true);
            setIsMember(true);
          } else if (data.members && data.members.some(member => member.ID === userId)) {
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
    history.push(`/editClub/${id}`, { club, userId });
  };

  const handleLike = () => {
    console.log('Liked!');
  };

  const handleComment = () => {
    console.log('Commenting!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingScreen />
      </div>
    );
  }
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!club) return <p>No club found.</p>;

  return (
    <div className="club-page-container">
      <div className="club-main-content">
        <h1>{club.Name}</h1>
        {/* For non-admins, show the club description here */}
        {!isAdmin && <p>{club.Description}</p>}
        <p>Admin ID: {club.AdminID}</p>
        <p>Current User ID: {userId}</p>

        {isAdmin && (
          <div>
            <h3>Club Description:</h3>
            <p>{club.Description}</p>
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

        {/* Posts Section for this Club */}
        <div className="club-posts">
          <h3>Posts</h3>
          {club.posts && club.posts.length > 0 ? (
            <ul className="post-list">
              {club.posts.map((post) => (
                <li key={post.ID} className="post-item">
                  {/* Render each post with the PostStructure component */}
                  <PostStructure post={post} token={token} userId={userId} />
                  {/* Render the comment section for this post */}
                  <CommentSection postId={post.ID} token={token} userId={userId} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>

      {/* Sidebar with members list on the right */}
      {club.members && club.members.length > 0 && (
        <div className="club-members-sidebar">
          <h3>Members</h3>
          <ul className="member-list">
            {club.members.map((member) => (
              <li key={member.ID} className="member-item">
                {member.FirstName} {member.LastName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Club;