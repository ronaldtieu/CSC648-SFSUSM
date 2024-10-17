import React, { useEffect, useState } from 'react';
import { fetchUserPosts } from '../../service/profileService';  // Import the function to fetch posts
import { Link } from 'react-router-dom';  // Import Link to handle navigation
import './Profile.css';  // Import a CSS file for the profile-specific styles
import { FaPaperPlane, FaThumbsUp, FaComment } from 'react-icons/fa';  // Import icons for like and comment

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState(''); // For post input

  useEffect(() => {
    const loadUserPosts = async () => {
      try {
        const postsData = await fetchUserPosts();
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    loadUserPosts();
  }, []);

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePost = () => {
    console.log("Post content:", postContent);
    setPostContent('');  // Reset the input after submission
  };

  return (
    <div className="profile">
      <h1>My Profile</h1>

      {/* View Profile Button */}
      <div className="view-profile">
        <Link to="/view-profile" className="view-profile-button">
          View Profile
        </Link>
      </div>

      {/* Post input section */}
      <section className="post-section">
        <textarea 
          className="post-input" 
          value={postContent} 
          onChange={handleChange} 
          placeholder="Share something..."
        />
        <button className="post-button" title="Post" onClick={handlePost}>
          <FaPaperPlane />
        </button>
      </section>

      {/* Check if posts are loading */}
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="post-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.ID} className="post-item">
                <h2>{post.FirstName} {post.LastName}</h2>
                <p>{post.Content}</p>
                <span>{new Date(post.CreatedAt).toLocaleString()}</span>

                {/* Like and Comment Section */}
                <div className="post-actions">
                  <button className="like-button">
                    <FaThumbsUp /> Like
                  </button>
                  <button className="comment-button">
                    <FaComment /> Comment
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;