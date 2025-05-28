USE cosmonavt;

INSERT INTO cosmonavt_user (nombre, creation_date, last_login, email, password) VALUE ('player1', NOW(), NOW(), '', '');
INSERT INTO player (user_id, played_time_seconds, kills) VALUE (1, 0, 100);
INSERT INTO game (name, description, status, start_time, end_time, seed)
VALUES ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg'),
       ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg'),
       ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg'),
       ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg'),
       ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg'),
       ('mygame', '', 'wonHuman', NOW(), NOW(), 'gjfchvgjhgvg');

INSERT INTO player_game (player_id, game_id, health, kills, last_position_x, last_position_y)
VALUES (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0),
       (1, 1, 100, 0, 0, 0);

INSERT INTO death (player_game_id, time, cause)
VALUES (1, NOW(), 'Oxygen Depletion'),
       (1, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'Enemy Attack'),
       (1, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'Radiation Exposure'),
       (1, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'Fall Damage'),
       (1, DATE_ADD(NOW(), INTERVAL 20 MINUTE), 'Explosion'),
       (1, DATE_ADD(NOW(), INTERVAL 25 MINUTE), 'Toxic Gas'),
       (1, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 'Suffocation'),
       (1, DATE_ADD(NOW(), INTERVAL 35 MINUTE), 'Enemy Attack'),
       (1, DATE_ADD(NOW(), INTERVAL 40 MINUTE), 'Electrocution'),
       (1, DATE_ADD(NOW(), INTERVAL 45 MINUTE), 'Radiation Exposure'),
       (1, DATE_ADD(NOW(), INTERVAL 50 MINUTE), 'Decompression'),
       (1, DATE_ADD(NOW(), INTERVAL 55 MINUTE), 'Enemy Attack');

