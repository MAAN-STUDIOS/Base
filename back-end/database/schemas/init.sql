-- Create database if not exists
CREATE DATABASE IF NOT EXISTS game_db;
USE game_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    current_location_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_accessible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Fragments table
CREATE TABLE IF NOT EXISTS fragments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    content TEXT NOT NULL,
    order_index INT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_order (location_id, order_index)
);

-- Player progress table
CREATE TABLE IF NOT EXISTS player_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    fragment_id INT NOT NULL,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_fragment (user_id, fragment_id)
);

-- Game statistics table
CREATE TABLE IF NOT EXISTS game_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_play_time INT DEFAULT 0,
    fragments_discovered INT DEFAULT 0,
    locations_visited INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_stats (user_id)
);

-- Create triggers for statistics updates
DELIMITER //
CREATE TRIGGER after_fragment_discovery
AFTER INSERT ON player_progress
FOR EACH ROW
BEGIN
    UPDATE game_statistics 
    SET fragments_discovered = fragments_discovered + 1
    WHERE user_id = NEW.user_id;
END//

CREATE TRIGGER after_location_visit
AFTER UPDATE ON game_sessions
FOR EACH ROW
BEGIN
    IF NEW.current_location_id != OLD.current_location_id THEN
        UPDATE game_statistics 
        SET locations_visited = locations_visited + 1
        WHERE user_id = NEW.user_id;
    END IF;
END//
DELIMITER ; 