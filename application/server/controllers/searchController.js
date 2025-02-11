const db = require('../config/db');
require('dotenv').config();

exports.search = (req, res) => {
  const queryParam = req.query.q;

  if (!queryParam) {
    return res.json({
      success: false,
      message: 'Query parameter is required.',
    });
  }

  const searchTerm = `%${queryParam}%`;

  let results = {
    users: [],
    posts: []
  };

  let completed = 0;

  // Helper function to check if both queries have completed.
  const checkComplete = () => {
    completed++;
    if (completed === 2) {
      return res.json({
        success: true,
        query: queryParam,
        results: results,
      });
    }
  };

  // Search for users by first name, last name, or the concatenation of both.
  const userQuery = `
    SELECT 
      ID, 
      FirstName, 
      LastName, 
      Email
    FROM Users
    WHERE FirstName LIKE ? 
      OR LastName LIKE ? 
      OR CONCAT(FirstName, ' ', LastName) LIKE ?
    ORDER BY FirstName, LastName
  `;
  db.query(userQuery, [searchTerm, searchTerm, searchTerm], (err, userRows) => {
    if (err) {
      console.error('Error searching users: ', err);
      results.users = [];
    } else {
      results.users = userRows;
    }
    checkComplete();
  });

  // Search for posts by content.
  const postQuery = `
    SELECT 
      p.ID, 
      p.Content, 
      p.CreatedAt, 
      p.UserID, 
      p.Visibility, 
      p.GroupID, 
      u.FirstName, 
      u.LastName,
      GROUP_CONCAT(h.Tag) AS hashtags
    FROM Posts p
    JOIN Users u ON p.UserID = u.ID
    LEFT JOIN PostHashtags ph ON p.ID = ph.PostID
    LEFT JOIN Hashtags h ON ph.HashtagID = h.ID
    WHERE p.Content LIKE ?
    GROUP BY p.ID
    ORDER BY p.CreatedAt DESC
  `;
  db.query(postQuery, [searchTerm], (err, postRows) => {
    if (err) {
      console.error('Error searching posts: ', err);
      results.posts = [];
    } else {
      results.posts = postRows.map(post => {
        post.hashtags = post.hashtags ? post.hashtags.split(',') : [];
        return post;
      });
    }
    checkComplete();
  });
};