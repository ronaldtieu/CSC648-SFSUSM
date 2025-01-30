import React, { useEffect, useState } from 'react';
import { fetchUserPosts, getPostLikes } from '../../service/postService';
import { checkSession } from '../../service/profileService';
import './Profile.css';
import { Link } from 'react-router-dom';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostStructure from '../../components/PostStructure/PostStructure';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadSessionData = async () => {
            try {
                const sessionData = await checkSession();
                if (sessionData?.user?.id) {
                    setUserId(sessionData.user.id);
                } else {
                    console.error("No user ID found in session.");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to check session:", error);
                setLoading(false);
            }
        };
        loadSessionData();
    }, []);

    useEffect(() => {
        if (userId) {
            loadUserPosts();
        }
    }, [userId]);

    const loadUserPosts = async () => {
        setLoading(true);
        try {
            const postsData = await fetchUserPosts();
            const updatedPosts = await Promise.all(
                postsData.map(async (post) => {
                    const { likes, totalLikes } = await getPostLikes(post.ID);
                    return { ...post, likes, totalLikes };
                })
            );
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile">
            <h1>My Profile</h1>

            <Link to="/view-profile" className="view-profile-button">
                View Profile
            </Link>

            <section className="post-section">
                <CreatePost onCreate={loadUserPosts} />
            </section>

            {/* Loading Screen */}
            {loading ? (
                <div className="loading-container">
                    <LoadingScreen />
                </div>
            ) : (
                <div className="post-list">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostStructure key={post.ID} post={post} userId={userId} />
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