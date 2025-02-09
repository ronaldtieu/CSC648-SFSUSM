USE `project-db`;

ALTER TABLE Users
ADD COLUMN Description TEXT DEFAULT NULL;