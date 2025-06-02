CREATE DATABASE IF NOT EXISTS cosmonavt;
USE cosmonavt;

-- Tabla de jugadores 
CREATE TABLE jugadores (
    id_jugador SMALLINT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    password_jugador VARCHAR(50) NOT NULL,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Estado del personaje (en partida)
CREATE TABLE estado_personaje (
    id_jugador SMALLINT PRIMARY KEY,
    vida_actual SMALLINT DEFAULT 100,
    oxigeno_actual SMALLINT DEFAULT 100,
    arma_actual VARCHAR(50),
    linterna_activa BOOLEAN DEFAULT FALSE,
    cooldown_arma_segundos SMALLINT DEFAULT 0,
    num_registros SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

-- Estadísticas específicas (por jugador)
CREATE TABLE estadisticas_jugador (
    id_jugador SMALLINT PRIMARY KEY,
    fragmentos_descubiertos SMALLINT DEFAULT 0,
    partidas_jugadas SMALLINT DEFAULT 0,
    partidas_completadas SMALLINT DEFAULT 0,
    tiempo_total_jugado INT DEFAULT 0,
    enemigos_derrotados_total INT DEFAULT 0,
    runs_exitosas SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

-- Estadísticas globales (generales)
CREATE TABLE estadisticas_globales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_enemigos_derrotados INT DEFAULT 0,
    total_muertes INT DEFAULT 0,
    tiempo_promedio_supervivencia INT DEFAULT 0,
    promedio_logs_por_run FLOAT DEFAULT 0,
    partidas_totales INT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Configuración del jugador
CREATE TABLE configuracion_jugador (
    id_jugador SMALLINT PRIMARY KEY,
    idioma VARCHAR(10) DEFAULT 'es',
    ultima_semilla_usada VARCHAR(100),
    volumen_general SMALLINT DEFAULT 100,
    volumen_fx SMALLINT DEFAULT 100,
    volumen_musica SMALLINT DEFAULT 100,
    entorno_reciente VARCHAR(50),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

-- Tabla de ítems
CREATE TABLE items (
    id_item SMALLINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    tipo VARCHAR(30),
    descripcion TEXT
);

-- Relación ítems-jugador
CREATE TABLE items_jugador (
    id_jugador SMALLINT,
    id_item SMALLINT,
    cantidad SMALLINT DEFAULT 0,
    equipada BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_jugador, id_item),
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador),
    FOREIGN KEY (id_item) REFERENCES items(id_item)
);

-- Tabla de biomas o partes del mapa
CREATE TABLE mapas (
    id_mapa INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion TEXT
);

-- Historial de partidas
CREATE TABLE historial_partidas (
    id_partida INT AUTO_INCREMENT PRIMARY KEY,
    id_jugador SMALLINT,
    id_mapa INT,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    duracion_sesion SMALLINT,
    resultado VARCHAR(20),
    logs_encontrados SMALLINT DEFAULT 0,
    enemigos_derrotados SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador),
    FOREIGN KEY (id_mapa) REFERENCES mapas(id_mapa)
);

-- Ranking por jugador
CREATE TABLE ranking_jugador (
    id_jugador SMALLINT PRIMARY KEY,
    puntos_historia SMALLINT DEFAULT 0,
    tiempo_supervivencia_total INT DEFAULT 0,
    enemigos_totales INT DEFAULT 0,
    -- partidas_con_final SMALLINT DEFAULT 0,
    posicion_ranking SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

-- Detalles del entorno por jugador
CREATE TABLE entorno_detalles_jugador (
    id_jugador SMALLINT,
    entorno VARCHAR(50),
    angulo_vision SMALLINT DEFAULT 145,
    luces_activadas BOOLEAN DEFAULT FALSE,
    progreso_mapa FLOAT DEFAULT 0.0,
    tiempo_total_segundos INT DEFAULT 0,
    tiempo_promedio_segundos INT DEFAULT 0,
    muertes SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_jugador, entorno),
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

-- Desempeño por semilla (específica por jugador)
CREATE TABLE rendimiento_semilla (
    id_jugador SMALLINT,
    semilla VARCHAR(100),
    muertes SMALLINT DEFAULT 0,
    intentos SMALLINT DEFAULT 0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_jugador, semilla),
    FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);
