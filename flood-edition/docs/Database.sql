-- Crear la base de datos
DROP DATABASE cosmonavt_flood;
CREATE DATABASE IF NOT EXISTS cosmonavt_flood;
USE cosmonavt_flood;



-- Tabla Player
CREATE TABLE Player (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    settings TEXT,
    highest_evolution_level INT DEFAULT 1,
    total_biomass_consumed INT DEFAULT 0,
    total_humans_infected INT DEFAULT 0
);

-- Tabla Multiplayer_Session
CREATE TABLE Multiplayer_Session (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    seed TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    max_players SMALLINT NOT NULL DEFAULT 5,
    current_players SMALLINT NOT NULL DEFAULT 1,
    is_active BOOL NOT NULL DEFAULT FALSE
);

-- Tabla SavedGame
CREATE TABLE SavedGame (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    seed TEXT NOT NULL,
    saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_biomass SMALLINT NOT NULL DEFAULT 0,
    current_evolution_level SMALLINT NOT NULL DEFAULT 1,
    fragments_collected SMALLINT NOT NULL DEFAULT 0,
    game_state TEXT NOT NULL,
    is_completed BOOL NOT NULL DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE
);

-- Tabla Flood_Attack
CREATE TABLE Flood_Attack (
    attack_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    base_damage INT NOT NULL,
    range_of_attack FLOAT NOT NULL,
    cooldown FLOAT NOT NULL,
    effect_type VARCHAR(50),
    effect_value INT,
    evolution_level_required INT NOT NULL DEFAULT 1
);

-- Tabla Flood_Evolution
CREATE TABLE Flood_Evolution (
    evolution_id INT AUTO_INCREMENT PRIMARY KEY,
    level SMALLINT NOT NULL,
    damage_multiplier FLOAT NOT NULL,
    health_bonus SMALLINT NOT NULL,
    biomass_capacity SMALLINT NOT NULL,
    visual_changes TEXT,
    unlock_description TEXT
);

-- Tabla GameMap
CREATE TABLE GameMap (
    map_id INT AUTO_INCREMENT PRIMARY KEY,
    seed VARCHAR(50) NOT NULL,
    theme VARCHAR(30) NOT NULL,
    difficulty INT NOT NULL DEFAULT 1,
    width INT NOT NULL,
    height INT NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOL NOT NULL DEFAULT FALSE,
    infection_percentage FLOAT NOT NULL DEFAULT 0
);

-- Tabla Flood
CREATE TABLE Flood (
    flood_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    session_id INT,
    evolution_level SMALLINT NOT NULL DEFAULT 1,
    current_biomass SMALLINT NOT NULL DEFAULT 0,
    max_biomass SMALLINT NOT NULL DEFAULT 10,
    health SMALLINT NOT NULL DEFAULT 100,
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,
    clones_active SMALLINT NOT NULL DEFAULT 0,
    clone_cooldown_end DATETIME,
    fragments_collected SMALLINT NOT NULL DEFAULT 0,
    active_attacks VARCHAR(255) NOT NULL DEFAULT '1',
    sprint_cooldown SMALLINT NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES Multiplayer_Session(session_id) ON DELETE SET NULL
);

-- Tabla Flood_Clone
CREATE TABLE Flood_Clone (
    clone_id INT AUTO_INCREMENT PRIMARY KEY,
    flood_id INT NOT NULL,
    health SMALLINT NOT NULL,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    is_active BOOL NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flood_id) REFERENCES Flood(flood_id) ON DELETE CASCADE
);

-- Tabla Room
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    map_id INT NOT NULL,
    room_type VARCHAR(30) NOT NULL,
    access_requirements VARCHAR(100),
    FOREIGN KEY (map_id) REFERENCES GameMap(map_id) ON DELETE CASCADE
);



-- Tabla ObjectItem
CREATE TABLE ObjectItem (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(30) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_collectable BOOL NOT NULL DEFAULT TRUE,
    is_usable BOOL NOT NULL DEFAULT TRUE,
    effect_value INT NOT NULL DEFAULT 0,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE
);

-- Tabla KnowledgeFragment
CREATE TABLE KnowledgeFragment (
    fragment_id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    importance INT NOT NULL DEFAULT 1,
    type VARCHAR(30) NOT NULL,
    is_collected BOOL NOT NULL DEFAULT FALSE,
    flood_id INT,
    FOREIGN KEY (flood_id) REFERENCES Flood(flood_id) ON DELETE SET NULL
);

