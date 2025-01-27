import React, { useEffect, useState, useRef } from 'react';
import { fetchUserPosts, likePost, unlikePost, getPostLikes, getPostComments, createPost, createCommentOnPost, deletePost, editPost } from '../../service/postService';  // Restored import
import { checkSession } from '../../service/profileService';
import './Profile.css';
import { Link } from 'react-router-dom';  // Import Link for routing
import CreatePost from '../../components/CreatePost/CreatePost';
import PostStructure from '../../components/PostStructure/PostStructure';
import DominoLoader from '../../components/DominoLoader/DominoLoader';  // Import DominoLoader

const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Fetching session data to get the user ID
    useEffect(() => {
        const loadSessionData = async () => {
            try {
                const sessionData = await checkSession();
                if (sessionData && sessionData.user && sessionData.user.id) {
                    setUserId(sessionData.user.id);
                } else {
                    console.error("No user ID found in session.");
                }
            } catch (error) {
                console.error("Failed to check session:", error);
            }
        };
        loadSessionData();
    }, []);


    // Fetch user posts when userId is available
    useEffect(() => {
        if (userId) {
            loadUserPosts();
        }
    }, [userId]);


    // Helper function to fetch user posts
    const loadUserPosts = async () => {
        try {
            const postsData = await fetchUserPosts();
            const updatedPosts = await Promise.all(
                postsData.map(async (post) => {
                    const { likes, totalLikes } = await getPostLikes(post.ID);
                    return { ...post, likes, totalLikes };
                })
            );
            setPosts(updatedPosts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    

    // Rendering the profile page 
    return (
        <div className="profile">
            <h1>My Profile</h1>
            

            <Link to="/view-profile" className="view-profile-button">
                View Profile
            </Link>

            <section className="post-section">
                <CreatePost onCreate={loadUserPosts} />
            </section>
            
            {loading ? (
                <DominoLoader /> 
            ) : (
                <div className="post-list">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostStructure
                                key={post.ID}
                                post={post}
                                userId={userId}
                                // onDeletePost={loadUserPosts}
                                onToggleLike={loadUserPosts}
                            />
                        ))
                    ) : (
                        <p>No posts available</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
