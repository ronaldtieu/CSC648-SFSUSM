const API_BASE_URL = 'http://localhost:4000/posts';


export const fetchUserPosts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getUserPosts`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user posts. Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to fetch user posts.');
        }

        return data.posts; // Includes UserID now
    } catch (error) {
        console.error('Error fetching user posts:', error.message);
        throw error;
    }
};


  // create post
  export const createPost = async (content) => {
    try {
        const response = await fetch(`${API_BASE_URL}/createPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create post. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to create post.');
        }

        return { message: data.message, postId: data.postId, userId: data.userId }; // Includes userId
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};


// like post
export const likePost = async (postId) => {
    try {
      console.log('Sending like request for post with ID:', postId);
  
      const response = await fetch(`${API_BASE_URL}/likePost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  
        body: JSON.stringify({ postId }), 
      });
  
      if (!response.ok) {
        throw new Error(`Failed to like post. Status: ${response.status}`);
      }
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();  
        console.error('Received non-JSON response:', text);
        throw new Error('The response format was not JSON as expected. Please ensure the server is returning JSON.');
      }
  
      const data = await response.json();
      console.log('Response from likePost API:', data);  
  
      if (!data.success) {
        throw new Error('Failed to like post. API returned failure.');
      }
  
      return data.message;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

// unlike post
export const unlikePost = async (postId) => {
    try {
      console.log('Sending unlike request for post with ID:', postId);
  
      const response = await fetch(`${API_BASE_URL}/unlikePost`, {
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  
        body: JSON.stringify({ postId }),  
      });
  
      if (!response.ok) {
        throw new Error(`Failed to unlike post. Status: ${response.status}`);
      }
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();  
        console.error('Received non-JSON response:', text);
        throw new Error('The response format was not JSON as expected. Please ensure the server is returning JSON.');
      }
  
      const data = await response.json();
      console.log('Response from unlikePost API:', data);  
  
      if (!data.success) {
        throw new Error('Failed to unlike post. API returned failure.');
      }
  
      return data.message;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  };

// comment on post
export const createCommentOnPost = async (postId, comment) => {
    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  
            body: JSON.stringify({ postId, comment }),  
        });

        if (!response.ok) {
            throw new Error(`Failed to comment on post. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to comment on post.');
        }

        return data.message;
    } catch (error) {
        console.error('Error commenting on post:', error);
        throw error;
    }
};

// get likes from post
export const getPostLikes = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${postId}/likes`, {
        method: 'GET',
        credentials: 'include',  
      });
  
      if (!response.ok) {
        throw new Error(`Failed to get post likes. Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.success) {
        throw new Error('Failed to get post likes.');
      }
  
      return {
        likes: data.likes,     
        totalLikes: data.totalLikes  
      };
    } catch (error) {
      console.error('Error getting post likes:', error);
      throw error;
    }
  };

// get comments from post
export const getPostComments = async (postId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}/comments`, {
            method: 'GET',
            credentials: 'include',  
        });

        if (!response.ok) {
            throw new Error(`Failed to get post comments. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.comments)) {
            throw new Error('Failed to get post comments.');
        }

        const formattedComments = data.comments.map(comment => ({
            id: comment.id,
            userId: comment.userId,  
            firstName: comment.firstName,
            lastName: comment.lastName,
            content: comment.content,
            createdAt: comment.createdAt,
        }));

        console.log(`Comments for post ${postId}:`, formattedComments);  

        return formattedComments;  
    } catch (error) {
        console.error('Error getting post comments:', error);
        throw error;
    }
};

// get specific post
export const getPostById = async (postId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}`, {
            method: 'GET',
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error(`Failed to get post. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to get post.');
        }

        return data.post; 
    } catch (error) {
        console.error('Error getting post:', error);
        throw error;
    }
};

// delete post
export const deletePost = async (postId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}`, {
            method: 'DELETE',
            credentials: 'include',  
        });

        if (!response.ok) {
            throw new Error(`Failed to delete post. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to delete post.');
        }

        return data.message;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

// delete comment
export const deleteComment = async (postId, commentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            credentials: 'include', 
        });

        if (!response.ok) {
            throw new Error(`Failed to delete comment. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to delete comment.');
        }

        return data.message; 
    } catch (error) {
        console.error('Error deleting comment:', error.message);
        throw error;  
    }
};

// edit post
export const editPost = async (postId, content) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}/editPost`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ content }),  
        });

        if (!response.ok) {
            throw new Error(`Failed to edit post. Error with response.`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to edit post.');
        }

        return data.message;  
    } catch (error) {
        console.error('Error editing post:', error.message);
        throw error;
    }
};

// edit comment
export const editComment = async (postId, commentId, content) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}/comments/${commentId}/editComment`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ content }),  
        });

        if (!response.ok) {
            throw new Error(`Failed to edit comment. Error with response.`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to edit comment.');
        }

        return data.message; 
    } catch (error) {
        console.error('Error editing comment:', error.message);
        throw error;
    }
};