import { navigate } from "@utils/router.js";
import styles from "@screens/styles/main.module.css";
import { create_game, game_info, active_games } from "../core/utils/apimanager";

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
        const errorMessage = document.getElementById("error-message");
        const modalErrorMessage = document.getElementById("modal-error-message");
        const activeGamesList = document.getElementById("active-games-list");
        
        localStorage.setItem("gameId", "NOT_SET");

        const showError = (message, isModal = false) => {
            const errorEl = isModal ? modalErrorMessage : errorMessage;
            errorEl.textContent = message;
            errorEl.style.display = "block";
        };

        const hideError = (isModal = false) => {
            const errorEl = isModal ? modalErrorMessage : errorMessage;
            errorEl.style.display = "none";
        };

        const loadActiveGames = async () => {
            try {
                const data = await active_games();
                
                if (data.success) {
                    const activeGames = data.games.filter(game => 
                        game.state === "starting" || game.state === "running"
                    );
                    
                    if (activeGames.length > 0) {
                        activeGamesList.innerHTML = activeGames.map(game => `
                            <div class="${styles.gameItem}" data-game-id="${game.game_id}">
                                <div class="${styles.gameName}">${game.name}</div>
                                <div class="${styles.gameInfo}">
                                    ${game.current_players}/${game.max_players} players
                                    ${game.state === "starting" ? "• Starting" : "• In Progress"}
                                </div>
                            </div>
                        `).join('');
                        
                        document.querySelectorAll(`.${styles.gameItem}`).forEach(item => {
                            item.addEventListener('click', () => {
                                const gameId = item.getAttribute('data-game-id');
                                gameIdInput.value = gameId;
                                hideError();
                            });
                        });
                    } else {
                        activeGamesList.innerHTML = `<div class="${styles.noGames}">No active games available</div>`;
                    }
                } else {
                    activeGamesList.innerHTML = `<div class="${styles.noGames}">Unable to load games</div>`;
                }
            } catch (error) {
                console.error("Error loading active games:", error);
                activeGamesList.innerHTML = `<div class="${styles.noGames}">Error loading games</div>`;
            }
        };

        loadActiveGames();

        if (backBtn) {
            backBtn.addEventListener("click", () => navigate("menu"));
        }

        if (joinBtn) {
            joinBtn.addEventListener("click", async () => {
                hideError();
                const gameId = gameIdInput.value.trim();
                if (!gameId) {
                    showError("Please enter a game ID");
                    return;
                }

                try {
                    const data = await game_info(gameId);
                    console.log("Game Info Data:" + gameId);
                    localStorage.setItem("gameId", gameId);
                    
                    if (!data) {
                        showError("Game not found");
                        return;
                    } else if (data.current_players >= data.max_players) {
                        showError("Game is full");
                        return;
                    } else if (data.status == "ended") {
                        showError("Game has already ended");
                        return;
                    }
                    
                    localStorage.setItem("gameId", gameId);
                    navigate("play");
                } catch (error) {
                    showError("Error checking game information");
                }
            });
        }

        if (createBtn) {
            createBtn.addEventListener("click", () => {
                hideError(true);
                createGameModal.style.display = "flex";
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener("click", () => {
                hideError(true);
                createGameModal.style.display = "none";
            });
        }

        if (createGameForm) {
            createGameForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                hideError(true);
                
                const formData = new FormData(createGameForm);
                const gameData = {
                    name: formData.get("name"),
                    description: formData.get("description"),
                    seed: formData.get("seed") || Math.floor(Math.random() * 1000000),
                    max_players: formData.get("max_players") || 8
                };
                
                try {
                    const response = await create_game(gameData.name, gameData.description, gameData.seed, gameData.max_players, localStorage.getItem("authToken"));
                    if (response.status === 401) {
                        showError("You must be logged in to create a game.", true);
                        navigate("login");
                        return;
                    } 
                    const data = await response.json();
                    if (!data) {
                        showError("Failed to create game. Please try again.");
                        return;
                    }
                    //console.log("Create Game Response:", data);
                    if (data.game_id === undefined) {
                        navigate("join-game")
                    }
                    if (data.success) {
                        localStorage.setItem("gameId", response.game_id);
                        navigate("join-game");
                    } else if (response.status === 401) {
                        showError("You must be logged in to create a game.", true);
                        navigate("login");
                    } else {
                        showError("Failed to create game: " + response.error, true);
                    }
                } catch (error) {
                    console.error("Error creating game:", error);
                    showError("An error occurred while creating the game.", true);
                }
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
                
                <div id="error-message" class="${styles.errorMessage}" style="display: none;"></div>
                
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
                    
                    <div class="${styles.activeGamesSection}">
                        <h3 class="${styles.activeGamesTitle}">Active Games</h3>
                        <div id="active-games-list" class="${styles.activeGamesList}">
                            <div class="${styles.loadingGames}">Loading games...</div>
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

            <div id="create-game-modal" class="${styles.modal}">
                <div class="${styles.modalContent}">
                    <h2>Create New Game</h2>
                    
                    <div id="modal-error-message" class="${styles.errorMessage}" style="display: none;"></div>
                    
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