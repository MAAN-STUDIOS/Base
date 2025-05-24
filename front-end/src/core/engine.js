import { Player } from "@engine/objectPlayer.js";
import { HumanPlayer } from "@engine/humanPlayer.js";
import { FloodPlayer } from "@engine/floodplayer.js";
import { ObjectMap } from "@engine/objectMap.js";
import { Vector } from "@utils/vector.js";
import logger from "@utils/logger.js";

import mapsSpriteSheet from "@assets/map.png";


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
         *     functionalities
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
        this._player.runSpeed = options.player.runSpeed || 140;

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
            tiles_per_row: options.map.config.tiles_per_row || 1,
            tile_size: options.map.config.tile_size || 200,
            chunk_size: options.map.config.chunk_size || 16,
            n_loaded_chunks: options.map.config.n_loaded_chunks || 5,
            debug: options.map.config.debug || false,
            debug_info: options.map.config.debug_info || false
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
        this.onCollision = [];
        this.onCollisionChecks = [];
        this.floodWalkSpeed = options.player.walkSpeed || 0;
        this.floodRunSpeed = options.player.runSpeed || 0;

        logger.info("Engine created.");
    }

    /**
     *
     * @param {HTMLCanvasElement} mapPtr
     * @param {HTMLCanvasElement} miniMapPtr
     */
    init(mapPtr, miniMapPtr) {
        this._world.map.canvas = mapPtr;
        this._world.miniMap.canvas = miniMapPtr;

        this._world.map.canvas.width = this._world.map.width;
        this._world.map.canvas.height = this._world.map.height;

        this._world.miniMap.canvas.width = this._world.miniMap.width;
        this._world.miniMap.canvas.height = this._world.miniMap.height;

        this._world.map.ctx = this._world.map.canvas.getContext("2d");
        this._world.miniMap.ctx = this._world.miniMap.canvas.getContext("2d");

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
            case "collision":
                this.onCollision.push(callback);
                return true;
            case "collisionCheck":
                this.onCollisionChecks.push(callback);
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

        for (let update of this.onUpdates) {
            update?.(dt, currentTime);
        }

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

        this._world.map.ctx.fillStyle = this._player.obj.color;
        this._world.map.ctx.fillRect(
            screenCenterX - this._player.size / 2,
            screenCenterY - this._player.size / 2,
            this._player.size,
            this._player.size
        );

        for (let render of this.onRenders) {
            render?.(this._world.map.ctx);
        }

        this._world.map.ctx.font = "16px monospace";
        this._world.map.ctx.fillStyle = "white";
        this._world.map.ctx.fillText(
            `${this._player.obj.isRunning ? "Running" : "Walking"}`,
            screenCenterX,
            screenCenterY - this._player.obj.size / 2 - 5
        );
        this._world.map.ctx.restore();

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
    }

    #initPlayer(initialPosition, type) {
        const configPlayer = {
            walkSpeed: 70,
            runSpeed: null, // NOTE: when its null it is calculated by default
            width: this._player.size,
            height: this._player.size,
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
                    onCollision(objHitbox, hb);
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
    handleEnemyCollisions(enemy, gameMap, prevPosition) {
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
                this.#resolveEnemyCollision(enemy, boundary, prevPosition);
                enemyHitbox.x = enemy.position.x - enemy.width / 2;
                enemyHitbox.y = enemy.position.y - enemy.height / 2;
            }
        }

        for (const objHitbox of gameMap.hitboxes) {
            if (enemyHitbox.collidesWith(objHitbox)) {
                this.#resolveEnemyCollision(enemy, objHitbox, prevPosition);
                enemyHitbox.x = enemy.position.x - enemy.width / 2;
                enemyHitbox.y = enemy.position.y - enemy.height / 2;
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
    #resolveEnemyCollision(enemy, obstacle, prevPosition) {
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
        enemy.position.y = prevPosition.y;
        testHitbox.x = enemy.position.x - enemy.width / 2;
        testHitbox.y = enemy.position.y - enemy.height / 2;

        if (testHitbox.collidesWith(obstacle)) {
            enemy.position.x = prevPosition.x;
            enemy.position.y = currY;
            testHitbox.x = enemy.position.x - enemy.width / 2;
            testHitbox.y = enemy.position.y - enemy.height / 2;

            if (testHitbox.collidesWith(obstacle)) {
                enemy.position.x = prevPosition.x;
                enemy.position.y = prevPosition.y;
            }
        }
    }
}
