-- User Service Database Schema for setup & testing

CREATE DATABASE IF NOT EXISTS user_service_db;
USE user_service_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    role ENUM('student', 'staff', 'faculty', 'other') DEFAULT 'student',
    home_area VARCHAR(100),
    preferred_departure_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role),
    INDEX idx_home_area (home_area)
);

INSERT INTO users (email, first_name, last_name, phone, status, role, home_area, preferred_departure_time) VALUES
('john.doe@example.com', 'John', 'Doe', '+1234567890', 'active', 'student', 'Flushing', '08:00:00'),
('jane.smith@example.com', 'Jane', 'Smith', '+0987654321', 'suspended', 'student', 'Jersey City', '07:30:00'),
('bob.wilson@example.com', 'Bob', 'Wilson', '+1122334455', 'inactive', 'faculty', 'Flushing', '09:00:00');

-- Show the created table structure
DESCRIBE users;

SELECT * FROM users;
