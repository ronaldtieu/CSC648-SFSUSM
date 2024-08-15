import React, { useState } from 'react';
import './Home.css';
import { FaPaperPlane } from 'react-icons/fa';

const Home = () => {
  const [postContent, setPostContent] = useState('');

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
    </div>
  );
};

export default Home;