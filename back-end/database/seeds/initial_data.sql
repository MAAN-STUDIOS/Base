-- Insert initial locations
INSERT INTO locations (name, description) VALUES
('Starting Point', 'The beginning of your journey'),
('Ancient Library', 'A repository of forgotten knowledge'),
('Crystal Cave', 'A mysterious cave filled with glowing crystals'),
('Abandoned Laboratory', 'Where experiments went wrong');

-- Insert initial fragments
INSERT INTO fragments (location_id, content, order_index, is_required) VALUES
(1, 'Welcome to the beginning of your journey. Look around carefully.', 1, TRUE),
(1, 'There is a hidden path to the north.', 2, FALSE),
(2, 'The ancient texts speak of a great power.', 1, TRUE),
(2, 'Some pages are missing from the oldest book.', 2, FALSE),
(3, 'The crystals seem to pulse with energy.', 1, TRUE),
(3, 'A strange pattern forms when the crystals align.', 2, FALSE),
(4, 'The last experiment left strange marks on the walls.', 1, TRUE),
(4, 'A journal details the failed attempts.', 2, FALSE);

-- Insert test user (password: test123)
INSERT INTO users (username, email, password_hash) VALUES
('test_user', 'test@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert test game session
INSERT INTO game_sessions (user_id, current_location_id) VALUES
(1, 1);

-- Insert test player progress
INSERT INTO player_progress (user_id, fragment_id, is_completed) VALUES
(1, 1, TRUE);

-- Insert test game statistics
INSERT INTO game_statistics (user_id, total_play_time, fragments_discovered, locations_visited) VALUES
(1, 3600, 1, 1); 