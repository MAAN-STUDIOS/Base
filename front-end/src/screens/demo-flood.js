import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import logger from "@utils/logger.js";
import FloodHUD from "@/components/FloodHUD.js";


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
                debug_info: false
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

    const clones = [];
    const enemies = [];
    const abilityKeys = {
        evolve: false,
        clone: false,
        attack: false
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

        game.on("update", (dt) => {
            handleAbilities(game.player, abilityKeys, clones, enemies);
            clones.forEach((clone, index) => {
                if (clone && clone.update) {
                    clone.update(dt, game.player, enemies);
                    if (clone.health <= 0) {
                        clones.splice(index, 1);
                    }
                }
            });
        });

        game.on("render",(ctx) => {
            clones.forEach(clone => {
                if (clone && clone.draw) {
                    clone.draw(ctx);
                }
            });
            hud.update(game.player);
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
