import React, { useState, useEffect, useRef } from 'react';
import { 
    likePost, 
    unlikePost, 
    getPostLikes, 
    createCommentOnPost, 
    deletePost, 
    editPost, 
    getPostComments 
} from '../../service/postService';
import { FaThumbsUp, FaComment, FaEllipsisH } from 'react-icons/fa';
import './PostStructure.css';

const PostStructure = ({ post, userId, onDeletePost }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState(post.Content); // New state for post content
    const [editedContent, setEditedContent] = useState(post.Content);
    const [showOptions, setShowOptions] = useState(false);

    const optionsRef = useRef(null);

    // Initial load of likes and comments for each post
    useEffect(() => {
        const loadPostData = async () => {
            try {
                const { likes, totalLikes } = await getPostLikes(post.ID);
                setIsLiked(likes.some(user => user.ID === userId));
                setTotalLikes(totalLikes);

                const fetchedComments = await getPostComments(post.ID);
                setComments(fetchedComments);
            } catch (error) {
                console.error('Error loading post data:', error);
            }
        };
        loadPostData();

        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [post.ID, userId]);

    // Toggle like
    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await unlikePost(post.ID);
                setTotalLikes(prev => prev - 1);
            } else {
                await likePost(post.ID);
                setTotalLikes(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Add a comment
    const handleCommentSubmit = async () => {
        try {
            if (commentContent.trim()) {
                await createCommentOnPost(post.ID, commentContent);
                const updatedComments = await getPostComments(post.ID);
                setComments(updatedComments);
                setCommentContent('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Save edited post content and update locally
    const handleEditPost = async () => {
        try {
            await editPost(post.ID, editedContent);
            setEditMode(false);
            setContent(editedContent); // Update the content state
        } catch (error) {
            console.error('Error editing post:', error);
        }
    };

    // Delete post
    const handleDelete = async () => {
        try {
            await deletePost(post.ID);
            onDeletePost(post.ID); // Notify parent component
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };
    
    return (
        <div className="post-item">
            {/* Post creator's name in the top-left corner */}
            <div className="post-author">
                <p>{post.FirstName} {post.LastName}</p>
            </div>
    
            {/* Post content aligned to the left */}
            {editMode ? (
                <div className="edit-content">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Edit your post..."
                    />
                    <button onClick={handleEditPost}>Save</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
            ) : (
                <div className="post-content">
                    <p>{content}</p>
                </div>
            )}
    
            {/* Post timestamp */}
            <span>{new Date(post.CreatedAt).toLocaleString()}</span>
    
            {/* Post actions (like and comment buttons) */}
            <div className="post-actions">
                <button 
                    className={`like-button ${isLiked ? 'liked' : ''}`} 
                    onClick={handleLikeToggle}>
                    <FaThumbsUp /> {isLiked ? 'Unlike' : 'Like'}
                </button>
                <button 
                    onClick={() => setCommentsVisible(!commentsVisible)} 
                    className="comment-button">
                    <FaComment /> Comments
                </button>
            </div>
    
            {/* Options menu */}
            <div className="post-menu" ref={optionsRef}>
                <FaEllipsisH onClick={() => setShowOptions(!showOptions)} />
                {showOptions && (
                    <div className="options-menu">
                        <button onClick={() => setEditMode(true)}>Edit Post</button>
                        <button onClick={handleDelete}>Delete Post</button>
                    </div>
                )}
            </div>
    
            {/* Comments section */}
            {commentsVisible && (
                <div className="comments-section">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write a comment..."
                    />
                    <button onClick={handleCommentSubmit}>Comment</button>
                    {comments.map((comment) => (
                        <div key={comment.ID} className="comment-box">
                            <p className="comment-name">
                                {comment.FirstName} {comment.LastName}
                            </p>
                            <p className="comment-content">{comment.Comment}</p>
                            <p className="comment-date">
                                {new Date(comment.CreatedAt).toLocaleDateString()} @ 
                                {new Date(comment.CreatedAt).toLocaleTimeString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
    

export default PostStructure;
