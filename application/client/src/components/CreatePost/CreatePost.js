import React, { useState } from 'react';
import './CreatePost.css';
import { createPost } from '../../service/postService';

const CreatePost = ({ onCreate, groupId = null }) => {
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState('public'); // Default to public

  const handleChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  const handlePost = async () => {
    if (!postContent.trim()) {
      console.error("Post content is empty.");
      return;
    }
  
    // Build the payload, converting groupId to a number if provided, or default to null.
    const payload = {
      content: postContent,
      visibility, // Should be either "public" or "private"
      groupId: groupId ? Number(groupId) : null,
    };
  
    try {
      await createPost(payload);
      console.log("Post created successfully!");
      setPostContent('');
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
        <div className="visibility-switch">
          <label>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={handleVisibilityChange}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={handleVisibilityChange}
            />
            Private
          </label>
        </div>
        <button className="post-button" title="Share" onClick={handlePost}>
          Share
        </button>
      </section>
    </div>
  );
};

export default CreatePost;