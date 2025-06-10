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
    <div class="${styles.container}">
        <h1 class="${styles.title}" style="color: #39FF14; font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 12px #000, 0 0 20px #39FF14;">FLOOD VICTORY</h1>
        <div class="${styles.storyText}" style="font-size: 1.3rem; color: #fff; margin-bottom: 30px; text-shadow: 2px 2px 8px #000;">
            The Prometheus ship is now under your control.<br>
            All intelligent life has been eradicated.<br>
            The Flood reigns supreme!
        </div>
        <button class="${styles.startButton}" id="btn-menu" style="margin-bottom: 18px; font-size: 1.2rem; padding: 18px 38px; border-radius: 40px; background: linear-gradient(90deg, #9B1A1A 60%, #6B4820 100%); box-shadow: 0 0 18px #9B1A1A;">Return to Main Menu</button>
        <button class="${styles.checkStats}" id="btn-check-stats" style="font-size: 1rem; padding: 12px 32px; border-radius: 12px; background: rgba(0,0,0,0.7); color: #fff; border: 2px solid #39FF14; margin-top: 0; box-shadow: 0 0 8px #39FF14;">Check Stats</button>
    </div>
</main>
  `];
}