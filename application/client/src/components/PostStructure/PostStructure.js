import React, { useState, useEffect, useRef } from 'react';
import { 
    likePost, unlikePost, getPostLikes, createCommentOnPost, 
    deletePost, editPost, getPostComments, editComment 
} from '../../service/postService';
import { FaThumbsUp, FaComment, FaEllipsisH, FaEdit } from 'react-icons/fa';
import './PostStructure.css';

const PostStructure = ({ post, userId, onDeletePost }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState(post?.Content || '');
    const [showOptions, setShowOptions] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');

    const optionsRef = useRef(null);
    const isUserPost = Number(post?.UserID) === Number(userId);

    useEffect(() => {
        const loadPostData = async () => {
            if (!post?.ID) return;
            try {
                const { likes, totalLikes } = await getPostLikes(post.ID);
                setIsLiked(likes.some(user => Number(user.ID) === Number(userId)));
                setTotalLikes(totalLikes);
                setComments(await getPostComments(post.ID));
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [post?.ID, userId]);

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await unlikePost(post.ID);
                setTotalLikes(prev => Math.max(prev - 1, 0));
            } else {
                await likePost(post.ID);
                setTotalLikes(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) return;
        try {
            await createCommentOnPost(post.ID, commentContent);
            setComments(await getPostComments(post.ID));
            setCommentContent('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditPost = async () => {
        try {
            await editPost(post.ID, editedContent);
            setEditMode(false);
        } catch (error) {
            console.error('Error editing post:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(post.ID);
            onDeletePost(post.ID);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editedCommentContent.trim()) return;
        try {
            await editComment(commentId, editedCommentContent);
            setComments(await getPostComments(post.ID));
            setEditingCommentId(null);
            setEditedCommentContent('');
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    return (
        <div className="post-item">
            <div className="post-author">
                <p>{post?.FirstName} {post?.LastName}</p>
            </div>

            {editMode ? (
                <div className="edit-content">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Edit your post..."
                    />
                    <div className="edit-buttons">
                        <button onClick={handleEditPost}>Save</button>
                        <button onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="post-content">
                    <p>{editedContent}</p>
                </div>
            )}

            <span>{post?.CreatedAt ? new Date(post.CreatedAt).toLocaleString() : ''}</span>

            <div className="post-actions">
                <button className={`like-button ${isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
                    <FaThumbsUp /> {isLiked ? 'Unlike' : 'Like'} ({totalLikes})
                </button>
                <button onClick={() => setCommentsVisible(!commentsVisible)} className="comment-button">
                    <FaComment /> Comments
                </button>
            </div>

            {isUserPost && (
                <div className="post-menu" ref={optionsRef}>
                    <FaEllipsisH onClick={() => setShowOptions(!showOptions)} />
                    {showOptions && (
                        <div className="options-menu">
                            <button onClick={() => setEditMode(true)}>Edit Post</button>
                            <button onClick={handleDelete}>Delete Post</button>
                        </div>
                    )}
                </div>
            )}

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
                            <p className="comment-name">{comment.FirstName} {comment.LastName}</p>
                            {editingCommentId === comment.ID ? (
                                <div className="edit-comment">
                                    <textarea
                                        value={editedCommentContent}
                                        onChange={(e) => setEditedCommentContent(e.target.value)}
                                        placeholder="Edit your comment..."
                                    />
                                    <div className="edit-buttons">
                                        <button onClick={() => handleEditComment(comment.ID)}>Save</button>
                                        <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="comment-content">{comment.Comment}</p>
                            )}
                            <p className="comment-date">
                                {new Date(comment.CreatedAt).toLocaleDateString()} @ 
                                {new Date(comment.CreatedAt).toLocaleTimeString()}
                            </p>
                            {comment.UserID === userId && (
                                <button className="edit-comment-button" onClick={() => {
                                    setEditingCommentId(comment.ID);
                                    setEditedCommentContent(comment.Comment);
                                }}>
                                    <FaEdit />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostStructure;