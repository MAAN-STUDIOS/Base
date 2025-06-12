import { Player } from "@engine/objectPlayer.js";
import { HumanPlayer } from "@engine/humanPlayer.js";
import { FloodPlayer } from "@engine/floodplayer.js";
import { ObjectMap } from "@engine/objectMap.js";
import { Vector } from "@utils/vector.js";
import logger from "@utils/logger.js";

import mapsSpriteSheet from "@assets/map.png";
import { Pistol } from "@engine/pistol.js";
import { Shotgun } from "@engine/shotgun.js";
import { MachineGun } from "@engine/machinegun.js";
import { ShootingSystem } from "@engine/shootingsystem.js";
import { Flamethrower } from "@engine/flamethrower.js";
import { Enemy } from "@engine/enemy.js";
import socket, { emitEvent, subscribeToEvent } from "@utils/networkmanager.js";
import { OtherPlayer } from "@engine/otherPlayer.js";
import { OtherEnemy } from "@engine/otherEnemy.js";
import eventBus from "@utils/eventbus.js";


/**
 * @typedef {Object} RepresentationMap
 * @property {HTMLCanvasElement} canvas - The canvas element for the game map.
 * @property {CanvasRenderingContext2D} ctx - The 2D rendering context for the game map.
 * @property {number} width - The width of the game map.
 * @property {number} height - The height of the game map.
 * @property {ObjectMap} obj - The object map associated with the game map.
 */