-- Tabla GameStatistics
CREATE TABLE GameStatistics (
    stats_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    session_id INT,
    game_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    game_duration_seconds SMALLINT NOT NULL,
    final_evolution_level SMALLINT NOT NULL,
    final_army_size SMALLINT NOT NULL DEFAULT 0,
    humans_infected SMAlLINT NOT NULL DEFAULT 0,
    scientists_infected SMALLINT NOT NULL DEFAULT 0,
    soldiers_infected SMALLINT NOT NULL DEFAULT 0,
    engineers_infected SMALLINT NOT NULL DEFAULT 0,
    biomass_collected SMALLINT NOT NULL DEFAULT 0,
    distance_traveled SMALLINT NOT NULL DEFAULT 0,
    fragments_found SMALLINT NOT NULL DEFAULT 0,
    attacks_used SMALLINT NOT NULL DEFAULT 0,
    clones_created SMALLINT NOT NULL DEFAULT 0,
    deaths SMALLINT NOT NULL DEFAULT 0,
    cure_destroyed BOOL NOT NULL DEFAULT FALSE,
    completion_percentage FLOAT NOT NULL DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES Multiplayer_Session(session_id) ON DELETE SET NULL
);

-- Tabla de relación muchos a muchos entre Flood y Flood_Attack
CREATE TABLE Flood_Has_Attack (
    flood_id INT NOT NULL,
    attack_id INT NOT NULL,
    is_active BOOL NOT NULL DEFAULT FALSE,
    PRIMARY KEY (flood_id, attack_id),
    FOREIGN KEY (flood_id) REFERENCES Flood(flood_id) ON DELETE CASCADE,
    FOREIGN KEY (attack_id) REFERENCES Flood_Attack(attack_id) ON DELETE CASCADE
);

-- Tabla de relación entre Flood y Flood_Evolution
CREATE TABLE Flood_Has_Evolution (
    flood_id INT NOT NULL,
    evolution_id INT NOT NULL,
    acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (flood_id, evolution_id),
    FOREIGN KEY (flood_id) REFERENCES Flood(flood_id) ON DELETE CASCADE,
    FOREIGN KEY (evolution_id) REFERENCES Flood_Evolution(evolution_id) ON DELETE CASCADE
);

-- Tabla de relación entre SavedGame y GameStatistics
CREATE TABLE SavedGame_Has_Statistics (
    save_id INT NOT NULL,
    stats_id INT NOT NULL,
    PRIMARY KEY (save_id, stats_id),
    FOREIGN KEY (save_id) REFERENCES SavedGame(save_id) ON DELETE CASCADE,
    FOREIGN KEY (stats_id) REFERENCES GameStatistics(stats_id) ON DELETE CASCADE
);

-- Insertar valores iniciales para ataquues
INSERT INTO Flood_Attack (name, description, base_damage, range_of_attack, cooldown, effect_type, effect_value, evolution_level_required)
VALUES
    ('Golpe cuerpo a cuerpo', 'Ataque básico de corto alcance', 10, 1.5, 0.8, NULL, NULL, 1),
    ('Vómito ácido', 'Ataque que causa daño continuo y distorsiona la visión', 5, 3.0, 2.0, 'DOT', 2, 1),
    ('Humo tóxico', 'Crea una nube que ralentiza a los enemigos', 0, 4.0, 6.0, 'SLOW', 30, 2),
    ('Lanzamiento de espinas', 'Dispara espinas a larga distancia', 20, 6.0, 4.0, NULL, NULL, 3);

-- Insertar valores iniciales para evoluciones
INSERT INTO Flood_Evolution (level, damage_multiplier, health_bonus, biomass_capacity, visual_changes, unlock_description)
VALUES
    (1, 1.0, 0, 10, 'Forma básica de Flood', 'Forma inicial del Flood'),
    (2, 1.25, 25, 15, 'Tamaño aumentado, nuevos apéndices', 'Evolución que aumenta tu capacidad ofensiva y defensiva'),
    (3, 1.5, 50, 20, 'Forma final, más grande y amenazante', 'Evolución final que maximiza tus capacidades');

