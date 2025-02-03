import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { createCommentOnPost, editComment, deleteComment, getPostComments } from '../../service/postService';
import './CommentSection.css';

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
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    if (editingCommentId === comment.id) {
        if (isConfirmingDelete) {
            return (
                <div className="comment-box">
                    <div className="delete-confirmation">
                        <p>Are you sure you want to delete this comment?</p>
                        <button onClick={() => onDeleteComment(comment.id, comment.userId)}>Yes</button>
                        <button onClick={() => setIsConfirmingDelete(false)}>No</button>
                    </div>
                </div>
            );
        }
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
                        <button className="save-button" onClick={() => onEditComment(comment.id, editableText, comment.userId)}>Save</button>                        <button className="cancel-button" onClick={onCancelEdit}>Cancel</button>
                    </div>
                    <button className="comment-trash-icon" onClick={() => setIsConfirmingDelete(true)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        );
    }

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
                        <button className="edit-comment-button" onClick={() => {
                            setEditableText(comment.content);
                            onStartEdit(comment.id);
                        }}>
                            <FaEdit /> Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({ postId, userId }) => {
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for oldest first, 'desc' for newest first

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

    const handleEditComment = async (commentId, content, commentUserId) => {
        if (!content.trim()) {
            console.log("Edit attempt failed: Comment content is empty.");
            return;
        }
    
        console.log(`Attempting to edit comment ID: ${commentId}`);
        console.log(`- Session User ID: ${userId}`);
        console.log(`- Comment Owner User ID: ${commentUserId || 'undefined (check source)'}`);
    
        if (!commentUserId) {
            console.log("Error: Comment owner ID is undefined. Possible issue in data fetching.");
            return;
        }
    
        if (Number(commentUserId) !== Number(userId)) {
            console.log("Edit denied: User is not the owner of the comment.");
            return;
        }
    
        console.log("Edit permitted: Proceeding with update.");
    
        setComments(prevComments => {
            const updatedComments = prevComments.map(comment =>
                comment.id === commentId ? { ...comment, content } : comment
            );
            console.log("Updated Comments (before API call):", updatedComments);
            return updatedComments;
        });
    
        try {
            await editComment(postId, commentId, content);
            console.log("Comment successfully edited on the server. Reloading comments...");
            reloadComments();
        } catch (error) {
            console.log("Error editing comment:", error);
        } finally {
            console.log(`Finished processing edit for comment ID: ${commentId}`);
            setEditingCommentId(null);
        }
    };

    const handleDeleteComment = async (commentId, commentUserId) => {
        console.log('Delete comment being called.');
        console.log(`- Current User ID (Session): ${userId}`);
        console.log(`- Comment Owner User ID: ${commentUserId}`);
        console.log(`- Comment ID: ${commentId}`);
    
        try {
            await deleteComment(postId, commentId);
    
            if (editingCommentId === commentId) {
                setEditingCommentId(null);
            }
            
            reloadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedComments = [...comments].sort((a, b) => {
        return sortOrder === 'asc' 
            ? new Date(a.createdAt) - new Date(b.createdAt) 
            : new Date(b.createdAt) - new Date(a.createdAt);
    });

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

            <button className="sort-button" onClick={toggleSortOrder}>
                Sort by: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>

            {sortedComments.map(comment => (
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