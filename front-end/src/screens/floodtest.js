import { FloodPlayer } from "@engine/floodPlayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectMap } from "@engine/objectMap.js";
import { Enemy } from "@engine/enemy.js";
import MapSS from "@assets/map.png";
import styles from "@screens/styles/game.module.css";
import FloodHUD from "../components/FloodHUD.js";
import logger from "@utils/logger.js";

export default function floodScreen() {
    const setup = () => {
        const TARGET_FPS = 60;
        const MS_PER_UPDATE = 1000 / TARGET_FPS;
        const PLAYER_SIZE = 50;

        // Initialize game container first
        const gameContainer = document.querySelector(`.${styles.container}`);
        if (!gameContainer) {
            logger.error("Game container not found!");
            return;
        }
        logger.debug("Game container found");

        const game = document.getElementById("game");
        if (!game) {
            logger.error("Game canvas not found!");
            return;
        }
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        const ctx = game.getContext("2d");
        logger.debug("Canvas initialized", { width: game.width, height: game.height });

        // Initialize game map
        const gameMap = new ObjectMap(MapSS, game.width, game.height, {
            tiles_per_row: 1,
            tile_size: 32,
            chunk_size: 16,
            n_loaded_chunks: 2,
            debug: true,
            real_position: Vector.zero()
        });
        logger.debug("Game map initialized");

        // Create player in center of screen
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

        // Initialize HUD
        const hud = new FloodHUD(gameContainer);
        logger.debug("HUD initialized");

        // Arrays for managing game entities
        const clones = [];
        const enemies = [];

        // Enemy spawning configuration
        const enemyConfig = {
            spawnRadius: 500, // How far from player to spawn enemies
            maxEnemies: 10, // Maximum enemies on screen
            spawnInterval: 3000, // Milliseconds between spawns
            lastSpawnTime: 0,
            enemySettings: {
                width: 32,
                height: 32,
                health: 100,
                speed: 150,
                damage: 10,
                chaseRadius: 200,
                attackRadius: 40,
                retreatHealthThreshold: 30,
                retreatDistance: 100
            }
        };

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

        /**
         * Generates random waypoints around a center position
         * @param {Vector} center - Center position
         * @param {number} count - Number of waypoints
         * @param {number} radius - Patrol radius
         * @returns {Array<Vector>} Array of waypoint positions
         */
        function generateRandomWaypoints(center, count, radius) {
            const waypoints = [];
            
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5; // Add some randomness
                const distance = radius * (0.5 + Math.random() * 0.5); // Random distance within radius
                
                const x = center.x + Math.cos(angle) * distance;
                const y = center.y + Math.sin(angle) * distance;
                waypoints.push(new Vector(x, y));
            }
            
            return waypoints;
        }

        /**
         * Spawns a random enemy around the player
         * @param {FloodPlayer} player - The flood player
         * @param {Array} enemies - Array of current enemies
         * @param {Object} config - Enemy configuration
         * @param {ObjectMap} gameMap - The game map
         */
        function spawnRandomEnemy(player, enemies, config, gameMap) {
            // Generate random position around player (but not too close)
            const angle = Math.random() * Math.PI * 2;
            const distance = config.spawnRadius + Math.random() * 200; // Some variation in distance
            
            const spawnX = player.real_position.x + Math.cos(angle) * distance;
            const spawnY = player.real_position.y + Math.sin(angle) * distance;
            const spawnPosition = new Vector(spawnX, spawnY);
            
            // Generate random patrol waypoints around spawn point
            const waypoints = generateRandomWaypoints(spawnPosition, 3, 80);
            
            // Ensure homePoint is a Vector instance
            const homePoint = new Vector(spawnPosition.x, spawnPosition.y);
            
            const enemy = new Enemy({
                position: spawnPosition,
                waypoints: waypoints,
                homePoint: homePoint,
                tileGrid: gameMap,
                obstacles: gameMap.hitboxes || [],
                ...config.enemySettings
            });

            enemies.push(enemy);
            logger.debug("Random enemy spawned", { 
                position: spawnPosition, 
                totalEnemies: enemies.length 
            });
        }

        /**
         * Handles random enemy spawning around the player
         * @param {number} currentTime - Current game time
         * @param {FloodPlayer} player - The flood player
         * @param {Array} enemies - Array of current enemies
         * @param {Object} config - Enemy configuration
         * @param {ObjectMap} gameMap - The game map
         */
        function handleEnemySpawning(currentTime, player, enemies, config, gameMap) {
            // Check if it's time to spawn and we haven't reached max enemies
            if (currentTime - config.lastSpawnTime > config.spawnInterval && 
                enemies.length < config.maxEnemies) {
                
                spawnRandomEnemy(player, enemies, config, gameMap);
                config.lastSpawnTime = currentTime;
            }
        }

        /**
         * Updates all enemies and removes dead ones
         * @param {number} dt - Delta time
         * @param {FloodPlayer} player - The flood player
         * @param {Array} enemies - Array of enemies
         */
        function updateEnemies(dt, player, enemies) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                if (enemy && enemy.update) {
                    enemy.update(dt, player);
                    
                    // Remove dead enemies
                    if (enemy.health <= 0) {
                        logger.debug("Enemy defeated", { remainingEnemies: enemies.length - 1 });
                        enemies.splice(i, 1);
                        
                        // Give player biomass for killing enemy
                        player.biomass += 15;
                        logger.debug(`Player gained biomass! Total: ${player.biomass}`);
                    }
                }
            }
        }

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
                handleAbilities(player, abilityKeys, clones, enemies);
                
                // Handle random enemy spawning
                handleEnemySpawning(currentTime, player, enemies, enemyConfig, gameMap);
                
                // Update enemies
                updateEnemies(dt, player, enemies);
                
                // Update clones
                clones.forEach((clone, index) => {
                    if (clone && clone.update) {
                        clone.update(dt, player, enemies);
                        if (clone.health <= 0) {
                            clones.splice(index, 1);
                        }
                    }
                });

                gameMap.update(player.real_position, MS_PER_UPDATE);
                hud.update(player);

                gameLoop.lag -= MS_PER_UPDATE;
            }

            // Rendering
            ctx.clearRect(0, 0, game.width, game.height);
            gameMap.draw(ctx);
            player.draw(ctx);
            
            // Draw enemies
            enemies.forEach(enemy => {
                if (enemy && enemy.draw) {

                    // Calculate enemy position relative to camera/viewport
                    const enemyScreenX = enemy.position.x - player.real_position.x + (game.width / 2);
                    const enemyScreenY = enemy.position.y - player.real_position.y + (game.height / 2);

                    // Only draw if enemy is visible on screen
                    if (enemyScreenX >= -enemy.width && enemyScreenX <= game.width + enemy.width &&
                        enemyScreenY >= -enemy.height && enemyScreenY <= game.height + enemy.height) {

                        // Draw health bar
                        const healthBarWidth = enemy.width;
                        const healthBarHeight = 5;
                        const healthPercentage = enemy.health / enemy.maxHealth;

                        // Draw debug info
                        ctx.fillStyle = "white";
                        ctx.font = "12px Arial";
                        ctx.fillText(`Enemy: ${enemy.health}/${enemy.maxHealth}`, enemyScreenX + 10, enemyScreenY + 10);

                        enemy.drawAtPosition(ctx, enemyScreenX, enemyScreenY);
                    }
                }
            });
            
            // Draw clones
            clones.forEach(clone => {
                if (clone && clone.draw) {
                    clone.draw(ctx);
                }
            });

            // Draw debug info
            ctx.font = "16px monospace";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;


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

        // Start the game loop
        requestAnimationFrame(gameLoop);
    };

    return [setup, `
        <main class="${styles.container}">
            <canvas id="game"></canvas>
        </main>
    `];
}