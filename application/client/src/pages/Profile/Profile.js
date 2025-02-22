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
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    // Load session data to set the user ID.
    useEffect(() => {
        async function loadSessionData() {
            try {
                const sessionData = await checkSession();
                if (sessionData?.user?.id) {
                    setUserId(sessionData.user.id);
                } else {
                    console.error("No user ID found in session.");
                }
            } catch (error) {
                console.error("Failed to check session:", error);
            }
        }
        loadSessionData();
    }, []);

    // Fetch posts whenever userId or page changes.
    useEffect(() => {
        if (userId) {
            async function loadPosts() {
                setLoading(true);
                try {
                    // Pass page and pageSize so that only a subset of posts is returned.
                    const postsData = await fetchUserPosts(page, pageSize);
                    const updatedPosts = await Promise.all(
                        postsData.map(async (post) => {
                            const { likes, totalLikes } = await getPostLikes(post.ID);
                            return { ...post, likes, totalLikes };
                        })
                    );
                    setPosts(prevPosts => [...prevPosts, ...updatedPosts]);
                    // If fewer posts than pageSize are returned, assume there are no more posts.
                    if (postsData.length < pageSize) {
                        setHasMore(false);
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                } finally {
                    setLoading(false);
                }
            }
            loadPosts();
        }
    }, [userId, page]);

    // Refresh posts when a new post is created.
    const refreshPosts = async () => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        try {
            const postsData = await fetchUserPosts(1, pageSize);
            const updatedPosts = await Promise.all(
                postsData.map(async (post) => {
                    const { likes, totalLikes } = await getPostLikes(post.ID);
                    return { ...post, likes, totalLikes };
                })
            );
            setPosts(updatedPosts);
            if (postsData.length < pageSize) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error refreshing posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Increments the page so that the next set of posts are loaded.
    const loadMorePosts = () => {
        setPage(prevPage => prevPage + 1);
    };

    return (
        <div className="profile">
            <h1>My Profile</h1>
            <Link to="/view-profile" className="view-profile-button">
                View Profile
            </Link>
            <section className="post-section">
                <CreatePost onCreate={refreshPosts} />
            </section>
            {loading && posts.length === 0 ? (
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
            {/* "Load More Posts" button */}
            <div className="load-more-container">
                {hasMore && !loading && (
                    <button onClick={loadMorePosts} className="load-more-button">
                        Load More Posts
                    </button>
                )}
                {loading && posts.length > 0 && <LoadingScreen />}
            </div>
        </div>
    );
};

export default Profile;