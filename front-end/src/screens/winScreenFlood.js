import { navigate } from "@utils/router.js";
import styles from "./styles/context_screenFlood.module.css";
import floodWinBg from "@/assets/WinScreen/floodEpicWin.png";

export default function () {
    const listener = () => {
        document.getElementById("btn-menu")?.addEventListener("click", () => {
            navigate("main");
        });
    };

    return [listener, `
<main class="${styles.main}" style="background: url('${floodWinBg}') center/cover no-repeat; min-height: 100vh;">
    <div class="${styles.stars}" id="stars"></div>
    <div class="${styles.container}" style="background: rgba(0,0,0,0.7); border-radius: 20px; margin: 60px auto; max-width: 700px; padding: 40px 30px; text-align: center;">
        <h1 class="${styles.title}" style="color: #39FF14; font-size: 3rem; margin-bottom: 20px; text-shadow: 0 0 20px #39FF14;">FLOOD VICTORY</h1>
        <div class="${styles.storyText}" style="font-size: 1.3rem; color: #fff; margin-bottom: 30px;">
            The Prometheus ship is now under your control.<br>
            All intelligent life has been eradicated.<br>
            The Flood reigns supreme!
        </div>
        <button class="${styles.startButton}" id="btn-menu">Return to Main Menu</button>
        <button class="${styles.checkStats}" id="btn-check-stats">Check Stats</button>
    </div>
</main>
  `];
}