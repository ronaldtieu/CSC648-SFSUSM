import React, { useState, useEffect } from 'react';
import './Home.css';
import { fetchUserFeed } from '../../service/feedService';
import CreatePost from '../../components/CreatePost/CreatePost';

const Home = () => {
  const [postContent, setPostContent] = useState('');
  const [feedPosts, setFeedPosts] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Move loadFeed function outside of useEffect
  const loadFeed = async () => {
    try {
      const posts = await fetchUserFeed();
      console.log('Fetched posts in loadFeed:', posts); // Log fetched data
      setFeedPosts(posts || []); // Update state with the array
    } catch (err) {
      console.error('Failed to load feed:', err);
      setFeedPosts([]); // Default to an empty array on error
      setError('Failed to load feed. Please try again later.');
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  // Call loadFeed on component mount
  useEffect(() => {
    loadFeed();
  }, []);

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  // Rendering home page
  return (
    <div className="home">
      <section className="post-section">
          <CreatePost onCreate={loadFeed} /> {/* Now loadFeed is accessible */}
      </section>
      
      <section className="featured">
        <h1>Announcements</h1>
        <p>This is a space dedicated for announcements..</p>
      </section>

      <section className="feed">
        <h2>Your Feed </h2>
        {loading ? (
          <p>Loading...</p>
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