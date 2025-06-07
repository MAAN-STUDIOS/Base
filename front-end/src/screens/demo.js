import { Vector } from "@utils/vector.js";
import { Engine } from "@engine";
import styles from "@screens/styles/game.module.css";

import mapsSpriteSheet from "@assets/map.png";
import { ShootingSystem } from "@engine/shootingsystem.js";
import minimapsSpriteSheet from "@assets/minimap.png";

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
       ctx.fillStyle = '#000011';
       ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

       this.stars.forEach(star => {
           ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
           ctx.beginPath();
           ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
           ctx.fill();
       });
   }
};

export default function humanScreen() {
    const game = new Engine({
        fps: 60,
        player: {
            type: "human",
            size: 150,
            position: Vector.zero(),
            walkSpeed: 20,
            runSpeed: 1000
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
                debug: false,
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
        starField.init(map);

        game.on("playerDeath", () => {
            game.enemies.length = 0;
        });

        game.on("update", (dt) => {
            if (game.player.isDead) return;

            starField.update(dt);
            ShootingSystem.updateAll(dt);
        });

        const originalMapDraw = game.map.draw;
        game.map.draw = function(ctx) {
            starField.draw(ctx);
            originalMapDraw.call(this, ctx);
        };

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
