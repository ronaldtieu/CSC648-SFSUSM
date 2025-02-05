USE `project-db`;

-- Purpose: Add a "Description" column to the Groups table
ALTER TABLE `Groups`
ADD COLUMN `Description` VARCHAR(255) DEFAULT '';