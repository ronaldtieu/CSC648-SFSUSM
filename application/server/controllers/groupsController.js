const bcrypt = require('bcrypt');  // Only declared once
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Create a New Group
exports.createGroup = (req, res) => {
    const { groupName, description } = req.body;
    const adminId = req.userId;

    console.log('Received User ID:', adminId); 

    if (!groupName) {
        return res.json({
            success: false,
            message: 'Group name is required.',
        });
    }

    if (!description) {
        return res.json({
            success: false,
            message: 'Group description is required.',
        });
    }

    if (!adminId) {
        return res.json({
            success: false,
            message: 'Unauthorized: No valid user ID found in session.',
        });
    }

    const createGroupQuery = `
        INSERT INTO \`Groups\` (Name, Description, AdminID)
        VALUES (?, ?, ?)
    `;

    db.query(createGroupQuery, [groupName, description, adminId], (err, result) => {
        if (err) {
            console.error('Error creating group:', err);
            return res.json({
                success: false,
                message: 'Failed to create group.',
            });
        }

        const groupId = result.insertId;

        const addAdminAsMemberQuery = `
            INSERT INTO GroupMembers (GroupID, UserID)
            VALUES (?, ?)
        `;

        db.query(addAdminAsMemberQuery, [groupId, adminId], (err) => {
            if (err) {
                console.error('Error adding admin as member:', err);
                return res.json({
                    success: false,
                    message: 'Failed to add admin as a group member.',
                });
            }

            res.json({
                success: true,
                message: 'Group created successfully with admin as member.',
                groupId: groupId,
            });
        });
    });
};

// Update Group Info
exports.updateGroup = (req, res) => {
    const { groupId, groupName, description } = req.body;
    const adminId = req.userId;

    if (!groupId || !groupName || !description) {
        return res.json({
            success: false,
            message: 'Group ID, name, and description are required.',
        });
    }

    const query = `
        UPDATE \`Groups\` SET Name = ?, Description = ?
        WHERE ID = ? AND AdminID = ?
    `;

    db.query(query, [groupName, description, groupId, adminId], (err, result) => {
        if (err) {
            console.error('Error updating group:', err);
            return res.json({
                success: false,
                message: 'Failed to update group.',
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: 'No group found or you are not the admin.',
            });
        }

        res.json({
            success: true,
            message: 'Group updated successfully.',
        });
    });
};

// Delete a Group
exports.deleteGroup = (req, res) => {
    const { groupId } = req.body;
    const adminId = req.userId;

    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.',
        });
    }

    const query = `
        DELETE FROM \`Groups\` WHERE ID = ? AND AdminID = ?
    `;

    db.query(query, [groupId, adminId], (err, result) => {
        if (err) {
            console.error('Error deleting group:', err);
            return res.json({
                success: false,
                message: 'Failed to delete group.',
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: 'No group found or you are not the admin.',
            });
        }

        res.json({
            success: true,
            message: 'Group deleted successfully.',
        });
    });
};

// Add a Member to the Group
exports.addMember = (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        return res.json({
            success: false,
            message: 'Group ID and user ID are required.',
        });
    }

    const checkMembershipQuery = `
        SELECT COUNT(*) AS count FROM GroupMembers
        WHERE GroupID = ? AND UserID = ?
    `;

    db.query(checkMembershipQuery, [groupId, userId], (err, results) => {
        if (err) {
            console.error('Error checking group membership:', err);
            return res.json({
                success: false,
                message: 'Failed to check group membership.',
            });
        }

        if (results[0].count > 0) {
            return res.json({
                success: false,
                message: 'User is already a member of the group.',
            });
        }

        const addMemberQuery = `
            INSERT INTO GroupMembers (GroupID, UserID)
            VALUES (?, ?)
        `;

        db.query(addMemberQuery, [groupId, userId], (err) => {
            if (err) {
                console.error('Error adding member to group:', err);
                return res.json({
                    success: false,
                    message: 'Failed to add member to group.',
                });
            }

            res.json({
                success: true,
                message: 'Member added to the group successfully.',
            });
        });
    });
};

// Remove a Member from the Group (Admin only)
exports.removeMember = (req, res) => {
    const { groupId, userId } = req.body;
    const adminId = req.userId;  // Admin ID from session

    if (!groupId || !userId) {
        return res.json({
            success: false,
            message: 'Group ID and user ID are required.',
        });
    }

    const checkAdminQuery = `
        SELECT AdminID FROM \`Groups\` WHERE ID = ?
    `;

    db.query(checkAdminQuery, [groupId], (err, result) => {
        if (err) {
            console.error('Error checking admin status:', err);
            return res.json({
                success: false,
                message: 'Failed to verify admin status.',
            });
        }

        if (result.length === 0 || result[0].AdminID !== adminId) {
            return res.json({
                success: false,
                message: 'Only the admin can remove members from the group.',
            });
        }

        const checkMemberQuery = `
            SELECT * FROM GroupMembers WHERE GroupID = ? AND UserID = ?
        `;

        db.query(checkMemberQuery, [groupId, userId], (err, memberResult) => {
            if (err) {
                console.error('Error checking member status:', err);
                return res.json({
                    success: false,
                    message: 'Failed to verify membership status.',
                });
            }

            if (memberResult.length === 0) {
                return res.json({
                    success: false,
                    message: 'User not found in the group.',
                });
            }

            const removeMemberQuery = `
                DELETE FROM GroupMembers WHERE GroupID = ? AND UserID = ?
            `;

            db.query(removeMemberQuery, [groupId, userId], (err, removeResult) => {
                if (err) {
                    console.error('Error removing member from group:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to remove member from group.',
                    });
                }

                res.json({
                    success: true,
                    message: 'Member removed from the group successfully.',
                });
            });
        });
    });
};