export class Engine {
    /**
     * @param options
     * @param [options.fps] - Fixed update fps (render / draw fps are independent).
     * @param [options.player.size]
     * @param [options.player.type]
     * @param [options.player.position]
     * @param [options.player.walkSpeed]
     * @param [options.player.runSpeed]
     * @param [options.map.spriteSheet]
     * @param [options.map.width]
     * @param [options.map.height]
     * @param [options.map.config]
     * @param [options.mapMap.sprideSheet]
     * @param [options.miniMap.width]
     * @param [options.miniMap.height]
     * @param [options.map.config]
     */
    constructor(options = {}) {
        /**
         * Player logic, objects wrapper object.
         * @type {{
         *     size: number,
         *     position: Vector,
         *     obj: Player,
         *     walkSpeed,
         *     runSpeed
         * }}
         */
        this._player = {};

        /**
         * World related logic, objs, config wrapper object.
         * @type {{
         *     sizeRatio: number
         *     map: RepresentationMap
         *     miniMap: RepresentationMap
         * }}
         */
        this._world = {};

        /** @type {RepresentationMap} */
        this._world.map = {};

        /** @type {RepresentationMap} */
        this._world.miniMap = {};

        this._ms_fps = 1 / (options.fps || 60);

        this._player.size = options.player.size || 50;
        this._player.position = options.player.position || new Vector(
            this._world.map.width / 2 - this._player.size / 2,
            this._world.map.height / 2 - this._player.size / 2
        );
        this._player.walkSpeed = options.player.walkSpeed || 70;
        this._player.runSpeed = options.player.runSpeed || this._player.walkSpeed + 30;
        this.spawnPoint = options.player.spawnPoint || Vector.zero();

        this._player.obj = this.#initPlayer(this._player.position, (options.player.type || "human"));
        this._player.functionalities = {};

        this._world.map.width = options.map.width || window.innerWidth;
        this._world.map.height = options.map.height || window.innerHeight;

        this._world.miniMap.width = options.miniMap.width || this._world.map.width * 0.1;
        this._world.miniMap.height = options.miniMap.height || this._world.map.height * 0.1;

        this._world.map.canvas = null;
        this._world.miniMap.canvas = null;

        this._world.map.ctx = null;
        this._world.miniMap.ctx = null;

        const configMap = {
            tiles_per_row: options.map.config.tiles_per_row || 4,
            tile_size: options.map.config.tile_size || 200,
            chunk_size: options.map.config.chunk_size || 16,
            n_loaded_chunks: options.map.config.n_loaded_chunks || 3,
            debug: options.map.config.debug || false,
            debug_info: options.map.config.debug_info || false,
            solidTilesID: [1, 2, 3, 4]
        };

        const configMiniMap = {
            tiles_per_row: options.miniMap.config.tiles_per_row || 1,
            tile_size: options.miniMap.config.tile_size || 6,
            chunk_size: options.miniMap.config.chunk_size || 16,
            n_loaded_chunks: options.miniMap.config.n_loaded_chunks || 5,
            debug: options.miniMap.config.debug || false,
            debug_info: options.miniMap.config.debug_info || false
        };

        this._world.map.obj = new ObjectMap(
            (options.map.spriteSheet || mapsSpriteSheet),
            this._world.map.width, this._world.map.height,
            this._player.obj.real_position.clone(),
            configMap
        );

        this._world.miniMap.obj = new ObjectMap(
            (options.miniMap.spriteSheet || mapsSpriteSheet),
            this._world.miniMap.width, this._world.miniMap.height,
            this._player.obj.real_position.clone(),
            configMiniMap
        );

        this._world.sizeRatio = this._world.miniMap.obj.tile_size / this._world.map.obj.tile_size;

        this.previousTime = null;
        this.currentFrameID = null;
        this.lag = 0;
        this.max_frame_time = 0.25;

        this.onUpdates = [];
        this.onRenders = [];

        /** @type {[function(Hitbox): [Hitbox, boolean], function(Hitbox, Hitbox, Player): void][]} */
        this.onCollisionChecks = [];

        this._gameState = {
            isGameOver: false,
            respawnTime: 1,
            deathScreenShown: false,
            timeToRespawn: 0
        }

        this.onPlayerDeath = [];
        this.onWhilePlayerDeath = [];

        /** @type {Enemy[]} */
        this.enemies = [];

        this.enemyConfig = {
            spawnRadius: 500,
            maxEnemies: 20,
            spawnInterval: 3000,
            lastSpawnTime: 0,
            enemySettings: {
                width: 60,
                height: 60,
                health: 100,
                speed: 6,
                damage: 10,
                chaseRadius: 200,
                attackRadius: 40,
                retreatHealthThreshold: 30,
                retreatDistance: 100
            }
        };

        this.containers = [];


        this.socket_events = {
            PLAYER_MOVE: "PlayerMove",
            PLAYER_JOIN: "PlayerJoin",
            PLAYER_LEAVE: "PlayerLeave",
            ENEMY_MOVES: "EnemyMoves",
            ENEMY_JOIN: "EnemyJoin",
            ENEMY_LEAVES: "EnemyLeaves"
        };

        this.others = new Map();
        this.otherEnemies = new Map();
        this.enemyIdCounter = 0;
        eventBus.on("spawnBoss", (data) => {
            const bossConfigs = {
                boss: {
                    damage: 49,
                    speed: 5,
                    chaseRadius: 800,
                    health: 2000,
                    size: 200
                },
                miniboss: {
                    damage: 45,
                    speed: 12,
                    chaseRadius: 800,
                    health: 1200,
                    size: 120
                },
                elite: {
                    damage: 35,
                    speed: 15,
                    chaseRadius: 600,
                    health: 800,
                    size: 100
                }
            };

            const config = bossConfigs[data.type] || bossConfigs.boss;

            this.spawnCustomEnemy(
                this._world.map.obj,
                data.type,
                data.x,
                data.y,
                config.damage,
                config.speed,
                config.chaseRadius,
                config.health,
                config.size
            );

            logger.info(`${data.type} spawned at (${data.x}, ${data.y}) from tile trigger`);
        });

        logger.info("Engine created.");
    }

