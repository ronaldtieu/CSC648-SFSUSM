import React, { useEffect, useState } from 'react';
import './Home.css';
import { fetchUserFeed } from '../../service/feedService';
import { checkSession } from '../../service/profileService';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostStructure from '../../components/PostStructure/PostStructure';
import DominoLoader from '../../components/DominoLoader/DominoLoader'; // Optional if you use it

const Home = () => {
    const [feedPosts, setFeedPosts] = useState([]);
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

    // Fetch user feed when userId is available
    useEffect(() => {
        if (userId) {
            loadUserFeed();
        }
    }, [userId]);

    // Helper function to fetch user feed
const loadUserFeed = async () => {
    try {
        console.log('Fetching user feed...'); // Log when fetching begins
        const posts = await fetchUserFeed();
        console.log('Fetched posts from backend:', posts); // Log the raw data received

        const updatedPosts = await Promise.all(
            posts.map(async (post) => {
                console.log('Processing post:', post); // Log each post being processed
                return { ...post }; // Directly map posts as received
            })
        );

        console.log('Updated posts after processing:', updatedPosts); // Log processed posts
        setFeedPosts(updatedPosts);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching feed:', error); // Log errors encountered
        setLoading(false);
    }
};

    // Rendering the home page
    return (
      <div className="home">
          <h1>Home</h1>
  
          <section className="post-section">
              <CreatePost onCreate={loadUserFeed} />
          </section>
  
          {loading ? (
              <DominoLoader /> // Use a loader while fetching data
          ) : (
              <div className="post-list">
                  {console.log('feedPosts before mapping:', feedPosts)} {/* Debug feedPosts */}
                  {feedPosts.length > 0 ? (
                      feedPosts.map((post, index) => {
                          // Debug each post before rendering
                          console.log(`Rendering post ${index}:`, post);
  
                          // Normalize post to ensure a valid ID is passed
                          const normalizedPost = {
                              ...post,
                              ID: post.postId || post.ID || index, // Fallback to index if no ID exists
                          };
  
                          // Debug normalized post
                          console.log(`Normalized post ${index}:`, normalizedPost);
  
                          return (
                              <PostStructure
                                  key={normalizedPost.ID} // Unique key for React
                                  post={normalizedPost} // Pass normalized post object
                                  userId={userId}
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