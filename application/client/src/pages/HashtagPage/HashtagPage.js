import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostsByHashtag } from '../../service/postService';
import PostStructure from '../../components/PostStructure/PostStructure';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

const HashtagPage = () => {
  const { hashtag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await fetchPostsByHashtag(hashtag);
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [hashtag]);

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="hashtag-page">
      <h1>Posts tagged with #{hashtag}</h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostStructure
            key={post.ID}
            post={post}
            userId={post.UserID}
            onDeletePost={() => {}}
          />
        ))
      ) : (
        <p>No posts found for #{hashtag}.</p>
      )}
    </div>
  );
};

export default HashtagPage;