import { FloodPlayer } from "@engine/floodPlayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectMap } from "@engine/objectMap.jsx";
import MapSS from "@assets/map.png";
import styles from "@screens/styles/game.module.css";
import logger from "@utils/logger.js";

export default function floodScreen() {
    const setup = () => {
        const TARGET_FPS = 60;
        const MS_PER_UPDATE = 1000 / TARGET_FPS;

        const PLAYER_SIZE = 50;

        const game = document.getElementById("game");
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        const ctx = game.getContext("2d");
        logger.debug("Canvas initialized", { width: game.width, height: game.height });

        const gameMap = new ObjectMap(MapSS, game.width, game.height, {
            tiles_per_row: 1,
            tile_size: 32,
            chunk_size: 16,
            n_loaded_chunks: 2,
            debug: true,
            real_position: Vector.zero()
        });
        logger.debug("Game map initialized");

        const player = new FloodPlayer({
            position: new Vector(
                game.width / 2 - PLAYER_SIZE / 2,
                game.height / 2 - PLAYER_SIZE / 2
            ),
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            walkSpeed: 600,
            runSpeed: 1200
        });
        logger.debug("Flood player created", { position: player.position });

        // Arrays for managing game entities
        const clones = [];
        const enemies = [];

        // Input handling for abilities
        const abilityKeys = {
            evolve: false,
            clone: false,
            attack: false
        };

        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'e':
                    abilityKeys.evolve = true;
                    break;
                case 'c':
                    abilityKeys.clone = true;
                    break;
                case 'f':
                    abilityKeys.attack = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'e':
                    abilityKeys.evolve = false;
                    break;
                case 'c':
                    abilityKeys.clone = false;
                    break;
                case 'f':
                    abilityKeys.attack = false;
                    break;
            }
        });

        window.addEventListener('resize', () => {
            game.width = window.innerWidth;
            game.height = window.innerHeight;

            gameMap.viewPort.width = game.width;
            gameMap.viewPort.height = game.height;

            logger.debug("Canvas resized", { width: game.width, height: game.height });
        });

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

                // Update player movement
                player.update(dt);
                
                // Handle collisions
                handleCollisions(player, gameMap, prevPosition);
                
                // Handle abilities
                handleAbilities(player, abilityKeys, clones, enemies);
                
                // Update clones
                clones.forEach((clone, index) => {
                    if (clone && clone.update) {
                        clone.update(dt, player, enemies);
                        
                        // Remove dead clones
                        if (clone.health <= 0) {
                            clones.splice(index, 1);
                        }
                    }
                });

                // Update map with real position
                gameMap.update(player.real_position, MS_PER_UPDATE);

                gameLoop.lag -= MS_PER_UPDATE;
            }

            // Rendering
            ctx.clearRect(0, 0, game.width, game.height);
            gameMap.draw(ctx);
            player.draw(ctx);
            
            // Draw clones
            clones.forEach(clone => {
                if (clone && clone.draw) {
                    clone.draw(ctx);
                }
            });

            // Draw UI information
            drawUI(ctx, player, clones, enemies);

            requestAnimationFrame(gameLoop);
        }

        /**
         * Handles collision detection and resolution between player and map
         * @param {FloodPlayer} player - The player to check collisions for
         * @param {ObjectMap} gameMap - The game map with hitboxes
         * @param {Vector} prevPosition - Player's position before movement
         */
        function handleCollisions(player, gameMap, prevPosition) {
            for (const boundary of gameMap.boundaries) {
                if (player.hitbox.collidesWith(boundary)) {
                    resolveCollision(player, boundary, prevPosition);
                }
            }

            for (const hitbox of gameMap.hitboxes) {
                if (hitbox.isPhysical && player.hitbox.collidesWith(hitbox)) {
                    resolveCollision(player, hitbox, prevPosition);
                }
            }
        }

        /**
         * Resolves collision by adjusting player position
         * @param {FloodPlayer} player - The player object
         * @param {Hitbox} obstacle - The hitbox player collided with
         * @param {Vector} prevPosition - Player's position before collision
         */
        function resolveCollision(player, obstacle, prevPosition) {
            const currX = player.real_position.x;
            const currY = player.real_position.y;

            player.real_position.x = currX;
            player.real_position.y = prevPosition.y;

            if (player.hitbox.collidesWith(obstacle)) {
                player.real_position.x = prevPosition.x;
                player.real_position.y = currY;

                if (player.hitbox.collidesWith(obstacle)) {
                    player.real_position.x = prevPosition.x;
                    player.real_position.y = prevPosition.y;
                }
            }

            // Keep player visually centered on screen
            player.position.x = game.width / 2 - PLAYER_SIZE / 2;
            player.position.y = game.height / 2 - PLAYER_SIZE / 2;
        }

        /**
         * Handles ability inputs and execution
         * @param {FloodPlayer} player - The flood player
         * @param {Object} abilityKeys - Current state of ability keys
         * @param {Array} clones - Array of active clones
         * @param {Array} enemies - Array of enemies
         */
        function handleAbilities(player, abilityKeys, clones, enemies) {
            // Evolution ability
            if (abilityKeys.evolve) {
                player.evolve();
                abilityKeys.evolve = false; // Prevent continuous evolution
            }

            // Clone creation ability
            if (abilityKeys.clone) {
                const clone = player.createClone();
                if (clone) {
                    clones.push(clone);
                    logger.debug("Clone created", { totalClones: clones.length });
                }
                abilityKeys.clone = false; // Prevent continuous cloning
            }

            // Attack ability
            if (abilityKeys.attack) {
                const nearestEnemy = findNearestEnemy(player, enemies);
                if (nearestEnemy && nearestEnemy.distance < 100) {
                    player.attack("melee", nearestEnemy.enemy);
                }
                abilityKeys.attack = false; // Prevent continuous attacking
            }
        }

        /**
         * Finds the nearest enemy to the player
         * @param {FloodPlayer} player - The flood player
         * @param {Array} enemies - Array of enemies
         * @returns {Object|null} Object with enemy and distance, or null if no enemies
         */
        function findNearestEnemy(player, enemies) {
            if (enemies.length === 0) return null;

            return enemies.reduce((nearest, enemy) => {
                const dx = enemy.position.x - player.real_position.x;
                const dy = enemy.position.y - player.real_position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (!nearest || distance < nearest.distance) {
                    return { enemy, distance };
                }
                return nearest;
            }, null);
        }

        /**
         * Draws UI information on the screen
         * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
         * @param {FloodPlayer} player - The flood player
         * @param {Array} clones - Array of active clones
         * @param {Array} enemies - Array of enemies
         */
        function drawUI(ctx, player, clones, enemies) {
            ctx.font = "16px monospace";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;

            const uiTexts = [
                `Biomass: ${player.biomass}`,
                `Evolution: ${player.evolution}`,
                `${player.isRunning ? "Running" : "Walking"}`,
                `Clones: ${clones.length}`,
                `Enemies: ${enemies.length}`
            ];

            uiTexts.forEach((text, index) => {
                const y = 30 + (index * 25);
                ctx.strokeText(text, 20, y);
                ctx.fillText(text, 20, y);
            });
        }

        requestAnimationFrame(gameLoop);
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <div>
            <h3 class="${styles.containerH3}">CONTROLS</h3>
            <ul class="${styles.containerUl}">
                <li>MOVE: WASD or Arrow Keys</li>
                <li>RUN: Hold Shift</li>
                <li>EVOLVE: E</li>
                <li>CREATE CLONE: C</li>
                <li>ATTACK: F</li>
            </ul>
          </div>
        </main>
   `];
}