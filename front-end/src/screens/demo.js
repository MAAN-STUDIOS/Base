import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import { ShootingSystem } from "@engine/shootingsystem.js";
import minimapsSpriteSheet from "@assets/minimap.png";


export default function humanScreen() {
    const game = new Engine({
        fps: 60,
        player: {
            type: "human",
            size: 150,
            position: Vector.zero(),
            walkSpeed: 20,
            runSpeed: 40
        },
        map: {
            spriteSheet: mapsSpriteSheet,
            width: window.innerWidth,
            height: window.innerHeight,
            config: {
                tiles_per_row: 4,
                tile_size: 200,
                chunk_size: 16,
                n_loaded_chunks: 5,
                debug: true,
                debug_info: false
            }
        },
        miniMap: {
            spriteSheet: minimapsSpriteSheet,
            width: 250,
            height: 125,
            config: {
                tiles_per_row: 4,
                tile_size: 6,
                chunk_size: 16,
                n_loaded_chunks: 5,
                debug: false,
                debug_info: false
            }
        },
        HUD: {
            width: 1152,
            height: 864
        }
    });

    const setup = async () => {
        const map = document.getElementById("game");
        const minimap = document.getElementById("minimap");

        const start = document.getElementById("btn-continue")
        const back = document.getElementById("btn-back-to-play");

        game.init(map, minimap);

        game.on("playerDeath", () => {
            game.enemies.length = 0;
        });

        game.on("update", (dt) => {
            if (game.player.isDead) return;

            ShootingSystem.updateAll(dt);
        });

        game.on("render", (ctx) => {
            ShootingSystem.drawAll(ctx);
        });

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
            <div class="${styles.controls}">
                <div class="${styles.controlsTitle}">CONTROLS</div>
                <div class="${styles.controlItem}">Move: ↑ ↓ ← → / WASD</div>
                <div class="${styles.controlItem}">Run: Shift + Flechas / WASD</div>
                <div class="${styles.controlItem}">Attack: Mouse Aim + [F] / [SPACE] / [Left click]</div>
                <div class="${styles.controlItem}">Switch Weapon: [1, 2, 3, 4]</div>
            </div> 
          </div>
        </main>
   `];
}
