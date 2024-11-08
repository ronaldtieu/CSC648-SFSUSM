import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './CreatePost.css';

const CreatePost = ({ onCreate }) => {
  const [postContent, setPostContent] = useState('');

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePost = () => {
    if (postContent.trim()) {
      onCreate(postContent);
      setPostContent('');  // Clear the post content after submission
    }
  };

  return (
    <div className="create-post">
      <section className="create-post-section">
        <textarea
          className="post-input"
          value={postContent}
          onChange={handleChange}
          placeholder="Share with your fellow Gators..."
        />
        <button className="post-button" title="Post" onClick={handlePost}>
          <FaPaperPlane />
        </button>
      </section>
    </div>
  );
};

export default CreatePost;