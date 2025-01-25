import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './CreatePost.css';

import { createPost } from '../../service/postService';

const CreatePost = ({ onCreate }) => {
  const [postContent, setPostContent] = useState('');

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePost = async () => {
    if (!postContent.trim()) {
      console.error("Post content is empty.");
      return;
    }

    try {
      // Call createPost to send the post content to the backend
      // await createPost({ content: postContent });
      await createPost(postContent);

      console.log("Post created successfully!");

      // Clear the post content after submission
      setPostContent('');

      // Notify the parent component (Profile) to refresh the posts
      onCreate();
    } catch (error) {
      console.error("Error creating post:", error);
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