USE `project-db`;

CREATE TABLE IF NOT EXISTS GroupJoinRequests (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    GroupID INT NOT NULL,
    UserID INT NOT NULL,
    Status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES `Groups`(ID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    UNIQUE (GroupID, UserID)
);