import { HumanPlayer } from "@engine/humanPlayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectMap } from "@engine/objectMap.js";
import MapSS from "@assets/map.png";
import styles from "@screens/styles/game.module.css";
import logger from "@utils/logger.js";

/** @type string */
import HUD from "@assets/HUD/HUD.png"


export default function humanScreen() {
    const setup = () => {
        const TARGET_FPS = 60;
        const MS_PER_UPDATE = 1000 / TARGET_FPS;
        const PLAYER_SIZE = 50;

        const hud = new Image();
        hud.src = HUD;

        const game = document.getElementById("game");
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        const ctx = game.getContext("2d");
        logger.debug("Canvas initialized", { width: game.width, height: game.height });

        const minimap = document.getElementById("minimap");
        minimap.width = 250;
        minimap.height = 125;
        const minimapCtx = minimap.getContext("2d");
        logger.debug("Mini map initialized", { width: minimap.width, height: minimap.height });

        const player = new HumanPlayer(
            Vector.zero(), // Start at world origin
            PLAYER_SIZE, PLAYER_SIZE, {
                walkSpeed: 600,
                runSpeed: 1200
            }
        );
        logger.debug("Human player created", { position: player.real_position });

        const gameMap = new ObjectMap(MapSS, game.width, game.height, {
            tiles_per_row: 1,
            tile_size: 200,
            chunk_size: 16,
            n_loaded_chunks: 5,
            debug: true,
            debug_info: true,
            real_position: player.real_position.clone(),
            scale: 1
        });
        
        const gameMiniMap = new ObjectMap(MapSS, minimap.width, minimap.height, {
            tiles_per_row: 1,
            tile_size: 6,
            chunk_size: 16,
            n_loaded_chunks: 5,
            debug: true,
            debug_info: false,
            real_position: player.real_position.clone(),
            scale: 1
        });
        logger.debug("Game map initialized");

        window.addEventListener('resize', () => {
            game.width = window.innerWidth;
            game.height = window.innerHeight;

            gameMap.viewPort.width = game.width;
            gameMap.viewPort.height = game.height;

            logger.debug("Canvas resized", { width: game.width, height: game.height });
        });
        const sizeRatio =  gameMiniMap.tile_size/gameMap.tile_size;

        function gameLoop(currentTime) {
            if (!gameLoop.previousTime) {
                gameLoop.previousTime = currentTime;
                gameLoop.lag = 0;
            }

            const elapsed = currentTime - gameLoop.previousTime;
            gameLoop.previousTime = currentTime;
            gameLoop.lag += elapsed;

            while (gameLoop.lag >= MS_PER_UPDATE) {
                const dt = MS_PER_UPDATE / 1000;

                const prevPosition = player.real_position.clone();

                player.update(dt);
                
                handleCollisions(player, gameMap, prevPosition);
                
                gameMap.update(player.real_position, MS_PER_UPDATE);
                gameMiniMap.update(player.real_position.scale(sizeRatio), MS_PER_UPDATE);

                gameLoop.lag -= MS_PER_UPDATE;
            }

            ctx.clearRect(0, 0, game.width, game.height);
            minimapCtx.clearRect(0, 0, minimap.width, minimap.height);

            gameMap.draw(ctx);
            
            ctx.save();
            const screenCenterX = game.width / 2;
            const screenCenterY = game.height / 2;
            
            ctx.fillStyle = player.color;
            ctx.fillRect(
                screenCenterX - PLAYER_SIZE / 2,
                screenCenterY - PLAYER_SIZE / 2,
                PLAYER_SIZE,
                PLAYER_SIZE
            );
            
            ctx.font = "16px monospace";
            ctx.fillStyle = "white";
            ctx.fillText(
                `${player.isRunning ? "Running" : "Walking"}`, 
                screenCenterX, 
                screenCenterY - PLAYER_SIZE / 2 - 5
            );
            ctx.restore();

            ctx.drawImage(
                hud,
                0, 0,
                2304, 1728,
                0, 0,
                game.width, game.height
            )

            gameMiniMap.draw(minimapCtx, 1.8);

            const minimapPlayerSize = 4;
            minimapCtx.fillStyle = "#0048ff";
            minimapCtx.beginPath();
            minimapCtx.arc(
                minimap.width / 2,
                minimap.height / 2,
                minimapPlayerSize,
                0,
                Math.PI * 2
            );
            minimapCtx.fill();

            minimapCtx.strokeStyle = "rgba(96,94,94,0.24)";
            minimapCtx.lineWidth = 2;
            minimapCtx.strokeRect(0, 0, minimap.width, minimap.height);

            requestAnimationFrame(gameLoop);
        }

        /**
         * Handles collision detection and resolution between player and map
         * @param {HumanPlayer} player - The player to check collisions for
         * @param {ObjectMap} gameMap - The game map with hitboxes
         * @param {Vector} prevPosition - Player's position before movement
         */
        function handleCollisions(player, gameMap, prevPosition) {
            const playerHitbox = {
                x: player.real_position.x - PLAYER_SIZE / 2,
                y: player.real_position.y - PLAYER_SIZE / 2,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                collidesWith: function(other) {
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
                    resolveCollision(player, boundary, prevPosition);
                    playerHitbox.x = player.real_position.x - PLAYER_SIZE / 2;
                    playerHitbox.y = player.real_position.y - PLAYER_SIZE / 2;
                }
            }

            for (const hitbox of gameMap.hitboxes) {
                if (hitbox.isPhysical && playerHitbox.collidesWith(hitbox)) {
                    resolveCollision(player, hitbox, prevPosition);
                    playerHitbox.x = player.real_position.x - PLAYER_SIZE / 2;
                    playerHitbox.y = player.real_position.y - PLAYER_SIZE / 2;
                }
            }
        }

        /**
         * Resolves collision by adjusting player position
         * @param {HumanPlayer} player - The player object
         * @param {Hitbox} obstacle - The hitbox player collided with
         * @param {Vector} prevPosition - Player's position before collision
         */
        function resolveCollision(player, obstacle, prevPosition) {
            const currX = player.real_position.x;
            const currY = player.real_position.y;

            const testHitbox = {
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                collidesWith: function(other) {
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
            testHitbox.x = player.real_position.x - PLAYER_SIZE / 2;
            testHitbox.y = player.real_position.y - PLAYER_SIZE / 2;

            if (testHitbox.collidesWith(obstacle)) {
                player.real_position.x = prevPosition.x;
                player.real_position.y = currY;
                testHitbox.x = player.real_position.x - PLAYER_SIZE / 2;
                testHitbox.y = player.real_position.y - PLAYER_SIZE / 2;

                if (testHitbox.collidesWith(obstacle)) {
                    player.real_position.x = prevPosition.x;
                    player.real_position.y = prevPosition.y;
                }
            }

            player.position = player.real_position.clone();
        }

        requestAnimationFrame(gameLoop);
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <canvas class="${styles.map}" id="minimap"></canvas>  
          <canvas class="${styles.mapBg}"></canvas>
        </main>
   `];
}