// Get Group Details
exports.getGroupDetails = (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.',
        });
    }

    const query = `
        SELECT 
            \`Groups\`.Name, 
            \`Groups\`.AdminID, 
            Users.FirstName AS AdminFirstName, 
            Users.LastName AS AdminLastName,
            (SELECT COUNT(*) FROM GroupMembers WHERE GroupMembers.GroupID = ?) AS TotalMembers
        FROM \`Groups\`
        JOIN Users ON \`Groups\`.AdminID = Users.ID
        WHERE \`Groups\`.ID = ?
    `;

    db.query(query, [groupId, groupId], (err, results) => {
        if (err) {
            console.error('Error retrieving group details:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve group details.',
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'Group not found.',
            });
        }

        res.json({
            success: true,
            groupDetails: {
                ...results[0],
                TotalMembers: results[0].TotalMembers,
            },
        });
    });
};

// Fetch Group Posts
exports.getGroupPosts = (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.',
        });
    }

    const query = `
        SELECT Posts.ID, Posts.Content, Posts.CreatedAt, Users.FirstName, Users.LastName
        FROM Posts
        JOIN Users ON Posts.UserID = Users.ID
        WHERE Posts.GroupID = ?
        ORDER BY Posts.CreatedAt DESC
    `;

    db.query(query, [groupId], (err, results) => {
        if (err) {
            console.error('Error retrieving group posts:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve group posts.',
            });
        }

        res.json({
            success: true,
            posts: results,
        });
    });
};

// Get All Groups
// because group is a key word, must use it with ` in order to work properly
exports.getAllGroups = (req, res) => {
    const currentUserId = req.userId; 

    console.log('Current session user ID:', currentUserId); // Log user ID for debugging

    const query = `
      SELECT \`Groups\`.ID, \`Groups\`.Name, \`Groups\`.AdminID, 
             Users.FirstName AS AdminFirstName, Users.LastName AS AdminLastName, \`Groups\`.CreatedAt
      FROM \`Groups\`
      JOIN Users ON \`Groups\`.AdminID = Users.ID
      ORDER BY \`Groups\`.CreatedAt DESC
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving groups:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve groups.',
        });
      }

    //   console.log('Returning groups and user ID:', { currentUserId, groupCount: results.length }); // Log API response

      res.json({
        success: true,
        groups: results,
        currentUserId, 
      });
    });
};

// Get All Members of a Group
exports.getGroupMembers = (req, res) => {
    const { groupId } = req.body;

    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.',
        });
    }

    const query = `
        SELECT Users.ID AS UserID, Users.FirstName, Users.LastName
        FROM GroupMembers
        JOIN Users ON GroupMembers.UserID = Users.ID
        WHERE GroupMembers.GroupID = ?
        ORDER BY Users.FirstName ASC
    `;

    db.query(query, [groupId], (err, results) => {
        if (err) {
            console.error('Error retrieving group members:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve group members.',
            });
        }

        res.json({
            success: true,
            members: results,
        });
    });
};

// Get Group By ID with details, members, and posts
exports.getGroupById = (req, res) => {
    const { groupId } = req.params;
    const currentUserId = req.userId;
  
    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.',
        });
    }
  
    const groupQuery = `
      SELECT ID, Name, Description, AdminID
      FROM \`Groups\`
      WHERE ID = ?
    `;
  
    db.query(groupQuery, [groupId], (err, groupResults) => {
        if (err) {
            console.error('Error retrieving group details:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve group details.',
            });
        }
  
        if (groupResults.length === 0) {
            return res.json({
                success: false,
                message: 'Group not found.',
            });
        }
  
        const group = groupResults[0];
  
        const membersQuery = `
          SELECT Users.ID, Users.FirstName, Users.LastName
          FROM GroupMembers
          JOIN Users ON GroupMembers.UserID = Users.ID
          WHERE GroupMembers.GroupID = ?
          ORDER BY Users.FirstName ASC
        `;
  
        db.query(membersQuery, [groupId], (err, memberResults) => {
            if (err) {
                console.error('Error retrieving group members:', err);
                return res.json({
                    success: false,
                    message: 'Failed to retrieve group members.',
                });
            }
  
            group.members = memberResults;
  
            const postsQuery = `
              SELECT Posts.ID, Posts.Content, Posts.CreatedAt, Posts.visibility, Users.FirstName, Users.LastName
              FROM Posts
              JOIN Users ON Posts.UserID = Users.ID
              WHERE Posts.GroupID = ?
              ORDER BY Posts.CreatedAt DESC
            `;
  
            db.query(postsQuery, [groupId], (err, postResults) => {
                if (err) {
                    console.error('Error retrieving group posts:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to retrieve group posts.',
                    });
                }
  
                group.posts = postResults;
  
                group.isAdmin = (group.AdminID === currentUserId);
  
                return res.json({
                    success: true,
                    group,
                    currentUserId, 
                });
            });
        });
    });
};

