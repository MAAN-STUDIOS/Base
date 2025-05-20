import { HumanPlayer } from "@engine/humanPlayer.js";
import { Vector } from "@utils/vector.js";
import styles from "@screens/styles/game.module.css";
import logger from "@utils/logger.js";


export default function humanDemoScreen() {
    // Example set up
    // TODO: Refactor or delete once the game engine is impl
    const setup = () => {
        const PLAYER_SIZE = 50;
        const BORDER_PADDING = 50;
        const TEXT_CONFIG = {
            fontSize: 16,
            fontFamily: "monospace",
            margin: 20,
            lineHeight: 20
        };

        const game = document.getElementById("game");
        game.width = window.innerWidth;
        game.height = window.innerHeight;
        const ctx = game.getContext("2d");
        logger.debug("Canvas initialized", { width: game.width, height: game.height });


        const player = new HumanPlayer({
            position: new Vector(
                game.width / 2 - PLAYER_SIZE / 2,
                game.height / 2 - PLAYER_SIZE / 2
            ),
            width: PLAYER_SIZE,
            height: PLAYER_SIZE
        });
        logger.debug("Human player created", { position: player.position });

        window.addEventListener('resize', () => {
            game.width = window.innerWidth;
            game.height = window.innerHeight;

            logger.debug("Canvas resized", { width: game.width, height: game.height });
        });

        function gameLoop() {
            ctx.clearRect(0, 0, game.width, game.height);

            player.update();
            player.draw(ctx);

            ctx.strokeStyle = "#444";
            ctx.strokeRect(
                BORDER_PADDING,
                BORDER_PADDING,
                game.width - (BORDER_PADDING * 2),
                game.height - (BORDER_PADDING * 2)
            );

            ctx.font = `${TEXT_CONFIG.fontSize}px ${TEXT_CONFIG.fontFamily}`;
            ctx.fillStyle = "white";
            ctx.textAlign = "left";

            let textY = TEXT_CONFIG.margin + TEXT_CONFIG.fontSize;
            ctx.fillText("Controls:", TEXT_CONFIG.margin, textY);
            textY += TEXT_CONFIG.lineHeight;
            ctx.fillText("Move: WASD or Arrow Keys", TEXT_CONFIG.margin, textY);
            textY += TEXT_CONFIG.lineHeight;
            ctx.fillText("Run: Hold Shift", TEXT_CONFIG.margin, textY);

            requestAnimationFrame(gameLoop);
        }

        gameLoop();
    };

    return [setup, `
        <main class="${styles.container}">
          <canvas id="game"></canvas>
        </main>
   `];
}