    /**
     *
     * @param {HTMLCanvasElement} mapPtr
     * @param {HTMLCanvasElement} miniMapPtr
     */
    init(mapPtr, miniMapPtr) {
        this._world.map.obj.init();
        this._world.miniMap.obj.init();

        this._world.map.canvas = mapPtr;
        this._world.miniMap.canvas = miniMapPtr;

        this._world.map.canvas.width = this._world.map.width;
        this._world.map.canvas.height = this._world.map.height;

        this._world.miniMap.canvas.width = this._world.miniMap.width;
        this._world.miniMap.canvas.height = this._world.miniMap.height;

        this._world.map.ctx = this._world.map.canvas.getContext("2d");
        this._world.miniMap.ctx = this._world.miniMap.canvas.getContext("2d");

        this._player.obj.init(this._world.map.canvas);

        this.initSockets();

        window.addEventListener("resize", this.#handleResize.bind(this));
    }

    start() {
        this.previousTime = performance.now();
        this.lag = 0;
        this.currentFrameID = requestAnimationFrame(this.#gameLoop.bind(this));
    }

    stop() {
        window.removeEventListener("resize", this.#handleResize.bind(this));

        if (!this.currentFrameID) return;

        cancelAnimationFrame(this.currentFrameID);
        this.currentFrameID = null;
    }

    on(event, callback) {
        switch (event) {
            case "resize":
                return true;
            case "update":
                this.onUpdates.push(callback);
                return true;
            case "render":
            case "draw":
                this.onRenders.push(callback);
                return true;
            case "collisionCheck":
                this.onCollisionChecks.push(callback);
                return true;
            case "playerDeath":
                this.onPlayerDeath.push(callback);
                return true;
            case "whilePlayerDeath":
                this.onWhilePlayerDeath.push(callback);
                return true;
            default:
                logger.warn(`${event} is not an event. (Game engine)`)
                break;
        }

        return false;
    }

    get player() {
        return this._player.obj;
    }

    get map() {
        return this._world.map.obj;
    }

    get world_position() {
        return this._world.map.obj.real_position.clone();
    }

    getColor() {
        const colors = ["#4481eb", "#ff7e5f", "#39c5bb", "#9b5de5", "#ffbc42", "#3a6b35", "#9e2a2b", "#5c6bc0"];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    initSockets() {
        subscribeToEvent(this.socket_events.PLAYER_JOIN, (data) => {
            this.others.set(data.id, new OtherPlayer(new Vector(data.x, data.y), this.getColor()));
        });

        subscribeToEvent(this.socket_events.PLAYER_LEAVE, (data) => {
            this.others.delete(data.id);
        });

        subscribeToEvent(this.socket_events.PLAYER_MOVE, (data) => {
            if (this.others.has(data.id)) {
                this.others.get(data.id).target.x = data.x;
                this.others.get(data.id).target.y = data.y;
            }
        });

        socket.on("connect", () => {
            const data = {
                id: socket.id,
                x: this.player.real_position.x,
                y: this.player.real_position.y
            };

            emitEvent(this.socket_events.PLAYER_JOIN, data);
        });


        subscribeToEvent(this.socket_events.ENEMY_JOIN, (data) => {
            if (data.id.startsWith(socket.id)) return;
            this.otherEnemies.set(data.id, new OtherEnemy(
                new Vector(data.x, data.y),
                data.state,
                data.type
            ));
        });

        subscribeToEvent(this.socket_events.ENEMY_LEAVES, (data) => {
            this.otherEnemies.delete(data.id);
        });

        subscribeToEvent(this.socket_events.ENEMY_MOVES, (data) => {
            if (this.otherEnemies.has(data.id)) {
                const enemy = this.otherEnemies.get(data.id);
                enemy.target.x = data.x;
                enemy.target.y = data.y;
                enemy.state = data.state;
            }
        });
    }

    updateOtherEnemies(dt) {
        this.otherEnemies.forEach(enemy => enemy.update(dt));
    }

    drawOtherEnemies(ctx) {
        this.otherEnemies.forEach(enemy => {
            enemy.draw(ctx, this.player.real_position, this.map.camaraWidth, this.map.camaraHeight);
        });
    }

    updateSockets(dt) {
        emitEvent(this.socket_events.PLAYER_MOVE, {
            id: socket.id,
            x: this.player.real_position.x,
            y: this.player.real_position.y
        });

        this.others.forEach(player => player.update(dt));
    }

    drawOthers(ctx) {
        this.others.forEach(player => {
            player.draw(ctx, this.player.real_position, this.map.camaraWidth, this.map.camaraHeight);
        });
        this.drawOtherEnemies(ctx);
    }

    handlePlayerDeath(dt, currentTime) {
        if (!this.player.isDead) return false;

        if (!this._gameState.isGameOver) {
            this._gameState.isGameOver = true;
            this._gameState.deathScreenShown = true;
            this._gameState.respawnTime = currentTime + 3000;

            for (let func of this.onPlayerDeath) {
                func?.(dt, currentTime);
            }
        }

        if (currentTime >= this._gameState.respawnTime) {
            this.respawnPlayer();
            return false;
        }

        for (let func of this.onWhilePlayerDeath) {
            func?.(dt, currentTime);
        }
        return true;
    }

    respawnPlayer() {
        this.player.reSpawn(this.spawnPoint.clone());
        this._gameState.isGameOver = false;
        this._gameState.deathScreenShown = false;
    }

    showDeathScreen(ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "48px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText("YOU DIED", ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);


        ctx.fillStyle = "white";
        ctx.font = "20px 'Press Start 2P', monospace";
        ctx.fillText(`Respawning in ${Math.ceil(this._gameState.timeToRespawn / 1000)}s`,
            ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);


        ctx.font = "12px 'Press Start 2P', monospace";
        ctx.fillText("Press R to restart immediately",
            ctx.canvas.width / 2, ctx.canvas.height / 2 + 60);

        ctx.textAlign = "left";
    }

    /**
     * Generates random waypoints around a center position
     * @param {Vector} center - Center position
     * @param {number} count - Number of waypoints
     * @param {number} radius - Patrol radius
     * @returns {Array<Vector>} Array of waypoint positions
     */
    generateRandomWaypoints(center, count, radius) {
        const waypoints = [];

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const distance = radius * (0.5 + Math.random() * 0.5);

            const x = center.x + Math.cos(angle) * distance;
            const y = center.y + Math.sin(angle) * distance;
            waypoints.push(new Vector(x, y));
        }

        return waypoints;
    }

    /**
     * Spawns a random enemy around the player
     * @param {ObjectMap} gameMap - The game map
     */
    spawnRandomEnemy(gameMap, type = 'flood') {
        const enemyId = `${socket.id}-${this.enemyIdCounter++}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = this.enemyConfig.spawnRadius + Math.random() * 200;

        const spawnX = this.player.real_position.x + Math.cos(angle) * distance;
        const spawnY = this.player.real_position.y + Math.sin(angle) * distance;
        const spawnPosition = new Vector(spawnX, spawnY);

        const waypoints = this.generateRandomWaypoints(spawnPosition, 3, 80);
        const homePoint = new Vector(spawnPosition.x, spawnPosition.y);

        const enemy = new Enemy({
            position: spawnPosition,
            waypoints: waypoints,
            homePoint: homePoint,
            tileGrid: gameMap,
            obstacles: gameMap.hitboxes || [],
            ...this.enemyConfig.enemySettings,
            type: type,
            health: Math.random() * 100 + 100,
            speed: Math.random() * 21 + 4,
            chaseRadius: Math.random() * 900 + 200,
            damage: Math.random() * 10 + 5,


        });

        enemy.id = enemyId;
        this.enemies.push(enemy);

        emitEvent(this.socket_events.ENEMY_JOIN, {
            id: enemyId,
            state: enemy.state,
            type: enemy.enemyType,
            x: enemy.position.x,
            y: enemy.position.y,
        });

        logger.debug("Random enemy spawned", {
            id: enemyId,
            position: spawnPosition,
            totalEnemies: this.enemies.length
        });
    }
    spawnCustomEnemy(gameMap, type = 'flood', spawnX, spawnY, damage, speed, chaseRadius, health, size) {
        const enemyId = `${socket.id}-${this.enemyIdCounter++}`;
        const spawnPosition = new Vector(spawnX, spawnY);

        const waypoints = this.generateRandomWaypoints(spawnPosition, 3, 80);
        const homePoint = new Vector(spawnPosition.x, spawnPosition.y);

        const enemy = new Enemy({
           
            position: spawnPosition,
            waypoints: waypoints,
            homePoint: homePoint,
            tileGrid: gameMap,
            obstacles: gameMap.hitboxes || [],
            ...this.enemyConfig.enemySettings,
            type: type,
            height: size || 60,
            width: size || 60,
            damage: damage || Math.random() * 40 + 10,
            health: health || Math.random() * 1000 + 2000,
            speed: speed || Math.random() * 6 + 4,
            chaseRadius: chaseRadius || Math.random() * 900 + 200,
        });

        enemy.id = enemyId;
        this.enemies.push(enemy);

        emitEvent(this.socket_events.ENEMY_JOIN, {
            id: enemyId,
            state: enemy.state,
            type: enemy.enemyType,
            x: enemy.position.x,
            y: enemy.position.y,
        });

        logger.debug("Random enemy spawned", {
            id: enemyId,
            position: spawnPosition,
            totalEnemies: this.enemies.length
        });
    }
    async spawnContainers(spawnX, spawnY, type, info) {

    }

    /**
     * Handles random enemy spawning around the player
     * @param {number} currentTime - Current game time
     * @param {ObjectMap} gameMap - The game map
     */
    handleEnemySpawning(currentTime, gameMap) {
        const timeToSpawn = currentTime - this.enemyConfig.lastSpawnTime > this.enemyConfig.spawnInterval;
        const notReachMaxEnemies = this.enemies.length < this.enemyConfig.maxEnemies;

        if (timeToSpawn && notReachMaxEnemies) {
            this.spawnRandomEnemy(gameMap);
            this.enemyConfig.lastSpawnTime = currentTime;
        }
    }

    /**
     * Updates all enemies and removes dead ones
     * @param {number} dt - Delta time
     */
    updateEnemies(dt) {
        this.updateOtherEnemies(dt);

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy && enemy.update) {
                enemy.update(dt, this.player, (this.player.clones ?? []));
                this.handleEnemyCollisions(enemy, this.map);

                if (enemy.health <= 0) {
                    logger.debug("Enemy defeated", { remainingEnemies: this.enemies.length - 1 });
                    this.enemies.splice(i, 1);

                    this.player.infectHuman?.();
                    logger.debug(`Player gained biomass! Total: ${this.player.biomass}`);
                } else {
                    emitEvent(this.socket_events.ENEMY_MOVES, {
                        id: enemy.id,
                        state: enemy.state,
                        x: enemy.position.x,
                        y: enemy.position.y,
                    });
                }
            }
        }
    }

    #gameLoop(currentTime) {
        const frame_time = currentTime - this.previousTime;
        this.previousTime = currentTime;
        this.lag += Math.min(frame_time, this.max_frame_time);

        while (this.lag >= this._ms_fps) {
            this.#update(this._ms_fps, currentTime);
            this.lag -= this._ms_fps;
        }

        this.#render();
        this.currentFrameID = requestAnimationFrame(this.#gameLoop.bind(this));
    }

    #update(dt, currentTime) {
        const prevPosition = this._player.obj.real_position.clone(); // WARNING: You must clone the vector!!

        this._player.obj.update(dt);

        if (this.handlePlayerDeath(dt, currentTime)) {
            this._gameState.timeToRespawn = this._gameState.respawnTime - currentTime;
        }

        this.updateSockets(dt);

        for (let update of this.onUpdates) {
            update?.(dt, currentTime);
        }
        this.handleEnemySpawning(currentTime, this.map);
        this.updateEnemies(dt);

        this.#handleCollisions(this._player.obj, this._world.map.obj, prevPosition.clone());

        this._world.map.obj.update(prevPosition.clone(), dt);
        this._world.miniMap.obj.update(prevPosition.scale(this._world.sizeRatio), dt);
    }

    #render() {
        this._world.map.ctx.clearRect(0, 0, this._world.map.width, this._world.map.height);
        this._world.miniMap.ctx.clearRect(0, 0, this._world.miniMap.width, this._world.miniMap.height);

        this._world.map.obj.draw(this._world.map.ctx);

        this._world.map.ctx.save();
        const screenCenterX = this._world.map.width / 2;
        const screenCenterY = this._world.map.height / 2;

        // this._world.map.ctx.fillStyle = this._player.obj.color;
        // this._world.map.ctx.fillRect(
        //     screenCenterX - this._player.size / 2,
        //     screenCenterY - this._player.size / 2,
        //     this._player.size,
        //     this._player.size
        // );

        this.drawOthers(this._world.map.ctx);

        for (let render of this.onRenders) {
            render?.(this._world.map.ctx);
        }

        for (let enemy of this.enemies) {
            if (enemy && enemy.draw) {
                const enemyScreenX = enemy.position.x - this.player.real_position.x + (this.map.camaraWidth / 2);
                const enemyScreenY = enemy.position.y - this.player.real_position.y + (this.map.camaraHeight / 2);

                const visibleEnemy = (
                    enemyScreenX >= -enemy.width &&
                    enemyScreenX <= this.map.camaraWidth + enemy.width &&
                    enemyScreenY >= -enemy.height &&
                    enemyScreenY <= this.map.camaraHeight + enemy.height
                );
                if (visibleEnemy) {
                    enemy.drawAtPosition(this._world.map.ctx, enemyScreenX, enemyScreenY);
                }
            }
        }

        this._world.map.ctx.font = "16px monospace";
        this._world.map.ctx.fillStyle = "white";
        this._world.map.ctx.fillText(
            `${this._player.obj.isRunning ? "Running" : "Walking"}`,
            screenCenterX,
            screenCenterY - this._player.obj.size / 2 - 5
        );
        this._world.map.ctx.restore();

        this._player.obj.draw(this._world.map.ctx)

        this._world.miniMap.obj.draw(this._world.miniMap.ctx);

        const minimapPlayerSize = 4;
        this._world.miniMap.ctx.fillStyle = "#0048ff";
        this._world.miniMap.ctx.beginPath();
        this._world.miniMap.ctx.arc(
            this._world.miniMap.width / 2,
            this._world.miniMap.height / 2,
            minimapPlayerSize,
            0,
            Math.PI * 2
        );
        this._world.miniMap.ctx.fill();

        this._world.miniMap.ctx.strokeStyle = "rgba(96,94,94,0.24)";
        this._world.miniMap.ctx.lineWidth = 2;
        this._world.miniMap.ctx.strokeRect(
            0, 0,
            this._world.miniMap.width,
            this._world.miniMap.height
        );

        if (this._gameState.deathScreenShown) {
            this.showDeathScreen(this._world.map.ctx);
        }

        // Border effect for enemy states
        let borderColor = null;
        let isAttack = false;
        for (let enemy of this.enemies) {
            if (enemy.state === 'ATTACK') {
                isAttack = true;
                break;
            }
        }
        if (isAttack) {
            // Blinking effect for red border
            const t = performance.now() / 300;
            const alpha = 0.2 + 0.2 * Math.abs(Math.sin(t)); // oscillates between 0.2 and 0.4
            borderColor = `rgba(255,0,0,${alpha})`;
        }
        if (borderColor) {
            this._world.map.ctx.save();
            this._world.map.ctx.strokeStyle = borderColor;
            this._world.map.ctx.lineWidth = 32;
            this._world.map.ctx.shadowColor = borderColor;
            this._world.map.ctx.shadowBlur = 40;
            this._world.map.ctx.strokeRect(0, 0, this._world.map.width, this._world.map.height);
            this._world.map.ctx.restore();
        }
    }

    #initPlayer(initialPosition, type) {
        const configPlayer = {
            walkSpeed: this._player.walkSpeed,
            runSpeed: this._player.runSpeed,
            width: this._player.size,
            height: this._player.size,
            spawnPoint: this.spawnPoint.clone(),
            attackSlots: [
                new Pistol({ speed: 130 }),
                new Shotgun({ projectileCount: 2, spread: 15 }),
                new MachineGun({ speed: 170 }),
                new Flamethrower({ speed: 150 })]
        }
        let obj;

        switch (type) {
            case "human":
                obj = new HumanPlayer(initialPosition, configPlayer);
                logger.debug("Human player Created");
                break;
            case "flood":
                obj = new FloodPlayer({
                    position: initialPosition,
                    width: this._player.size,
                    height: this._player.size,
                    walkSpeed: this._player.walkSpeed,
                    runSpeed: this._player.runSpeed,
                });
                logger.debug("Flood player Created");
                break;
            default:
                obj = new Player();
                logger.debug("Player Created");
                break;
        }

        return obj;
    }

    #handleResize(width, height) {
    }

    /**
     * Handles collision detection and resolution between player and map
     * @param {Player} player - The player to check collisions for
     * @param {ObjectMap} gameMap - The game map with hitboxes
     * @param {Vector} prevPosition - Player's position before movement
     */
    #handleCollisions(player, gameMap, prevPosition) {
        const playerHitbox = {
            x: player.real_position.x - this._player.size / 2,
            y: player.real_position.y - this._player.size / 2,
            width: this._player.size,
            height: this._player.size,
            collidesWith: function (other) {
                return (
                    this.x < other.x + other.width &&
                    this.x + this.width > other.x &&
                    this.y < other.y + other.height &&
                    this.y + this.height > other.y
                );
            }
        };

        for (const boundary of gameMap.boundaries) {
            if (playerHitbox.collidesWith(boundary)) {
                this.#resolveCollision(player, boundary, prevPosition);
                playerHitbox.x = player.real_position.x - this._player.size / 2;
                playerHitbox.y = player.real_position.y - this._player.size / 2;
            }
        }

        for (const objHitbox of gameMap.hitboxes) {
            if (playerHitbox.collidesWith(objHitbox)) {
                this.#resolveCollision(player, objHitbox, prevPosition);
                playerHitbox.x = player.real_position.x - this._player.size / 2;
                playerHitbox.y = player.real_position.y - this._player.size / 2;
            }

            for (let [collisionCheck, onCollision] of this.onCollisionChecks) {
                const [hb, collidesWithObj] = collisionCheck?.(objHitbox);

                if (collidesWithObj) {
                    onCollision(objHitbox, hb, this.player);
                }
            }
        }

        for (let collisionCheck of this.onCollisionChecks) {
            const [hb, collidesWithPlayer] = collisionCheck?.(playerHitbox);
            if (collidesWithPlayer) {
                this.#resolveCollision(player, hb, prevPosition);
                playerHitbox.x = player.real_position.x - this._player.size / 2;
                playerHitbox.y = player.real_position.y - this._player.size / 2;
            }
        }
    }

    /**
     *
     * @param {Enemy} enemy
     * @param {ObjectMap} gameMap
     */
    handleEnemyCollisions(enemy, gameMap) {
        const enemyHitbox = {
            x: enemy.position.x - enemy.width / 2,
            y: enemy.position.y - enemy.height / 2,
            width: enemy.width,
            height: enemy.height,
            collidesWith: function (other) {
                return (
                    this.x < other.x + other.width &&
                    this.x + this.width > other.x &&
                    this.y < other.y + other.height &&
                    this.y + this.height > other.y
                );
            }
        };

        for (const boundary of gameMap.boundaries) {
            if (enemyHitbox.collidesWith(boundary)) {
                this.#resolveEnemyCollision(enemy, boundary);
                enemyHitbox.x = enemy.position.x - enemy.width / 2;
                enemyHitbox.y = enemy.position.y - enemy.height / 2;
            }
        }

        for (const objHitbox of gameMap.hitboxes) {
            if (enemyHitbox.collidesWith(objHitbox)) {
                this.#resolveEnemyCollision(enemy, objHitbox);
                enemyHitbox.x = enemy.position.x - enemy.width / 2;
                enemyHitbox.y = enemy.position.y - enemy.height / 2;
            }
        }

        for (const pt of ShootingSystem.projectiles) {
            if (enemyHitbox.collidesWith(pt?.hitbox)) {
                pt.onImpact(enemy);
            }
        }
    }

    /**
     * Resolves collision by adjusting player position
     * @param {Player} player - The player object
     * @param {Hitbox} obstacle - The hitbox player collided with
     * @param {Vector} prevPosition - Player's position before collision
     */
    #resolveCollision(player, obstacle, prevPosition) {
        const currX = player.real_position.x;
        const currY = player.real_position.y;

        const testHitbox = {
            width: player.width,
            height: player.height,
            collidesWith: function (other) {
                return (
                    this.x < other.x + other.width &&
                    this.x + this.width > other.x &&
                    this.y < other.y + other.height &&
                    this.y + this.height > other.y
                );
            }
        };

        player.real_position.x = currX;
        player.real_position.y = prevPosition.y;
        testHitbox.x = player.real_position.x - this._player.size / 2;
        testHitbox.y = player.real_position.y - this._player.size / 2;

        if (testHitbox.collidesWith(obstacle)) {
            player.real_position.x = prevPosition.x;
            player.real_position.y = currY;
            testHitbox.x = player.real_position.x - this._player.size / 2;
            testHitbox.y = player.real_position.y - this._player.size / 2;

            if (testHitbox.collidesWith(obstacle)) {
                player.real_position.x = prevPosition.x;
                player.real_position.y = prevPosition.y;
            }
        }
    }

    #resolveEnemyCollision(enemy, obstacle) {
        const currX = enemy.position.x;
        const currY = enemy.position.y;

        const testHitbox = {
            width: enemy.width,
            height: enemy.height,
            collidesWith: function (other) {
                return (
                    this.x < other.x + other.width &&
                    this.x + this.width > other.x &&
                    this.y < other.y + other.height &&
                    this.y + this.height > other.y
                );
            }
        };

        enemy.position.x = currX;
        enemy.position.y = enemy.prevPosition.y;
        testHitbox.x = enemy.position.x - enemy.width / 2;
        testHitbox.y = enemy.position.y - enemy.height / 2;

        if (testHitbox.collidesWith(obstacle)) {
            enemy.position.x = enemy.prevPosition.x;
            enemy.position.y = currY;
            testHitbox.x = enemy.position.x - enemy.width / 2;
            testHitbox.y = enemy.position.y - enemy.height / 2;

            if (testHitbox.collidesWith(obstacle)) {
                enemy.position.x = enemy.prevPosition.x;
                enemy.position.y = enemy.prevPosition.y;
            }
        }
    }
}
