import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import logger from "@utils/logger.js";
import { Enemy } from "@engine/enemy.js";
import { ShootingSystem } from "@engine/shootingsystem.js";


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
 * @param {FloodPlayer} player - The flood player
 * @param {Array} enemies - Array of current enemies
 * @param {Object} config - Enemy configuration
 * @param {ObjectMap} gameMap - The game map
 */
function spawnRandomEnemy(player, enemies, config, gameMap) {
    const angle = Math.random() * Math.PI * 2;
    const distance = config.spawnRadius + Math.random() * 200;

    const spawnX = player.real_position.x + Math.cos(angle) * distance;
    const spawnY = player.real_position.y + Math.sin(angle) * distance;
    const spawnPosition = new Vector(spawnX, spawnY);

    const waypoints = generateRandomWaypoints(spawnPosition, 3, 80);
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
 * @param {FloodPlayer||Player} player - The flood player
 * @param {Array} enemies - Array of current enemies
 * @param {Object} config - Enemy configuration
 * @param {ObjectMap} gameMap - The game map
 */
function handleEnemySpawning(currentTime, player, enemies, config, gameMap) {
    const timeToSpawn = currentTime - config.lastSpawnTime > config.spawnInterval;
    const notReachMaxEnemies = enemies.length < config.maxEnemies;

    if (timeToSpawn && notReachMaxEnemies) {
        spawnRandomEnemy(player, enemies, config, gameMap);
        config.lastSpawnTime = currentTime;
    }
}


/**
 * Updates all enemies and removes dead ones
 * @param {number} dt - Delta time
 * @param {FloodPlayer||Player||HumanPlayer} player - The flood player
 * @param {Array} enemies - Array of enemies
 * @param gameEngine
 */
function updateEnemies(dt, player, enemies, gameEngine) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy && enemy.update) {
            enemy.update(dt, player);
            gameEngine.handleEnemyCollisions(enemy, gameEngine.map);

            if (enemy.health <= 0) {
                logger.debug("Enemy defeated", { remainingEnemies: enemies.length - 1 });
                enemies.splice(i, 1);

                logger.debug(`Player gained biomass! Total: ${player.biomass}`);
            }
        }
    }
}

function showDeathScreen(ctx, timeLeft) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;


    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "red";
    ctx.font = "48px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("YOU DIED", canvasWidth / 2, canvasHeight / 2 - 50);


    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P', monospace";
    ctx.fillText(`Respawning in ${Math.ceil(timeLeft / 1000)}s`,
        canvasWidth / 2, canvasHeight / 2 + 20);


    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText("Press R to restart immediately",
        canvasWidth / 2, canvasHeight / 2 + 60);

    ctx.textAlign = "left";
}


export default function humanScreen() {
    const game = new Engine({
        fps: 60,
        player: {
            type: "human",
            size: 50,
            position: Vector.zero()
        },
        map: {
            spriteSheet: mapsSpriteSheet,
            width: window.innerWidth,
            height: window.innerHeight,
            config: {
                tiles_per_row: 1,
                tile_size: 200,
                chunk_size: 16,
                n_loaded_chunks: 5,
                debug: true,
                debug_info: true
            }
        },
        miniMap: {
            spriteSheet: mapsSpriteSheet,
            width: 250,
            height: 125,
            config: {
                tiles_per_row: 1,
                tile_size: 6,
                chunk_size: 16,
                n_loaded_chunks: 5,
                debug: true,
                debug_info: false
            }
        }
    });

    /** @type {Enemy[]} */
    const enemies = [];

    const enemyConfig = {
        spawnRadius: 500,
        maxEnemies: 10,
        spawnInterval: 3000,
        lastSpawnTime: 0,
        enemySettings: {
            width: 32,
            height: 32,
            health: 100,
            speed: 6,
            damage: 10,
            chaseRadius: 200,
            attackRadius: 40,
            retreatHealthThreshold: 30,
            retreatDistance: 100
        }
    };

    const gameState = {
        isGameOver: false,
        respawnTime: 0,
        deathScreenShown: false
    };

    const setup = () => {
        const map = document.getElementById("game");
        const minimap = document.getElementById("minimap");

        const start = document.getElementById("btn-continue")
        const stop = document.getElementById("btn-stop");
        const back = document.getElementById("btn-back-to-play");

        function handlePlayerDeath(currentTime) {
            if (!game.player.isDead) return false;

            if (!gameState.isGameOver) {
                gameState.isGameOver = true;
                gameState.respawnTime = currentTime + 3000;

                enemies.splice(0, Math.floor(enemies.length / 2));
            }

            if (currentTime >= gameState.respawnTime) {
                respawnPlayer();
                return false;
            }

            return true;
        }

        function respawnPlayer() {
            // Reset player state
            game.player.isDead = false;
            game.player.health = game.player.maxHealth;
            game.player.real_position = new Vector(0, 0);
            game.player.position = new Vector(0, 0);

            gameState.isGameOver = false;
            gameState.deathScreenShown = false;

            logger.debug("Player respawned!");
        }

        game.init(map, minimap);

        game.on("update", (dt, currentTime) => {
            const playerIsDead = handlePlayerDeath(currentTime);
            if (playerIsDead) {
                updateEnemies(dt * 0.5, game.player, enemies, game);
                return;
            }

            ShootingSystem.updateAll(dt)

            handleEnemySpawning(currentTime, game.player, enemies, enemyConfig, game.map);
            updateEnemies(dt, game.player, enemies, game);
        });

        game.on("render", (ctx) => {
            for (let enemy of enemies) {
                if (enemy && enemy.draw) {
                    const enemyScreenX = enemy.position.x - game.player.real_position.x + (game.map.camaraWidth / 2);
                    const enemyScreenY = enemy.position.y - game.player.real_position.y + (game.map.camaraHeight / 2);

                    const visibleEnemy = (
                        enemyScreenX >= -enemy.width &&
                        enemyScreenX <= game.map.camaraWidth + enemy.width &&
                        enemyScreenY >= -enemy.height &&
                        enemyScreenY <= game.map.camaraHeight + enemy.height
                    );
                    if (visibleEnemy) {
                        ctx.fillStyle = "white";
                        ctx.font = "12px Arial";
                        ctx.fillText(`Enemy: ${enemy.health}/${enemy.maxHealth}`, enemyScreenX + 10, enemyScreenY + 10);

                        enemy.drawAtPosition(ctx, enemyScreenX, enemyScreenY);
                    }
                }
            }

            if (gameState.isGameOver) {
                const timeLeft = gameState.respawnTime - performance.now();
                showDeathScreen(ctx, Math.max(0, timeLeft));
            }

            ShootingSystem.drawAll(ctx);
        });

        stop?.addEventListener("click", () => game.stop());
        start?.addEventListener("click", () => game.start());
        back?.addEventListener("click", () => {
            game.stop();
            navigate("play");
        });

        game.start();
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <canvas class="${styles.map}" id="minimap"></canvas>  
          <div class="${styles.mapBg}"></div>
          
          <div class="${styles.miniMenu}">
            <button id="btn-stop">Stop</button>
            <button id="btn-continue">Continue</button>
            <button id="btn-back-to-play">Back to Play</button>
          </div>
          <div class=${styles.controls}>
            <div class=${styles.controlsTitle}>CONTROLS</div>
            <div class=${styles.controlItem}>Move: ↑ ↓ ← → / WASD</div>
            <div class=${styles.controlItem}>Run: Shift + Flechas / WASD</div>
            <div class=${styles.controlItem}>Attack: [F] / [ ]</div>
          </div> 
        </main>
   `];
}
