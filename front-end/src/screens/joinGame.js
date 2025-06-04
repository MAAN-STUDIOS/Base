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
        const createGameForm = document.getElementById("create-game-form");
        const createGameModal = document.getElementById("create-game-modal");
        const closeModalBtn = document.getElementById("close-modal-btn");

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
            createBtn.addEventListener("click", () => {
                createGameModal.style.display = "flex";
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener("click", () => {
                createGameModal.style.display = "none";
            });
        }

        if (createGameForm) {
            createGameForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const formData = new FormData(createGameForm);
                const gameData = {
                    name: formData.get("name"),
                    description: formData.get("description"),
                    seed: formData.get("seed") || Math.floor(Math.random() * 1000000),
                    max_players: formData.get("max_players") || 8
                };
                console.log("Creating game with data:", gameData);
                navigate("play", { gameData });
            });
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

            <div id="create-game-modal" class="${styles.modal}">
                <div class="${styles.modalContent}">
                    <h2>Create New Game</h2>
                    <form id="create-game-form" class="${styles.createGameForm}">
                        <div class="${styles.formGroup}">
                            <label for="name">Game Name *</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                required 
                                maxlength="100"
                                placeholder="Enter game name"
                            />
                        </div>

                        <div class="${styles.formGroup}">
                            <label for="description">Description</label>
                            <textarea 
                                id="description" 
                                name="description"
                                placeholder="Enter game description"
                            ></textarea>
                        </div>

                        <div class="${styles.formGroup}">
                            <label for="seed">Seed (optional)</label>
                            <input 
                                type="number" 
                                id="seed" 
                                name="seed"
                                placeholder="Random if empty"
                            />
                        </div>

                        <div class="${styles.formGroup}">
                            <label for="max_players">Max Players (2-20)</label>
                            <input 
                                type="number" 
                                id="max_players" 
                                name="max_players"
                                min="2"
                                max="20"
                                value="8"
                            />
                        </div>

                        <div class="${styles.formButtons}">
                            <button type="submit" class="${styles.menuButton}">Create Game</button>
                            <button type="button" id="close-modal-btn" class="${styles.backButton}">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
        `
    ];
}