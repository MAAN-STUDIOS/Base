import { HumanPlayer } from "@engine/humanPlayer.js";
import { Vector } from "@utils/vector.js";
import { ObjectMap } from "@engine/objectMap.js";
import MapSS from "@assets/map.png";
import styles from "@screens/styles/game.module.css";
import logger from "@utils/logger.js";


export default function humanScreen() {
    const setup = () => {
        const TARGET_FPS = 60;
        const MS_PER_UPDATE = 1000 / TARGET_FPS;

        const PLAYER_SIZE = 50;

        const game = document.getElementById("game");
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        const ctx = game.getContext("2d");
        logger.debug("Canvas initialized", { width: game.width, height: game.height });

        const gameMap = new ObjectMap(MapSS, game.width, game.height, {
            tiles_per_row: 1,
            tile_size: 32,
            chunk_size: 16,
            n_loaded_chunks: 2,
            debug: true,
            real_position: Vector.zero()
        });
        logger.debug("Game map initialized");

        const player = new HumanPlayer(
            new Vector(
                game.width / 2 - PLAYER_SIZE / 2,
                game.height / 2 - PLAYER_SIZE / 2
            ),
            PLAYER_SIZE, PLAYER_SIZE, {
                walkSpeed: 600,
                runSpeed: 1200
            }
        );
        logger.debug("Human player created", { position: player.position });

        window.addEventListener('resize', () => {
            game.width = window.innerWidth;
            game.height = window.innerHeight;

            gameMap.viewPort.width = game.width;
            gameMap.viewPort.height = game.height;

            logger.debug("Canvas resized", { width: game.width, height: game.height });
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

                const prevPosition = player.position.clone();

                player.update(dt);
                handleCollisions(player, gameMap, prevPosition);
                gameMap.update(player.real_position, MS_PER_UPDATE);

                gameLoop.lag -= MS_PER_UPDATE;
            }

            ctx.clearRect(0, 0, game.width, game.height);
            gameMap.draw(ctx);
            player.draw(ctx);

            requestAnimationFrame(gameLoop);
        }

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

        requestAnimationFrame(gameLoop);
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
          <div>
            <h3 class="${styles.containerH3}">CONTROLS</h3>
            <ul class="${styles.containerUl}">
                <li>MOVE: Arrow Keys</li>
                <li>RUN:  Hold Shift</li>
            </ul>
          </div>
        </main>
   `];
}
