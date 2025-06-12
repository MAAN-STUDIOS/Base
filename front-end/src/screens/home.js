import { navigate } from "@utils/router.js";
import styles from "@screens/styles/home.module.css";
import welcomeVideo from "/welcome-video.mp4";


export default function () {
    const listener  = () => {
        const video = document.getElementById("video");
        const btn = document.getElementById("menu-btn");

        btn?.addEventListener("click", () => navigate('menu'));

        video?.addEventListener("ended", () => {
            if (!btn) return;
            btn.style.display = 'block';
            btn.classList.add(styles.animated);
        });
    }

    return [listener, `
    <main class="${styles.container}">
        <video id="video" class="${styles.video}" src="${welcomeVideo}" autoplay></video>
        <button id="menu-btn" class="${styles.btn}" style="display: none;">Start Playing</button>
    </main>
    `];
}