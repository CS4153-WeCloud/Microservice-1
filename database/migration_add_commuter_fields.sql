-- Migration script to add commuter-related fields to users table
-- Run this script if you have an existing database
-- Note: If columns already exist, you may need to comment out the ALTER TABLE statements

USE user_service_db;

-- Add new columns (remove IF NOT EXISTS as MySQL doesn't support it)
-- If columns already exist, comment out the corresponding lines

ALTER TABLE users 
ADD COLUMN role ENUM('student', 'staff', 'faculty', 'other') DEFAULT 'student' AFTER status;

ALTER TABLE users 
ADD COLUMN home_area VARCHAR(100) AFTER role;

ALTER TABLE users 
ADD COLUMN preferred_departure_time TIME AFTER home_area;

-- Add indexes for better query performance (will fail if index already exists)
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_home_area ON users(home_area);

-- Update existing users with default role if needed
UPDATE users SET role = 'student' WHERE role IS NULL;

-- Show the updated table structure
DESCRIBE users;
