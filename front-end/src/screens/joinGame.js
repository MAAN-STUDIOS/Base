import {navigate} from "@utils/router.js";
import styles from "@screens/styles/main.module.css";

export default function () {
    const listener = () => {
        const backBtn = document.getElementById("back-btn");
        const joinBtn = document.getElementById("join-game-btn");
        const createBtn = document.getElementById("create-game-btn");
        const statsBtn = document.getElementById("stats-btn");
        const settingsBtn = document.getElementById("settings-btn");
        const gameIdInput = document.getElementById("game-id-input");

        if (backBtn) {
            backBtn.addEventListener("click", () => navigate("menu"));
        }

        if (joinBtn) {
            joinBtn.addEventListener("click", () => {
                const gameId = gameIdInput.value.trim();
                if (gameId) {
                    navigate("play", { gameId });
                } else {
                    alert("Please enter a game ID");
                }
            });
        }

        if (createBtn) {
            createBtn.addEventListener("click", () => navigate("play"));
        }

        if (statsBtn) {
            statsBtn.addEventListener("click", () => console.log("Navigate to stats"));
        }

        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => console.log("Navigate to settings"));
        }
    };

    return [
        listener,
        `
        <section class="${styles.screen} ${styles.menuScreen}">
            <div class="${styles.menuContainer}">
                <h1>Game Options</h1>
                
                <div class="${styles.buttonContainer}">
                    <div class="${styles.joinGameSection}">
                        <div class="${styles.joinGameRow}">
                            <input 
                                type="text" 
                                id="game-id-input" 
                                class="${styles.gameIdInput}" 
                                placeholder="Enter Game ID"
                            />
                            <button id="join-game-btn" class="${styles.menuButton}">
                                Join Game
                            </button>
                        </div>
                    </div>
                    
                    <button id="create-game-btn" class="${styles.menuButton}">
                        Create Game
                    </button>
                    
                    <button id="stats-btn" class="${styles.menuButton}">
                        📊 Stats
                    </button>
                    
                    <button id="settings-btn" class="${styles.menuButton}">
                        ⚙️ Settings
                    </button>
                </div>

                <button id="back-btn" class="${styles.backButton}">
                    Back to Menu
                </button>
            </div>
        </section>
        `
    ];
}