import { FloodPlayer } from "@engine/floodPlayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectMap } from "@engine/objectMap.js";
import MapSS from "@assets/map.png";
import styles from "@screens/styles/game.module.css";
import logger from "@utils/logger.js";

export default function() {
  const setup = () => {
    const TARGET_FPS = 60;
    const MS_PER_UPDATE = 1000 / TARGET_FPS;
    const PLAYER_SIZE = 50;

    const canvas = document.getElementById("game");
    if (!canvas) {
      logger.error("Canvas not found!");
      return;
    }
    logger.debug("Canvas found:", { width: canvas.width, height: canvas.height });

    // Initialize canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      logger.error("Could not get canvas context!");
      return;
    }

    // Initialize game map
    const gameMap = new ObjectMap(MapSS, canvas.width, canvas.height, {
      tiles_per_row: 1,
      tile_size: 32,
      chunk_size: 16,
      n_loaded_chunks: 2,
      debug: true,
      real_position: Vector.zero()
    });
    logger.debug("Game map initialized");

    // Create player in center of screen
    const flood = new FloodPlayer({
      position: new Vector(
        canvas.width / 2 - PLAYER_SIZE / 2,
        canvas.height / 2 - PLAYER_SIZE / 2
      ),
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      color: "purple"
    });
    logger.debug("Flood player created", { position: flood.position });

    // Track real position for map movement
    let realPosition = new Vector(
      canvas.width / 2 - PLAYER_SIZE / 2,
      canvas.height / 2 - PLAYER_SIZE / 2
    );

    // Arrays for clones and enemies
    const clones = [];
    const enemies = [];

    // // Create test enemies
    // for (let i = 0; i < 5; i++) {
    //   enemies.push({
    //     position: new Vector(
    //       Math.random() * canvas.width,
    //       Math.random() * canvas.height
    //     ),
    //     width: 30,
    //     height: 30,
    //     health: 100,
    //     takeDamage(amount) {
    //       this.health -= amount;
    //       if (this.health <= 0) {
    //         const index = enemies.indexOf(this);
    //         if (index > -1) {
    //           enemies.splice(index, 1);
    //         }
    //       }
    //     }
    //   });
    // }

    // Input handling
    const keys = {};
    window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
    window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gameMap.viewPort.width = canvas.width;
      gameMap.viewPort.height = canvas.height;
      logger.debug("Canvas resized", { width: canvas.width, height: canvas.height });
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
        const prevPosition = realPosition.clone();

        // Update player movement
        const baseSpeed = 600;
        const sprintSpeed = 1200;
        const currentSpeed = keys["shift"] ? sprintSpeed : baseSpeed;

        // Update real position for map movement
        if (keys["w"]) realPosition.y -= currentSpeed * dt;
        if (keys["s"]) realPosition.y += currentSpeed * dt;
        if (keys["a"]) realPosition.x -= currentSpeed * dt;
        if (keys["d"]) realPosition.x += currentSpeed * dt;

        // Keep player centered on screen
        flood.position.x = canvas.width / 2 - PLAYER_SIZE / 2;
        flood.position.y = canvas.height / 2 - PLAYER_SIZE / 2;

        /**
         * Handles collision detection and resolution between player and map
         * @param {HumanPlayer} player - The player to check collisions for
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
         * @param {HumanPlayer} player - The player object
         * @param {Hitbox} obstacle - The hitbox player collided with
         * @param {Vector} prevPosition - Player's position before collision
         */
        function resolveCollision(player, obstacle, prevPosition) {
          const currX = player.position.x;
          const currY = player.position.y;

          player.position.x = currX;
          player.position.y = prevPosition.y;

          if (player.hitbox.collidesWith(obstacle)) {
            player.position.x = prevPosition.x;
            player.position.y = currY;

            if (player.hitbox.collidesWith(obstacle)) {
              player.position.x = prevPosition.x;
              player.position.y = prevPosition.y;
            }
          }

          player.real_position = player.position.clone();
        }

        // Update abilities
        if (keys["e"]) flood.evolve();
        if (keys["c"]) {
          const clone = flood.createClone();
          if (clone) {
            clones.push(clone);
            logger.debug("Clone added to array", { totalClones: clones.length });
          }
        }
        if (keys["f"]) {
          const nearestEnemy = enemies.reduce((nearest, enemy) => {
            const dx = enemy.position.x - realPosition.x;
            const dy = enemy.position.y - realPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (!nearest || distance < nearest.distance) {
              return { enemy, distance };
            }
            return nearest;
          }, null);

          if (nearestEnemy && nearestEnemy.distance < 100) {
            flood.attack("melee", nearestEnemy.enemy);
          }
        }

        // Update clones
        clones.forEach(clone => {
          clone.update(dt, flood, enemies);
        });

        // Update map with real position
        gameMap.update(realPosition, MS_PER_UPDATE);

        gameLoop.lag -= MS_PER_UPDATE;
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw map
      gameMap.draw(ctx);

      // // Draw enemies relative to map position
      // enemies.forEach(enemy => {
      //   const screenX = enemy.position.x - gameMap.viewPort.x;
      //   const screenY = enemy.position.y - gameMap.viewPort.y;

      //   if (screenX >= -enemy.width &&
      //       screenX <= canvas.width &&
      //       screenY >= -enemy.height &&
      //       screenY <= canvas.height) {

      //     ctx.fillStyle = "red";
      //     ctx.fillRect(screenX, screenY, enemy.width, enemy.height);

      //     const healthPercentage = enemy.health / 100;
      //     ctx.fillStyle = "gray";
      //     ctx.fillRect(screenX, screenY - 10, enemy.width, 5);
      //     ctx.fillStyle = "green";
      //     ctx.fillRect(screenX, screenY - 10, enemy.width * healthPercentage, 5);
      //   }
      // });

      // Draw player and clones (they're already in screen coordinates)
      flood.draw(ctx);
      clones.forEach(clone => clone.draw(ctx));

      // Draw status text
      ctx.font = "16px monospace";
      ctx.fillStyle = "white";
      ctx.fillText(`Biomass: ${flood.biomass}`, 20, 30);
      ctx.fillText(`Evo: ${flood.evolution}`, 20, 50);
      ctx.fillText(`Speed: ${keys["shift"] ? "Sprint" : "Normal"}`, 20, 70);
      ctx.fillText(`Clones: ${clones.length}`, 20, 90);
      ctx.fillText(`Enemies: ${enemies.length}`, 20, 110);

      requestAnimationFrame(gameLoop);
    }

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

    function resolveCollision(player, obstacle, prevPosition) {
      const currX = player.position.x;
      const currY = player.position.y;

      player.position.x = currX;
      player.position.y = prevPosition.y;

      if (player.hitbox.collidesWith(obstacle)) {
        player.position.x = prevPosition.x;
        player.position.y = currY;

        if (player.hitbox.collidesWith(obstacle)) {
          player.position.x = prevPosition.x;
          player.position.y = prevPosition.y;
        }
      }
    }

    requestAnimationFrame(gameLoop);
  };

  return [setup, `
    <main class="${styles.container}">
      <canvas id="game"></canvas>
      <div>
        <h3 class="${styles.containerH3}">CONTROLS</h3>
        <ul class="${styles.containerUl}">
          <li>MOVE: WASD</li>
          <li>RUN: Hold Shift</li>
          <li>EVOLVE: E</li>
          <li>CREATE CLONE: C</li>
          <li>ATTACK: F</li>
        </ul>
      </div>
    </main>
  `];
}
