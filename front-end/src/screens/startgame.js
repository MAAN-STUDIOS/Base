import { navigate } from "@utils/router.js";
import styles from "./styles/startgame.module.css";
import { join_game } from "../core/utils/apimanager";
import logger from "../core/utils/logger.js";


export default function () {
  const listener = () => {
    const errorMessage = document.getElementById("error-message");
    
    const showError = (message) => {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
    };

    const hideError = () => {
      errorMessage.style.display = "none";
    };

    const handleJoinGame = async (playerType) => {
      hideError();
      
      if (!localStorage.getItem("authToken")) {
        showError(`You must be logged in to play as ${playerType}.`);
        return;
      }
      
      const gameId = localStorage.getItem("gameId");
      if (!gameId || gameId == "" || gameId == "null") {
        showError("Please enter a game ID");
        navigate("join-game");
        return;
      }
      
      const socketId = localStorage.getItem("socketId");
      if (!socketId) {
        showError("Socket connection not established");
        return;
      }
      
      try {
        const data = await join_game(localStorage.getItem("gameId"), playerType, localStorage.getItem("socketId"), localStorage.getItem("authToken"));

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
        return;
      }
      
      navigate(playerType);
    };

    const floodBtn = document.getElementById("flood-btn");
    if (floodBtn) floodBtn.addEventListener("click", () => handleJoinGame('flood'));

    const humanBtn = document.getElementById("human-btn");
    if (humanBtn) humanBtn.addEventListener("click", () => handleJoinGame('human'));

    const tutorialBtn = document.getElementById("tutorial-btn");
    if (tutorialBtn) tutorialBtn.addEventListener("click", () => navigate("tutorial"));

    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.addEventListener("click", () => navigate("menu"));
  };

  return [listener, `
    <section class="${styles.screen}" style="text-align:center;">
      <h1 style="margin-bottom: 40px;">CHOOSE YOUR SIDE</h1>
      
      <div id="error-message" class="${styles.errorMessage}" style="display: none;"></div>
      
      <button id="human-btn" class="${styles.humanBtn}">Play as Human -> </button>
      <button id="flood-btn" class="${styles.floodBtn}"> <- Play as Flood</button>
      <button id="tutorial-btn" class="${styles.menuButton}">📚 Tutorial</button>
      <button id="back-btn">← Back to Menu</button>
    </section>
  `];
}