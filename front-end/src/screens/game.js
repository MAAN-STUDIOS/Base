import styles from "@screens/styles/game.module.css";


export default function gameScreen() {
    const inner = () => {
        // Example
        const game = document.getElementById("game");
        game.width = window.innerWidth;
        game.height = window.innerHeight;

        const context = game.getContext("2d");

        context.font = "48px serif";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("HELLO COSMONAVT", game.width / 2, game.height / 2);
    }

    return [inner, `
    <main class="${styles.container}">
      <canvas id="game"></canvas>
    </main>
  `];
}
