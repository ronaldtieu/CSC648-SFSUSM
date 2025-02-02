import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { createCommentOnPost, editComment, deleteComment, getPostComments } from '../../service/postService';
import './CommentSection.css';

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
    // Adjust property names as needed based on your API response.
    const isUserComment = Number(comment.userId) === Number(userId);
    const [editableText, setEditableText] = useState(comment.content);
    // Local state to control delete confirmation prompt
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // When in edit mode for this comment...
    if (editingCommentId === comment.id) {
        // If the user has clicked delete, show the confirmation prompt.
        if (isConfirmingDelete) {
            return (
                <div className="comment-box">
                    <div className="delete-confirmation">
                        <p>Are you sure you want to delete this comment?</p>
                        <button 
                            onClick={() => {
                                // Confirm deletion: call the delete handler
                                onDeleteComment(comment.id, comment.userId);
                            }}
                        >
                            Yes
                        </button>
                        <button onClick={() => setIsConfirmingDelete(false)}>No</button>
                    </div>
                </div>
            );
        }
        // Otherwise, show the edit UI with a delete button that triggers confirmation.
        return (
            <div className="comment-box">
                <div className="comment-header">
                    <p className="comment-name">{comment.firstName} {comment.lastName}</p>
                </div>
                <div className="edit-container">
                    <textarea
                        value={editableText}
                        onChange={(e) => setEditableText(e.target.value)}
                        placeholder="Edit your comment..."
                    />
                    <div className="edit-buttons">
                        <button className="save-button" onClick={() => onEditComment(comment.id, editableText)}>Save</button>
                        <button className="cancel-button" onClick={onCancelEdit}>Cancel</button>
                    </div>
                    {/* The delete button now only appears in edit mode.
                        Clicking it shows the confirmation prompt. */}
                    <button 
                        className="comment-trash-icon" 
                        onClick={() => setIsConfirmingDelete(true)}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        );
    }

    // When not in edit mode, simply display the comment content and an edit button.
    return (
        <div className="comment-box">
            <div className="comment-header">
                <p className="comment-name">{comment.firstName} {comment.lastName}</p>
            </div>
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
                            onClick={() => {
                                setEditableText(comment.content);
                                onStartEdit(comment.id);
                            }}
                        >
                            <FaEdit /> Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Comment Section Component that loads and displays comments
const CommentSection = ({ postId, userId }) => {
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);

    // Load comments when the component mounts or when postId changes
    useEffect(() => {
        const loadComments = async () => {
            try {
                const fetchedComments = await getPostComments(postId);
                setComments(fetchedComments);
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        };
        loadComments();
    }, [postId]);

    const reloadComments = async () => {
        try {
            const fetchedComments = await getPostComments(postId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error reloading comments:', error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) return;
        try {
            await createCommentOnPost(postId, commentContent);
            reloadComments();
            setCommentContent('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = async (commentId, content) => {
        try {
            await editComment(commentId, content);
            reloadComments(); 
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDeleteComment = async (commentId, commentUserId) => {
        console.log('Delete comment being called.');
        console.log(`- Current User ID (Session): ${userId}`);
        console.log(`- Comment Owner User ID: ${commentUserId}`);
        console.log(`- Comment ID: ${commentId}`);
    
        try {
            // Call the delete service with both postId and commentId.
            await deleteComment(postId, commentId);
    
            // If the comment being deleted is in edit mode, clear that state.
            if (editingCommentId === commentId) {
                setEditingCommentId(null);
            }
            
            reloadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="comments-section">
            <div className="comment-input">
                <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button onClick={handleCommentSubmit}>Comment</button>
            </div>

            {comments.map(comment => (
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

export default CommentSection;