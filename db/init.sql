CREATE SCHEMA IF NOT EXISTS cosmonavt;
USE cosmonavt;

DROP TABLE IF EXISTS users;


CREATE TABLE users
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(50),
    last_name     VARCHAR(50),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login    TIMESTAMP NULL,
    is_active     BOOLEAN   DEFAULT TRUE,
    role          ENUM('user', 'admin', 'moderator') DEFAULT 'user'
);

CREATE INDEX idx_username ON users (username);
CREATE INDEX idx_email ON users (email);


-- Sample Data
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES ('admin', 'admin@example.com', '$2a$12$1234567890123456789012.1234567890123456789012345678901234', 'Admin',
        'User', 'admin'),
       ('testUser', 'user@example.com', '$2a$12$1234567890123456789012.1234567890123456789012345678901234', 'Test',
        'User', 'user');
