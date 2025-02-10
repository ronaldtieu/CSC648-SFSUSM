import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import { likePost, unlikePost, getPostLikes, editPost, deletePost, deleteComment } from '../../service/postService';
import { FaThumbsUp, FaComment, FaEllipsisH } from 'react-icons/fa';
import CommentSection from '../CommentSection/CommentSection';
import './PostStructure.css';

const renderContentWithHashtags = (text, handleHashtagClick) => {
  const regex = /(#\w+)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span
          key={index}
          className="hashtag"
          style={{ cursor: 'pointer' }}
          onClick={() => handleHashtagClick(part.slice(1))}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const usePostData = (postId, userId) => {
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [comments, setComments] = useState([]);

  const loadPostData = useCallback(async () => {
    try {
      const { likes, totalLikes } = await getPostLikes(postId);
      setIsLiked(likes.some(user => Number(user.ID) === Number(userId)));
      setTotalLikes(totalLikes);
    } catch (error) {
      console.error('Error loading post data:', error);
    }
  }, [postId, userId]);

  useEffect(() => {
    if (postId) loadPostData();
  }, [postId, loadPostData]);

  return { isLiked, totalLikes, comments, setComments, loadPostData, setIsLiked, setTotalLikes };
};

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

const EditableContent = ({ initialContent, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="edit-container">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your content..."
      />
      <div className="edit-buttons">
        <button className="save-button" onClick={() => onSave(content)}>
          Save
        </button>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const PostOptions = ({ onEdit, onShowDeleteConfirm }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  useClickOutside(optionsRef, () => setShowOptions(false));

  return (
    <div className="post-menu" ref={optionsRef}>
      <FaEllipsisH onClick={() => setShowOptions(!showOptions)} />
      {showOptions && (
        <div className="options-menu">
          <button onClick={onEdit}>Edit Post</button>
          <button onClick={onShowDeleteConfirm}>Delete Post</button>
        </div>
      )}
    </div>
  );
};

const PostStructure = ({ post, userId, onDeletePost }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(post?.Content || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isUserPost = Number(post?.UserID) === Number(userId);
  const postData = usePostData(post?.ID, userId);
  const history = useHistory(); // Get history object for navigation

  const handleLikeToggle = async () => {
    try {
      const action = postData.isLiked ? unlikePost : likePost;
      await action(post.ID);
      postData.setTotalLikes(prev => prev + (postData.isLiked ? -1 : 1));
      postData.setIsLiked(!postData.isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleEditPost = async (newContent) => {
    try {
      await editPost(post.ID, newContent);
      setEditedContent(newContent);
      setEditMode(false);
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.ID);
      onDeletePost(post.ID);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // When a hashtag is clicked, redirect to the HashtagPage.
  const handleHashtagClick = (tag) => {
    history.push(`/hashtag/${tag}/posts`);
  };

  if (showDeleteConfirm) {
    return (
      <div className="post-item">
        <div className="delete-confirm-popup">
          <p>Are you sure you want to delete this post?</p>
          <div className="delete-buttons">
            <button className="confirm-delete" onClick={handleDeletePost}>
              Yes
            </button>
            <button className="cancel-delete" onClick={() => setShowDeleteConfirm(false)}>
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-item">
      <div className="post-header">
        <div className="post-author">
          <p>
            {post?.FirstName} {post?.LastName}
          </p>
          <span>{post?.CreatedAt && new Date(post.CreatedAt).toLocaleString()}</span>
          {post?.Visibility && (
            <span className="post-visibility">
              {post.Visibility.toUpperCase()}
            </span>
          )}
          {post?.GroupID && (
            <span className="post-group">
              Group ID: {post.GroupID}
            </span>
          )}
        </div>
        {isUserPost && (
          <PostOptions
            onEdit={() => setEditMode(true)}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          />
        )}
      </div>

      {editMode ? (
        <EditableContent
          initialContent={editedContent}
          onSave={handleEditPost}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <div className="post-content">
          <p>{renderContentWithHashtags(editedContent, handleHashtagClick)}</p>
        </div>
      )}

      <div className="post-actions">
        <button className={`like-button ${postData.isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
          <FaThumbsUp /> {postData.isLiked ? 'Unlike' : 'Like'} ({postData.totalLikes})
        </button>
        <button onClick={() => setCommentsVisible(!commentsVisible)} className="comment-button">
          <FaComment /> Comments
        </button>
      </div>

      {commentsVisible && (
        <CommentSection
          postId={post?.ID}
          userId={userId}
          comments={postData.comments}
          loadPostData={postData.loadPostData}
        />
      )}
    </div>
  );
};

export default PostStructure;