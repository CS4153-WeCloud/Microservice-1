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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

INSERT INTO users (email, first_name, last_name, phone, status) VALUES
('john.doe@example.com', 'John', 'Doe', '+1234567890', 'active'),
('jane.smith@example.com', 'Jane', 'Smith', '+0987654321', 'suspended'),
('bob.wilson@example.com', 'Bob', 'Wilson', '+1122334455', 'inactive');

-- Show the created table structure
DESCRIBE users;

SELECT * FROM users;
