import React, { useEffect, useState } from 'react';
import './Home.css';
import { fetchUserFeed } from '../../service/feedService';
import { checkSession } from '../../service/profileService';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostStructure from '../../components/PostStructure/PostStructure';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const Home = () => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loadingFeed, setLoadingFeed] = useState(true);

    useEffect(() => {
        const loadSessionData = async () => {
            try {
                const sessionData = await checkSession();
                if (sessionData?.user?.id) {
                    setUserId(sessionData.user.id);
                } else {
                    console.error("No user ID found in session.");
                    setLoadingFeed(false);
                }
            } catch (error) {
                console.error("Failed to check session:", error);
                setLoadingFeed(false);
            }
        };
        loadSessionData();
    }, []);

    useEffect(() => {
        if (userId) {
            loadUserFeed();
        }
    }, [userId]);

    const loadUserFeed = async () => {
        setLoadingFeed(true);
        try {
            console.log('Fetching user feed...');
            const posts = await fetchUserFeed();
            console.log('Fetched posts from backend:', posts);
            setFeedPosts(posts);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoadingFeed(false);
        }
    };

    return (
        <div className="home">
            <h1>Home</h1>

            {/* CreatePost Section */}
            <section className="post-section">
                <CreatePost onCreate={loadUserFeed} />
            </section>

            {/* Loading Screen or Feed */}
            {loadingFeed ? (
                <div className="loading-container">
                    <LoadingScreen />
                </div>
            ) : (
                <div className="feed-container">
                    <div className="post-list">
                        {feedPosts.length > 0 ? (
                            feedPosts.map((post, index) => (
                                <PostStructure
                                    key={post.postId || index}
                                    post={post}
                                    userId={userId}
                                    onDeletePost={loadUserFeed}
                                />
                            ))
                        ) : (
                            <p>No posts available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;