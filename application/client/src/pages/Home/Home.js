import React, { useEffect, useState, useCallback } from 'react';
import './Home.css';
import { fetchUserFeed } from '../../service/feedService';
import { checkSession } from '../../service/profileService';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostStructure from '../../components/PostStructure/PostStructure';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const Home = () => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Fetch user session
    useEffect(() => {
        const loadSessionData = async () => {
            try {
                const sessionData = await checkSession();
                if (sessionData?.user?.id) {
                    console.log("User ID found:", sessionData.user.id);
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

    // Fetch user feed and map data to match PostStructure expectations
    const loadUserFeed = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            console.log('Fetching user feed...');
            const response = await fetchUserFeed();
            console.log('Fetched posts:', response);

            if (Array.isArray(response)) {
                const formattedPosts = response.map(post => ({
                    ID: post.postId, 
                    Content: post.content, 
                    CreatedAt: post.createdAt, 
                    FirstName: post.firstName, 
                    LastName: post.lastName, 
                    UserID: post.userId, 
                    Source: post.source,
                }));

                setFeedPosts(formattedPosts);
            } else {
                console.error("Error: `posts` is not an array:", response);
                setFeedPosts([]);
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
            setFeedPosts([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Load feed when userId changes
    useEffect(() => {
        loadUserFeed();
    }, [userId, loadUserFeed]);

    // Debugging: Log updates to feedPosts
    useEffect(() => {
        console.log("Updated feedPosts:", feedPosts);
    }, [feedPosts]);

    return (
        <div className="home">
            <h1>Home</h1>

            <section className="post-section">
                <CreatePost onCreate={loadUserFeed} />
            </section>

            {loading ? (
                <div className="loading-container">
                    <LoadingScreen />
                </div>
            ) : (
                <div className="post-list">
                    {feedPosts.length > 0 ? (
                        feedPosts.map((post) => {
                            console.log("Rendering PostStructure:", post);
                            return (
                                <PostStructure 
                                    key={post.ID} 
                                    post={post} 
                                    userId={userId}  // Pass the logged-in userId
                                    onDeletePost={loadUserFeed} 
                                />
                            );
                        })
                    ) : (
                        <p>No posts available</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;