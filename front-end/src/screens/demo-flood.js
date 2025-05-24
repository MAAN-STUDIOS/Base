import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import logger from "@utils/logger.js";
import FloodHUD from "@/components/FloodHUD.js";
import { Enemy } from "@engine/enemy.js";


/**
 * Handles ability inputs and execution
 * @param {FloodPlayer||Player} player - The flood player
 * @param {Object} abilityKeys - Current state of ability keys
 * @param {Array} clones - Array of active clones
 * @param {Array} enemies - Array of enemies
 */
function handleAbilities(player, abilityKeys, clones, enemies) {
    // Evolution ability
    if (abilityKeys.evolve) {
        player.evolve();
        abilityKeys.evolve = false;
    }

    if (abilityKeys.clone) {
        const clone = player.createClone();
        if (clone) {
            clones.push(clone);
            logger.debug("Clone created", { totalClones: clones.length });
        }
        abilityKeys.clone = false;
    }

    if (abilityKeys.attack) {
        const nearestEnemy = findNearestEnemy(player, enemies);
        if (nearestEnemy && nearestEnemy.distance < 100) {
            player.attack("melee", nearestEnemy.enemy);
        }
        abilityKeys.attack = false;
    }
}

/**
 * Finds the nearest enemy to the player
 * @param {FloodPlayer||Player} player - The flood player
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
 * @param {FloodPlayer||Player} player - The flood player
 * @param {Array} enemies - Array of enemies
 */
function updateEnemies(dt, player, enemies) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy && enemy.update) {
            enemy.update(dt, player);

            if (enemy.health <= 0) {
                logger.debug("Enemy defeated", { remainingEnemies: enemies.length - 1 });
                enemies.splice(i, 1);

                player.biomass += 15;
                logger.debug(`Player gained biomass! Total: ${player.biomass}`);
            }
        }
    }
}

function partialAbilities(state, abilityKeys) {
    return (e) => {
        switch (e.key.toLowerCase()) {
            case 'e':
                abilityKeys.evolve = state;
                break;
            case 'c':
                abilityKeys.clone = state;
                break;
            case 'f':
                abilityKeys.attack = state;
                break;
        }
    }
}

export default function floodScreen() {
    const game = new Engine({
        fps: 60,
        player: {
            type: "flood",
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

    /** @type {FloodClone[]} */
    const clones = [];

    /** @type {Enemy[]} */
    const enemies = [];

    const abilityKeys = {
        evolve: false,
        clone: false,
        attack: false
    };

    const enemyConfig = {
        spawnRadius: 500, // How far from player to spawn enemies
        maxEnemies: 2, // Maximum enemies on screen
        spawnInterval: 3000, // Milliseconds between spawns
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

    const setup = () => {
        const map = document.getElementById("game");
        const minimap = document.getElementById("minimap");

        const start = document.getElementById("btn-continue")
        const stop = document.getElementById("btn-stop");
        const back = document.getElementById("btn-back-to-play");

        const gameContainer = document.querySelector(`.${styles.container}`);
        const hud = new FloodHUD(gameContainer);

        game.init(map, minimap);

        game.on("update", (dt, currentTime) => {
            handleAbilities(game.player, abilityKeys, clones, enemies);

            handleEnemySpawning(currentTime, game.player, enemies, enemyConfig, game.map);
            updateEnemies(dt, game.player, enemies);

            for (let i = 0; i < clones.length; ++i) {
                if (clones[i] && clones[i].update) {
                    clones[i].update(dt, game.player, enemies);
                    if (clones[i].health <= 0) {
                        clones.splice(i, 1);
                    }
                }
            }

            hud.update(game.player);
        });

        game.on("render", (ctx) => {
            for (let enemy of enemies) {
                if (enemy && enemy.draw) {

                    const enemyScreenX = enemy.position.x - game.player.real_position.x + (game.map.camaraWidth / 2);
                    const enemyScreenY = enemy.position.y - game.player.real_position.y + (game.map.camaraHeight / 2);

                    if (enemyScreenX >= -enemy.width && enemyScreenX <= game.map.camaraWidth + enemy.width &&
                        enemyScreenY >= -enemy.height && enemyScreenY <= game.map.camaraHeight + enemy.height) {

                        // const healthBarWidth = enemy.width;
                        // const healthBarHeight = 5;
                        // const healthPercentage = enemy.health / enemy.maxHealth;

                        ctx.fillStyle = "white";
                        ctx.font = "12px Arial";
                        ctx.fillText(`Enemy: ${enemy.health}/${enemy.maxHealth}`, enemyScreenX + 10, enemyScreenY + 10);

                        enemy.drawAtPosition(ctx, enemyScreenX, enemyScreenY);
                    }
                }
            }

            for (let clone of clones) {
                if (clone && clone.draw) {
                    clone.draw(ctx);
                }
            }
        });

        window.addEventListener('keydown', partialAbilities(true, abilityKeys));
        window.addEventListener('keyup', partialAbilities(false, abilityKeys));

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
        </main>
   `];
}
