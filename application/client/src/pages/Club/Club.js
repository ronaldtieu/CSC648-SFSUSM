import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { 
  getClubById, 
  requestJoinClub, 
  showJoinRequests, 
  respondToJoinRequest 
} from '../../service/clubService';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PostStructure from '../../components/PostStructure/PostStructure';
import CreatePost from '../../components/CreatePost/CreatePost';

import './Club.css';

const Club = ({ token }) => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();

  // Use the passed token or fallback to localStorage
  const authToken = token || localStorage.getItem('token');

  // Convert userId from location.state to a number for consistent comparison.
  const userId = location.state?.userId ? Number(location.state.userId) : null;

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [requestPending, setRequestPending] = useState(false);

  // Function to fetch club details (including posts and members)
  const fetchClub = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClubById(id, authToken);
      if (data) {
        setClub(data);
        // Determine if the current user is admin or member (comparing numbers)
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

  // Fetch join requests if the user is admin
  const fetchJoinRequests = async () => {
    if (!club) return;
    try {
      const res = await showJoinRequests(club.ID, authToken);
      if (res.success) {
        setJoinRequests(res.joinRequests);
      } else {
        console.error(res.message);
      }
    } catch (err) {
      console.error('Error fetching join requests:', err);
    }
  };

  // Fetch club details on mount
  useEffect(() => {
    if (!userId) {
      console.warn('No userId provided in location state');
      return;
    }
    fetchClub();
  }, [id, authToken, userId]);

  // When club data changes and the user is admin, load join requests
  useEffect(() => {
    if (isAdmin && club) {
      fetchJoinRequests();
    }
  }, [isAdmin, club, authToken]);

  const handleEdit = () => {
    history.push(`/editClub/${id}`, { club, userId });
  };

  // Refresh club data when a new post is created
  const handleCreatePost = async () => {
    console.log('Post created in club!');
    await fetchClub();
  };

  // Request to join the group (for non-members)
  const handleRequestJoin = async () => {
    try {
      const res = await requestJoinClub(club.ID, authToken);
      if (res.success) {
        alert('Join request sent successfully.');
        setRequestPending(true);
        fetchClub();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error('Error requesting to join:', err);
    }
  };

  // Admin responds to a join request (approve or decline)
  const handleRespondJoin = async (joinRequestId, action) => {
    console.log("Responding to join request id:", joinRequestId, "with action:", action);
    try {
      const res = await respondToJoinRequest(joinRequestId, action, authToken);
      if (res.success) {
        alert(res.message);
        fetchJoinRequests(); // Refresh join requests after response.
        fetchClub();         // Optionally, refresh club data.
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error('Error responding to join request:', err);
    }
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

  // Filter posts: if the user is not a member, only show public posts
  const postsToShow = isMember
    ? club.posts
    : club.posts.filter(post => post.visibility === 'public');

  return (
    <div className="club-page-container">
      <div className="club-main-content">
        <h1>{club.Name}</h1>
        {/* Show description differently based on role */}
        {isAdmin ? (
          <div className="club-admin-section">
            <h3>Club Description:</h3>
            <p>{club.Description}</p>
            <button onClick={handleEdit}>Edit Club Details</button>
          </div>
        ) : (
          <p>{club.Description}</p>
        )}
        <p>Admin ID: {club.AdminID}</p>
        <p>Current User ID: {userId}</p>

        {/* Show join request button for non-members */}
        {(!isMember && !isAdmin) && (
          <div className="join-request-container">
            {requestPending ? (
              <button disabled>Request Pending</button>
            ) : (
              <button onClick={handleRequestJoin}>Request to Join</button>
            )}
          </div>
        )}

        {/* If admin, show join requests */}
        {isAdmin && (
          <div className="join-requests-section">
            <h3>Join Requests</h3>
            {joinRequests && joinRequests.length > 0 ? (
              <ul className="join-request-list">
                {joinRequests.map((req) => (
                  <li key={req.joinRequestId} className="join-request-item">
                    <span>
                      {req.FirstName} {req.LastName} ({req.Email})
                    </span>
                    <button onClick={() => handleRespondJoin(req.joinRequestId, 'approved')}>
                      Approve
                    </button>
                    <button onClick={() => handleRespondJoin(req.joinRequestId, 'declined')}>
                      Decline
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No join requests at the moment.</p>
            )}
          </div>
        )}

        {/* Only members see the Create Post section */}
        {isMember && (
          <div className="create-post-container">
            <h3>Create a Post</h3>
            <CreatePost onCreate={handleCreatePost} groupId={club.ID} />
          </div>
        )}

        {/* Posts Section */}
        <div className="club-posts">
          <h3>Posts</h3>
          {postsToShow && postsToShow.length > 0 ? (
            <ul className="post-list">
              {postsToShow.map((post) => (
                <li key={post.ID} className="post-item">
                  <PostStructure post={post} token={authToken} userId={userId} />
                  <p className="post-visibility">Visibility: {post.visibility}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>

      {/* Sidebar with members */}
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