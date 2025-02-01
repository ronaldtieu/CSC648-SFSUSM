import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    likePost, unlikePost, getPostLikes, createCommentOnPost, 
    deletePost, editPost, getPostComments, editComment, deleteComment 
} from '../../service/postService';
import { FaThumbsUp, FaComment, FaEllipsisH, FaEdit, FaTrash } from 'react-icons/fa';
import './PostStructure.css';

// Hook for fetching and managing post data
const usePostData = (postId, userId) => {
    const [isLiked, setIsLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [comments, setComments] = useState([]);

    const loadPostData = useCallback(async () => {
        try {
            const { likes, totalLikes } = await getPostLikes(postId);
            setIsLiked(likes.some(user => Number(user.ID) === Number(userId)));
            setTotalLikes(totalLikes);

            const fetchedComments = await getPostComments(postId);
            console.log("Fetched Comments:", fetchedComments); 
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error loading post data:', error);
        }
    }, [postId, userId]);

    useEffect(() => {
        if (postId) loadPostData();
    }, [postId, loadPostData]);

    return { isLiked, totalLikes, comments, loadPostData, setIsLiked, setTotalLikes };
};

// Hook for handling outside clicks
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

// Editable text input component
const EditableContent = ({ initialContent, onSave, onCancel, onDelete }) => {
    const [content, setContent] = useState(initialContent);

    return (
        <div className="edit-container">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit your content..."
            />
            <div className="edit-buttons">
                <button className="save-button" onClick={() => onSave(content)}>Save</button>
                <button className="cancel-button" onClick={onCancel}>Cancel</button>
            </div>
            <button className="delete-button" onClick={onDelete}>
                <FaTrash /> Delete
            </button>
        </div>
    );
};

// Component for rendering individual comments
const CommentItem = ({ 
    comment, 
    userId, 
    editingCommentId, 
    onEditComment, 
    onDeleteComment, 
    onCancelEdit, 
    onStartEdit 
}) => {
    const isUserComment = Number(comment.userId) === Number(userId);

    return (
        <div className="comment-box">
            <div className="comment-header">
                <p className="comment-name">{comment.firstName} {comment.lastName}</p>
            </div>

            {editingCommentId === comment.id ? (
                <div className="edit-container">
                    <textarea
                        value={comment.content}
                        onChange={(e) => onEditComment(comment.id, e.target.value)}
                        placeholder="Edit your comment..."
                    />
                    <div className="edit-buttons">
                        <button className="save-button" onClick={() => onEditComment(comment.id, comment.content)}>Save</button>
                        <button className="cancel-button" onClick={onCancelEdit}>Cancel</button>
                    </div>
                    {/* Delete button moved to bottom-right */}
                    <button className="comment-trash-icon" onClick={() => onDeleteComment(comment.id)}>
                        <FaTrash />
                    </button>
                </div>
            ) : (
                <>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-footer">
                        <p className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()} @ 
                            {new Date(comment.createdAt).toLocaleTimeString()}
                        </p>
                        {isUserComment && (
                            <div className="comment-actions">
                                <button 
                                    className="edit-comment-button" 
                                    onClick={() => onStartEdit(comment.id)}
                                >
                                    <FaEdit /> Edit
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Post options dropdown menu
const PostOptions = ({ onEdit, onDelete }) => {
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    useClickOutside(optionsRef, () => setShowOptions(false));

    return (
        <div className="post-menu" ref={optionsRef}>
            <FaEllipsisH onClick={() => setShowOptions(!showOptions)} />
            {showOptions && (
                <div className="options-menu">
                    <button onClick={onEdit}>Edit Post</button>
                    <button onClick={onDelete}>Delete Post</button>
                </div>
            )}
        </div>
    );
};

const PostStructure = ({ post, userId, onDeletePost }) => {
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState(post?.Content || '');
    const [editingCommentId, setEditingCommentId] = useState(null);
    
    const isUserPost = Number(post?.UserID) === Number(userId);
    const postData = usePostData(post?.ID, userId);

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

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) return;
        try {
            await createCommentOnPost(post.ID, commentContent);
            postData.loadPostData();
            setCommentContent('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = async (commentId, content) => {
        try {
            await editComment(commentId, content);
            postData.loadPostData();
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            postData.loadPostData();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="post-item">
            <div className="post-header">
                <div className="post-author">
                    <p>{post?.FirstName} {post?.LastName}</p>
                    <span>{post?.CreatedAt && new Date(post.CreatedAt).toLocaleString()}</span>
                </div>
                {isUserPost && (
                    <PostOptions
                        onEdit={() => setEditMode(true)}
                        onDelete={onDeletePost}
                    />
                )}
            </div>

            {editMode ? (
                <EditableContent
                    initialContent={editedContent}
                    onSave={(newContent) => editPost(post.ID, newContent)}
                    onCancel={() => setEditMode(false)}
                    onDelete={() => onDeletePost(post.ID)}
                />
            ) : (
                <div className="post-content">
                    <p>{editedContent}</p>
                </div>
            )}

            <div className="post-actions">
                <button className={`like-button ${postData.isLiked ? 'liked' : ''}`} onClick={handleLikeToggle}>
                    <FaThumbsUp /> {postData.isLiked ? 'Unlike' : 'Like'} ({postData.totalLikes})
                </button>
                <button onClick={() => setCommentsVisible(!commentsVisible)} className="comment-button">
                    <FaComment /> Comments ({postData.comments.length})
                </button>
            </div>

            {commentsVisible && postData.comments.map(comment => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    userId={userId}
                    editingCommentId={editingCommentId}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onCancelEdit={() => setEditingCommentId(null)}
                    onStartEdit={setEditingCommentId}
                />
            ))}
        </div>
    );
};

export default PostStructure;