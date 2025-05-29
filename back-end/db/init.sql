DROP SCHEMA IF EXISTS cosmonavt;
CREATE DATABASE IF NOT EXISTS cosmonavt;
USE cosmonavt;

#     last_update      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

CREATE TABLE cosmonavt_user (
    id            INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(255)    NOT NULL,
    creation_date TIMESTAMP       NOT NULL DEFAULT NOW(),
    last_login    TIMESTAMP       NOT NULL DEFAULT NOW(),
    email         VARCHAR(255)    NOT NULL,
    password      VARCHAR(512)    NOT NULL
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE player (
    id                  INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    played_time_seconds INT             NOT NULL,
    kills               SMALLINT DEFAULT 0,
    deaths              SMALLINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES cosmonavt_user (id) ON DELETE CASCADE
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE admin (
    id           INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id      INT             NOT NULL,
    access_level SMALLINT        NOT NULL,
    FOREIGN KEY (user_id) REFERENCES cosmonavt_user (id) ON DELETE CASCADE
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE config (
    id             INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    player_id      INT             NOT NULL,
    general_volume SMALLINT DEFAULT 100,
    music_volume   SMALLINT DEFAULT 100,
    last_update    TIMESTAMP,
    fps            SMALLINT DEFAULT 60,
    effects_volume SMALLINT DEFAULT 100,
    FOREIGN KEY (player_id) REFERENCES player (id) ON DELETE CASCADE
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE game (
    id          INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(12) DEFAULT 'NONE',
    start_time  TIMESTAMP   DEFAULT NOW(),
    end_time    TIMESTAMP   DEFAULT NULL,
    seed        VARCHAR(64) DEFAULT NULL
) CHARACTER SET utf8
  ENGINE = InnoDB; -- TODO: Maybe Change InnoDB


CREATE TABLE player_game (
    id              INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    player_id       INT      NOT NULL,
    game_id         INT      NOT NULL,
    health          SMALLINT NOT NULL,
    kills           SMALLINT NOT NULL,
    last_position_x SMALLINT NOT NULL,
    last_position_y SMALLINT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES player (id),
    FOREIGN KEY (game_id) REFERENCES game (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE death (
    id             INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    player_game_id INT             NOT NULL,
    time           TIMESTAMP DEFAULT NOW(),
    cause          VARCHAR(255)    NOT NULL,
    FOREIGN KEY (player_game_id) REFERENCES player_game (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE flood_game (
    id             INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    player_game_id INT             NOT NULL,
    biomass        INT DEFAULT 0,
    infected       INT DEFAULT 0,
    FOREIGN KEY (player_game_id) REFERENCES player_game (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE flood_clones (
    id       INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    flood_id INT             NOT NULL,
    health   SMALLINT        NOT NULL DEFAULT 100,
    FOREIGN KEY (flood_id) REFERENCES flood_game (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE item (
    id          INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    sprite_id   SMALLINT     NOT NULL,
    type        SMALLINT     NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE loot (
    id      INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    item_id INT      NOT NULL,
    type    SMALLINT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES item (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE weapon (
    id       INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    loot_id  INT      NOT NULL,
    damage   SMALLINT NOT NULL,
    cooldown SMALLINT NOT NULL,
    FOREIGN KEY (loot_id) REFERENCES loot (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE human_game (
    id                   INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    oxygen               SMALLINT NOT NULL,
    weapon_1             INT      NOT NULL,
    weapon_2             INT      NOT NULL,
    generators_activated SMALLINT NOT NULL,
    FOREIGN KEY (weapon_1) REFERENCES weapon (id),
    FOREIGN KEY (weapon_2) REFERENCES weapon (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE fragment (
    id      INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    loot_id INT          NOT NULL,
    data    VARCHAR(255) NOT NULL,
    FOREIGN KEY (loot_id) REFERENCES loot (id)
) CHARACTER SET utf8
  ENGINE = InnoDB; -- TODO: impl

CREATE TABLE game_loot (
    id         INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    loot_id    INT      NOT NULL,
    game_id    INT      NOT NULL,
    type       SMALLINT NOT NULL,
    found_time TIMESTAMP,
    FOREIGN KEY (loot_id) REFERENCES loot (id),
    FOREIGN KEY (game_id) REFERENCES game (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

# Layout / chunk (for simplicity are the same size)
# x and y represenst the chunk coordenates in its corresponding
# chunk agrupation (see game_chunk_layout)
CREATE TABLE chunk (
    id   INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    data JSON     NOT NULL,
    x    SMALLINT NOT NULL,
    y    SMALLINT NOT NULL
) CHARACTER SET utf8
  ENGINE = InnoDB;

# Game layout (normally cached in server but for simplicity stored here),
# a game has 4 layouts:
# - Bigger view of the map
# - 1rs dungeon
# - 2nd dungeon
# - 3rd dungeon
CREATE TABLE game_chunk_layout (
    id              INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    game_id         INT          NOT NULL,
    chunk_layout_id INT          NOT NULL,
    name            VARCHAR(255) NOT NULL,
    type            SMALLINT     NOT NULL,
    FOREIGN KEY (game_id) REFERENCES game (id),
    FOREIGN KEY (chunk_layout_id) REFERENCES chunk (id)
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE dungeon (
    id   INT          NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type SMALLINT     NOT NULL
) CHARACTER SET utf8
  ENGINE = InnoDB;

CREATE TABLE node (
    id          INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    dungeon_id  INT      NOT NULL,
    rotations   SMALLINT NOT NULL,
    layout_type SMALLINT NOT NULL,
    x           SMALLINT NOT NULL,
    y           SMALLINT NOT NULL,
    FOREIGN KEY (dungeon_id) REFERENCES dungeon (id)
) CHARACTER SET utf8
  ENGINE = MyISAM;

CREATE TABLE layout (
    id   INT      NOT NULL PRIMARY KEY AUTO_INCREMENT,
    type SMALLINT NOT NULL,
    data JSON     NOT NULL
) CHARACTER SET utf8
  ENGINE = MyISAM;



CREATE VIEW view_admin AS
    SELECT a.id            AS id,
           u.nombre        AS name,
           u.email         AS email,
           u.creation_date AS creation_date,
           a.access_level  AS access_level,
           u.password      AS password,
           u.last_login    AS last_login
    FROM admin a
             INNER JOIN cosmonavt_user u ON a.user_id = u.id;


SELECT SUM(kills) AS total_kills
FROM player;

SELECT SUM(deaths) AS total_deaths
FROM player;

SELECT COUNT(*) AS won_by_flood
FROM game
WHERE status LIKE 'wonFlood';

SELECT COUNT(*) AS won_by_human
FROM game
WHERE status LIKE 'wonHuman';

SELECT p.id AS player_id, d.id AS death_id, d.time, d.cause
FROM death d
         INNER JOIN player_game pg ON d.player_game_id = pg.id
         INNER JOIN player p ON pg.player_id = p.id
GROUP BY d.id;

WITH diffs AS (SELECT p.id                                                                                 AS player_id,
                      pg.id                                                                                AS game_player_id,
                      d.id                                                                                 AS death_id,
                      d.time,
                      TIMESTAMPDIFF(SECOND, LAG(d.time) OVER (PARTITION BY pg.id ORDER BY d.time), d.time) AS dt
               FROM death d
                        INNER JOIN player_game pg ON d.player_game_id = pg.id
                        INNER JOIN player p ON pg.player_id = p.id
               GROUP BY d.id, d.time
               ORDER BY d.time)
SELECT player_id, AVG(dt) AS mean_time_alive
FROM diffs
WHERE dt IS NOT NULL
GROUP BY player_id;

-- Get death Count
SELECT COUNT(*) AS total_deaths
FROM death d
         INNER JOIN player_game pg ON d.player_game_id = pg.id
         INNER JOIN player p ON pg.player_id = p.id
GROUP BY p.id;

CREATE VIEW view_player AS
    SELECT p.id                  AS id,
           u.nombre              AS name,
           u.email               AS email,
           u.creation_date       AS creation_date,
           p.played_time_seconds AS played_time_seconds,
           p.kills               AS kills,
           p.deaths              AS deaths,
           u.password            AS password,
           u.last_login          AS last_login
    FROM player p
             INNER JOIN cosmonavt_user u ON p.user_id = u.id;

CREATE VIEW view_config AS
    SELECT c.id             AS id,
           p.id             AS player_id,
           u.nombre         AS player_name,
           c.general_volume AS general_volume,
           c.music_volume   AS music_volume,
           c.effects_volume AS effects_volume,
           c.fps            AS fps,
           c.last_update    AS last_update
    FROM config c
             INNER JOIN player p ON c.player_id = p.id
             INNER JOIN cosmonavt_user u ON p.user_id = u.id;

CREATE VIEW view_game AS
    SELECT g.name        AS name,
           g.description AS description,
           g.start_time  AS start_time,
           g.end_time    AS end_time,
           g.status      AS status
    FROM game g;

CREATE VIEW view_human_view_game AS
    SELECT hg.id                   AS id,
           pg.health               AS health,
           hg.oxygen               AS oxygen,
           pg.kills                AS gamekills,
           COUNT(d.id)             AS gamedeaths,
           pg.last_position_x      AS last_position_x,
           pg.last_position_y      AS last_position_y,
           hg.weapon_1             AS weapo_1,
           hg.weapon_2             AS weapo_2,
           hg.generators_activated AS generators_activated
    FROM human_game hg
             INNER JOIN player_game pg ON hg.id = pg.game_id
             INNER JOIN death d ON pg.id = d.player_game_id
    GROUP BY pg.id;


CREATE VIEW view_flood_view_game AS
    SELECT hg.id              AS id,
           pg.health          AS health,
           hg.biomass         AS biomass,
           pg.kills           AS gamekills,
           COUNT(d.id)        AS gamedeaths,
           pg.last_position_x AS last_position_x,
           pg.last_position_y AS last_position_y,
           hg.infected        AS gameinfected
    FROM flood_game hg
             INNER JOIN player_game pg ON hg.id = pg.game_id
             INNER JOIN death d ON pg.id = d.player_game_id
    GROUP BY pg.id;


CREATE VIEW view_chunk AS
    SELECT c.id AS id, c.x AS x, c.y AS y, c.data AS data
    FROM chunk c;

CREATE VIEW view_dungeon AS
    SELECT d.id AS id, d.name AS name, d.type AS type
    FROM dungeon d;

CREATE VIEW view_node AS
    SELECT n.id AS id, n.x AS x, n.y AS y, n.rotations AS rotations, n.layout_type AS type
    FROM node n;

CREATE VIEW view_layout AS
    SELECT l.id AS id, l.data AS data, l.type AS type
    FROM layout l;

CREATE VIEW view_stats AS
    SELECT (SELECT SUM(kills) FROM player)                          AS total_kills,
           (SELECT SUM(deaths) FROM player)                         AS total_deaths,
           (SELECT COUNT(*) FROM game)                              AS total_games,
           (SELECT COUNT(*) FROM fragment)                          AS total_fragments,
           (SELECT COUNT(*) FROM game WHERE status LIKE 'wonFlood') AS won_by_flood,
           (SELECT COUNT(*) FROM game WHERE status LIKE 'wonHuman') AS won_by_human,
           (SELECT AVG(dt)
            FROM (SELECT TIMESTAMPDIFF(SECOND, LAG(d.time) OVER (PARTITION BY pg.id ORDER BY d.time), d.time) AS dt
                  FROM death d
                           INNER JOIN player_game pg ON d.player_game_id = pg.id) AS time_diffs
            WHERE dt IS NOT NULL)                                   AS mean_time_alive,
           (SELECT MAX(fecha)
            FROM (SELECT MAX(start_time) AS fecha
                  FROM game
                  UNION
                  SELECT MAX(last_login)
                  FROM cosmonavt_user
                  UNION
                  SELECT MAX(last_update)
                  FROM config) AS fechas)                           AS last_update;