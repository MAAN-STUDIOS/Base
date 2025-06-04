import { navigate } from "@utils/router.js";
import styles from "./styles/startgame.module.css";

export default function () {
    const listener = () => {
        const floodBtn = document.getElementById("flood-btn");
        if (floodBtn) floodBtn.addEventListener("click", () => navigate("flood"));
        
        const humanBtn = document.getElementById("human-btn");
        if (humanBtn) humanBtn.addEventListener("click", () => navigate("human"));
        
        const tutorialBtn = document.getElementById("tutorial-btn");
        if (tutorialBtn) tutorialBtn.addEventListener("click", () => navigate("tutorial"));
        
        const backBtn = document.getElementById("back-btn");
        if (backBtn) backBtn.addEventListener("click", () => navigate("menu"));
    };

    return [listener, `
    <section class="${styles.screen}" style="text-align:center;">
      <h1 style="margin-bottom: 40px;">CHOOSE YOUR SIDE</h1>
      
      <button id="human-btn" class="${styles.humanBtn}">Play as Human -> </button>
      <button id="flood-btn" class="${styles.floodBtn}"> <- Play as Flood</button>
      <button id="tutorial-btn" class="${styles.menuButton}">📚 Tutorial</button>
      <button id="back-btn">← Back to Menu</button>
    </section>
  `];
}
