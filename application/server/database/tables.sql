DROP DATABASE IF EXISTS `project-db`;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `project-db`;

-- Use the database
USE `project-db`;

-- Create the Users table if it doesn't exist
CREATE TABLE IF NOT EXISTS Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Major VARCHAR(100),
    Minor VARCHAR(100),
    Pronouns VARCHAR(50)
);
-- Create the Group table

CREATE TABLE IF NOT EXISTS `Groups` (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    AdminID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES Users(ID)
);

CREATE TABLE IF NOT EXISTS GroupMembers (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    GroupID INT NOT NULL,
    UserID INT NOT NULL,
    Role ENUM('member', 'admin') DEFAULT 'member',
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES `Groups`(ID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    UNIQUE (GroupID, UserID)  -- Ensures unique membership in a group
);

-- Create the Posts table
CREATE TABLE IF NOT EXISTS Posts (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GroupID INT, -- Nullable; populated only if Visibility = 'group'
    Content TEXT NOT NULL,
    Visibility ENUM('public', 'private', 'group') DEFAULT 'public',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID),
    FOREIGN KEY (GroupID) REFERENCES `Groups`(ID) -- References Groups table with backticks
);


-- Create the Friendships table
CREATE TABLE IF NOT EXISTS FriendRequests (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    Status ENUM('pending', 'declined') DEFAULT 'pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderID) REFERENCES Users(ID),
    FOREIGN KEY (ReceiverID) REFERENCES Users(ID)
);

-- Associative Tabke for friendship
CREATE TABLE IF NOT EXISTS Friends (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID1 INT NOT NULL,
    UserID2 INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID1) REFERENCES Users(ID),
    FOREIGN KEY (UserID2) REFERENCES Users(ID)
);

-- Create the Majors table
DROP TABLE IF EXISTS `Majors`;
CREATE TABLE Majors (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    MajorName VARCHAR(255) NOT NULL UNIQUE
);


-- Create the Minors table
DROP TABLE IF EXISTS `Minors`;
CREATE TABLE Minors (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    MinorName VARCHAR(255) NOT NULL UNIQUE
);

-- Create the TokenBlacklist table for JWT Tokenizing authorization
CREATE TABLE IF NOT EXISTS TokenBlacklist (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TokenID VARCHAR(255) NOT NULL UNIQUE,  
    UserID INT NOT NULL,
    ExpirationTime TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID)
);

-- Create the Likes table
CREATE TABLE IF NOT EXISTS Likes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PostID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Posts(ID) ON DELETE CASCADE,
    UNIQUE (UserID, PostID) -- Ensures a user can only like a post once
);

CREATE TABLE IF NOT EXISTS Comments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PostID INT NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Posts(ID) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS Conversations (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ConversationParticipants (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    ConversationID INT NOT NULL,
    UserID INT NOT NULL,
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    UNIQUE (ConversationID, UserID)  -- Ensure a user cannot join the same conversation multiple times
);

CREATE TABLE IF NOT EXISTS Messages (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    ConversationID INT NOT NULL,
    SenderID INT NOT NULL,
    Content TEXT NOT NULL,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ID) ON DELETE CASCADE,
    FOREIGN KEY (SenderID) REFERENCES Users(ID) ON DELETE CASCADE
);



