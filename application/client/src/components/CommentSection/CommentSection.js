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
    const isUserComment = Number(comment.userId) === Number(userId);
    const [editableText, setEditableText] = useState(comment.content);

    return (
        <div className="comment-box">
            <div className="comment-header">
                <p className="comment-name">{comment.firstName} {comment.lastName}</p>
            </div>

            {editingCommentId === comment.id ? (
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
                </>
            )}
        </div>
    );
};

// Comment Section Component that loads its own comments
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
            reloadComments(); // Reload comments
            setCommentContent('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = async (commentId, content) => {
        try {
            await editComment(commentId, content);
            reloadComments(); // Reload comments
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            reloadComments(); // Reload comments
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