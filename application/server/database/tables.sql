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

-- Create the Posts table
CREATE TABLE IF NOT EXISTS Posts (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID)
);


-- Create the Friendships table
CREATE TABLE IF NOT EXISTS Friendships (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    User1ID INT NOT NULL,
    User2ID INT NOT NULL,
    Status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User1ID) REFERENCES Users(ID),
    FOREIGN KEY (User2ID) REFERENCES Users(ID)
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
