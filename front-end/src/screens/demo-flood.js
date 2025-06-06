import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import minimapsSpriteSheet from "@assets/minimap.png";
import logger from "@utils/logger.js";
import FloodHUD from "@/components/FloodHUD.js";


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

    const game = new Engine({
        fps: 60,
        player: {
            type: "flood",
            size: 130,
            position: Vector.zero(),
            walkSpeed: 100,
            runSpeed: 1000,

        },
        map: {
            spriteSheet: mapsSpriteSheet,
            width: window.innerWidth,
            height: window.innerHeight,
            config: {
                tiles_per_row: 2,
                tile_size: 200,
                chunk_size: 16,
                n_loaded_chunks: 5,
                debug: false,
                debug_info: true
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
                n_loaded_chunks: 5,
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


    const setup = () => {
        const map = document.getElementById("game");
        const minimap = document.getElementById("minimap");

        const start = document.getElementById("btn-continue")
        const back = document.getElementById("btn-back-to-play");

        const gameContainer = document.querySelector(`.${styles.container}`);
        const hud = new FloodHUD(gameContainer);

        game.init(map, minimap);

        game.on("update", (dt) => {
            if (game.player.isDead) return;

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
        })
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <canvas class="${styles.map}" id="minimap"></canvas>  
          <div class="${styles.mapBg}"></div>
          
          <div class="${styles.menu}" id="menu">
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
                <div class=${styles.controlItem}>Consume (+80 Health): [Q]</div>
            </div> 
          </div>

          

        </main>
   `];
}
