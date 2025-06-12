import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";
import { get_spawn } from "@utils/apimanager.js";

import mapsSpriteSheet from "@assets/map.png";
import minimapsSpriteSheet from "@assets/minimap.png";
import logger from "@utils/logger.js";
import FloodHUD from "@/components/FloodHUD.js";

// Star field for background
const starField = {
    stars: [],
    nebulae: [],
    init(canvas) {
        // Generate stars
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                speed: Math.random() * 0.2 + 0.1
            });
        }
        // Generate nebulae
        for (let i = 0; i < 5; i++) {
            this.nebulae.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 200 + 100,
                color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`,
                speed: Math.random() * 0.1 + 0.05
            });
        }
    },
    update(dt) {
        this.stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > window.innerHeight) {
                star.y = 0;
                star.x = Math.random() * window.innerWidth;
            }
        });
        this.nebulae.forEach(nebula => {
            nebula.y += nebula.speed * dt;
            if (nebula.y > window.innerHeight + nebula.radius) {
                nebula.y = -nebula.radius;
                nebula.x = Math.random() * window.innerWidth;
            }
        });
    },
    draw(ctx) {
        // Clear with black space background
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw nebulae
        this.nebulae.forEach(nebula => {
            const gradient = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw stars
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
};

/**
 * Handles ability inputs and execution
 * @param {FloodPlayer||Player} player - The flood player
 * @param {Object} abilityKeys - Current state of ability keys
 * @param {Array} clones - Array of active clones
 * @param {Array} enemies - Array of enemies
 */
function handleAbilities(player, abilityKeys, clones, enemies) {
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
            case 'r':
                abilityKeys.restart = state;
                break;
        }
    }
}

export default function floodScreen() {


    const setup = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const gameId = localStorage.getItem("gameId");

            if (!token || !gameId) {
                logger.error("Missing authentication token or game ID");
                return;
            }

            logger.info("Fetching spawn position...");
            const spawnData = await get_spawn(gameId, "flood", token);

            if (!spawnData) {
                logger.error("Failed to get spawn position");
                spawnData = { x: 0, y: 0 };
            }

            logger.info("Spawn data received:", spawnData);

            const spawnPosition = new Vector(spawnData.x || 0, spawnData.y || 0);

            const game = new Engine({
              fps: 60,
              player: {
                  type: "flood",
                  size: 130,
                  position: spawnPosition || Vector.zero(),
                  walkSpeed: 21,
                  runSpeed: 60,
                  spawnPoint: spawnPosition || Vector.zero(),

              },
              map: {
                  spriteSheet: mapsSpriteSheet,
                  width: window.innerWidth,
                  height: window.innerHeight,
                  config: {
                      tiles_per_row: 2,
                      tile_size: 200,
                      chunk_size: 16,
                      n_loaded_chunks: 3,
                      debug: false,
                      debug_info: false
                  }
              },
              miniMap: {
                  spriteSheet: minimapsSpriteSheet,
                  width: 250,
                  height: 125,
                  config: {
                      tiles_per_row: 2,
                      tile_size: 6,
                      chunk_size: 16,
                      n_loaded_chunks: 2,
                      debug: false,
                      debug_info: false
                  }
              }
          });

            /** @type {FloodClone[]} */
            const clones = [];

            const abilityKeys = {
                evolve: false,
                clone: false,
                attack: false,
                restart: false
            };

            const map = document.getElementById("game");
            const minimap = document.getElementById("minimap");
            const start = document.getElementById("btn-continue")
            const back = document.getElementById("btn-back-to-play");
            const gameContainer = document.querySelector(`.${styles.container}`);
            const hud = new FloodHUD(gameContainer);

            game.init(map, minimap);
            starField.init(map);
            game.handleEnemySpawning = function (currentTime, gameMap) {
                const timeToSpawn = currentTime - this.enemyConfig.lastSpawnTime > this.enemyConfig.spawnInterval;
                const notReachMaxEnemies = this.enemies.length < this.enemyConfig.maxEnemies;

                if (timeToSpawn && notReachMaxEnemies) {
                    this.spawnRandomEnemy(gameMap, 'human');
                    this.enemyConfig.lastSpawnTime = currentTime;
                }
            };

            game.on("update", (dt) => {
                if (game.player.isDead) return;

                starField.update(dt);
                handleAbilities(game.player, abilityKeys, clones, game.enemies);

                if (abilityKeys.restart && game._gameState.isGameOver) {
                    game.respawnPlayer();
                    abilityKeys.restart = false;
                }

                for (let i = 0; i < clones.length; ++i) {
                    if (clones[i].isDead === true) {
                        clones.splice(i, 1);
                        continue;
                    }
                    if (clones[i] && clones[i].update) {
                        clones[i].update(dt, game.player, game.enemies);
                        if (clones[i].health <= 0) {
                            clones.splice(i, 1);
                        }
                    }
                }

                hud.update(game.player);
            });

            const originalMapDraw = game.map.draw;
            game.map.draw = function (ctx) {
                starField.draw(ctx);
                originalMapDraw.call(this, ctx);
            };

            game.on("render", (ctx) => {
                for (let clone of clones) {
                    if (clone && clone.draw) {
                        clone.draw(ctx);
                    }
                }
            });

            window.addEventListener('keydown', partialAbilities(true, abilityKeys));
            window.addEventListener('keyup', partialAbilities(false, abilityKeys));

            start?.addEventListener("click", () => {
                menu.style.display = "none";
                game.start();
            });

            back?.addEventListener("click", () => {
                game.stop();
                navigate("play");
            });

            game.start();

            const menu = document.getElementById("menu");
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    if (menu.style.display === "block") {
                        menu.style.display = "none";
                        game.start();
                    } else {
                        game.stop();
                        menu.style.display = "block";
                    }
                }
                if (e.key === "r" && game.player.isDead) {
                    game.respawnPlayer();
                }
            });

            document.addEventListener("click", (event) => {
                if (menu.style.display === "block" && !menu.contains(event.target)) {
                    event.preventDefault();
                    menu.style.display = "none";
                    game.start();
                }
            });

        } catch (error) {
            logger.error("Error setting up game with spawn position:", error);
        }
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <canvas class="${styles.map}" id="minimap"></canvas>  
          <div class="${styles.mapBg}"></div>
          
          <div class="${styles.menu}" id="menu">
            <div class="${styles.objectiveBlock}" style="margin-bottom: 18px; background: rgba(0,0,0,0.7); color: #fff; border-radius: 10px; padding: 14px 18px; font-size: 1.1rem; font-weight: bold; box-shadow: 0 2px 8px #000; text-align: center; letter-spacing: 0.5px;">
              <span class="${styles.controlsTitle}">Objective:</span><br>
              Find the fragment. Fight the next boss.
            </div>
            <div class="${styles.miniMenu}">
                <button id="btn-continue">Continue</button>
                <button id="btn-back-to-play">Back to menu</button>
            </div>
            <div class=${styles.controls}>
                <div class=${styles.controlsTitle}>CONTROLS</div>
                <div class=${styles.controlItem}>Movements: ↑ ↓ ← →</div>
                <div class=${styles.controlItem}>Run: Shift + Arrows</div>
                <div class=${styles.controlItem}>Clone: [C]</div>
                <div class=${styles.controlItem}>Evolve: [E]</div>
                <div class=${styles.controlItem}>Attack: [F]</div>
                <div class=${styles.controlItem}>Consume (+100 Health): [Q]</div>
            </div> 
          </div>
        </main>
   `];
}
