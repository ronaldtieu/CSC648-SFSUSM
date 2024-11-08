import React, { useState, useEffect } from 'react';
import './Home.css';
import { FaPaperPlane } from 'react-icons/fa';
import { fetchUserFeed } from '../../service/feedService';

const Home = () => {
  const [postContent, setPostContent] = useState('');
  const [feedPosts, setFeedPosts] = useState([]);  // Ensure default to an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load feed on component mount
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const posts = await fetchUserFeed();
        setFeedPosts(posts || []);  // Fallback to empty array if posts is undefined
      } catch (err) {
        setFeedPosts([]);  // Set to empty array if fetching fails
        setError('Failed to load feed. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  return (
    <div className="home">
      <section className="post-section">
        <textarea
          className="post-input"
          value={postContent}
          onChange={handleChange}
          placeholder="Share with your fellow Gators..."
        />
        <button className="post-button" title="Post">
          <FaPaperPlane />
        </button>
      </section>
      
      <section className="featured">
        <h1>Featured Post</h1>
        <p>This is the feature post box, will figure out what would make a post "featured" later but for the time being it is here.</p>
      </section>

      <section className="feed">
        <h2>Your Feed</h2>
        {loading ? (
          <p>Loading feed...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          feedPosts.map((post) => (
            <div key={post.postId} className="feed-post">
              <h3>{post.firstName} {post.lastName}</h3>
              <p>{post.content}</p>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Home;