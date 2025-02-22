USE `project-db`;

CREATE TABLE IF NOT EXISTS Notification (
	ID INT AUTO_INCREMENT PRIMARY KEY,
    RecipientID INT NOT NULL,
    NotifierId INT, 
    NotificationType ENUM ('friendRequest', 'groupPost', 'post') NOT NULL,
    NotificationDescription TEXT NOT NULL,
    ReferenceID INT, 
    ReadStatus TINYINT(1) DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (RecipientID) REFERENCES Users(ID) ON DELETE CASCADE,
    FOREIGN KEY (SenderID) REFERENCES Users(ID) ON DELETE SET NULL
    
);