// Request to Join a Group
exports.requestToJoinGroup = (req, res) => {
    const { groupId } = req.body;
    const userId = req.userId;  // Assume req.userId was set via your auth middleware

    if (!groupId) {
        return res.json({
            success: false,
            message: 'Group ID is required.'
        });
    }

    // Insert a new join request
    const query = `
        INSERT INTO GroupJoinRequests (GroupID, UserID)
        VALUES (?, ?)
    `;
    db.query(query, [groupId, userId], (err, result) => {
        if (err) {
            // Handle duplicate entry error if user already requested membership
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({
                    success: false,
                    message: 'You have already requested to join this group.'
                });
            }
            console.error('Error creating join request:', err);
            return res.json({
                success: false,
                message: 'Failed to send join request.'
            });
        }
        res.json({
            success: true,
            message: 'Join request sent successfully.'
        });
    });
};

// Approve or Decline a Join Request
exports.respondToJoinRequest = (req, res) => {
    const { joinRequestId, action } = req.body; // action should be 'approved' or 'declined'
    const adminId = req.userId;
    
    // First, verify that the current user is the admin of the group
    const adminCheckQuery = `
        SELECT Groups.AdminID FROM Groups
        JOIN GroupJoinRequests ON Groups.ID = GroupJoinRequests.GroupID
        WHERE GroupJoinRequests.ID = ?
    `;
    db.query(adminCheckQuery, [joinRequestId], (err, results) => {
        if (err || results.length === 0) {
            return res.json({
                success: false,
                message: 'Join request not found or error occurred.'
            });
        }
        
        if (results[0].AdminID !== adminId) {
            return res.json({
                success: false,
                message: 'Only the group admin can respond to join requests.'
            });
        }
        
        // Update the join request status
        const updateQuery = `
            UPDATE GroupJoinRequests SET Status = ? WHERE ID = ?
        `;
        db.query(updateQuery, [action, joinRequestId], (err, result) => {
            if (err) {
                console.error('Error updating join request:', err);
                return res.json({
                    success: false,
                    message: 'Failed to update join request.'
                });
            }
            
            // Optionally, if approved, insert the user into the GroupMembers table
            if (action === 'approved') {
                const insertQuery = `
                    INSERT INTO GroupMembers (GroupID, UserID, Role)
                    SELECT GroupID, UserID, 'member'
                    FROM GroupJoinRequests WHERE ID = ?
                `;
                db.query(insertQuery, [joinRequestId], (err, result) => {
                    if (err) {
                        console.error('Error adding member:', err);
                        return res.json({
                            success: false,
                            message: 'Join request approved but failed to add member.'
                        });
                    }
                    return res.json({
                        success: true,
                        message: 'Join request approved and member added.'
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: 'Join request has been declined.'
                });
            }
        });
    });
};

exports.showJoinRequests = (req, res) => {
    const { groupId } = req.params;  
    const adminId = req.userId;
  
    if (!groupId) {
      return res.json({
        success: false,
        message: 'Group ID is required.'
      });
    }
  
    // First, verify that the current user is the admin of the group
    const adminQuery = `
      SELECT AdminID FROM \`Groups\`
      WHERE ID = ?
    `;
    db.query(adminQuery, [groupId], (err, results) => {
      if (err || results.length === 0) {
        console.error('Error checking group admin:', err);
        return res.json({
          success: false,
          message: 'Group not found or error occurred.'
        });
      }
  
      if (results[0].AdminID !== adminId) {
        return res.json({
          success: false,
          message: 'Only the group admin can view join requests.'
        });
      }
  
      // Now fetch pending join requests for the group, along with user details
      const joinRequestsQuery = `
        SELECT 
          GJR.ID AS joinRequestId,
          GJR.GroupID,
          GJR.UserID,
          GJR.Status,
          GJR.CreatedAt,
          U.FirstName,
          U.LastName,
          U.Email
        FROM GroupJoinRequests AS GJR
        JOIN Users AS U ON GJR.UserID = U.ID
        WHERE GJR.GroupID = ? AND GJR.Status = 'pending'
        ORDER BY GJR.CreatedAt ASC
      `;
      db.query(joinRequestsQuery, [groupId], (err, requests) => {
        if (err) {
          console.error('Error retrieving join requests:', err);
          return res.json({
            success: false,
            message: 'Failed to retrieve join requests.'
          });
        }
        return res.json({
          success: true,
          joinRequests: requests
        });
      });
    });
  };