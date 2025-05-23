import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";


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

    const setup = () => {
        const map = document.getElementById("game");
        const minimap = document.getElementById("minimap");

        const start = document.getElementById("btn-continue")
        const stop = document.getElementById("btn-stop");
        const back = document.getElementById("btn-back-to-play");

        game.init(map, minimap);

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
