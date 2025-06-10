import { navigate } from "@utils/router.js";
import styles from "./styles/context_screenFlood.module.css";
import humanWinBg from "@/assets/WinScreen/humanEpicWin.png";

export default function () {
    const listener = () => {
        document.getElementById("btn-menu")?.addEventListener("click", () => {
            navigate("main");
        });
    };

    return [listener, `
<main class="${styles.main}" style="background: url('${humanWinBg}') center/cover no-repeat; min-height: 100vh;">
    <div class="${styles.stars}" id="stars"></div>
    <div class="${styles.container}">
        <h1" style="color: #00eaff; font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 12px #000, 0 0 20px #00eaff;">HUMAN VICTORY</h1>
        <div class="${styles.storyTextHuman}" style="font-size: 1.3rem; color: #fff; margin-bottom: 30px; text-shadow: 2px 2px 8px #000;">
            The Prometheus ship is safe.<br>
            All Flood threats have been neutralized.<br>
            Humanity prevails!
        </div>
        <button class="${styles.startButton}" id="btn-menu" style="margin-bottom: 18px; font-size: 1.2rem; padding: 18px 38px; border-radius: 40px; background: linear-gradient(90deg, #0077ff 60%, #00eaff 100%); box-shadow: 0 0 18px #00eaff;">Return to Main Menu</button>
        <button class="${styles.checkStats}" id="btn-check-stats" style="font-size: 1rem; padding: 12px 32px; border-radius: 12px; background: rgba(0,0,0,0.7); color: #fff; border: 2px solid #00eaff; margin-top: 0; box-shadow: 0 0 8px #00eaff;">Check Stats</button>
    </div>
</main>
  `];
}