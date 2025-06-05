import './style.css';
import { registerScreen, navigate } from '@utils/router.js';
import screenMenu from '@/screens/menu.js';
import screenStartGame from '@/screens/startgame.js';
import screenFloodTest from "@/screens/demo-flood.js";
import screenPageNotFound from "@screens/404.js";
import screenCredits from "@screens/credits.js";
import screenHumanDemo from "@screens/demo.js";
import audioManager from "@utils/audiomanager.js";
import cloneSound from "@/assets/sfx/clone.wav";
import terrorMusic from "@/assets/sfx/Terror.mp3";
import playerDamage from "@/assets/sfx/player_damage.wav";
import screenLogin from "@screens/login.js";
import screenCreateAccount from "@screens/createAccount.js";
import screenJoinGame from "@screens/joinGame.js";
import screenDashboard from "@screens/dashboard.js";

// Register all screens
registerScreen('menu', screenMenu);
registerScreen('play', screenStartGame);
registerScreen('flood', screenFloodTest);
registerScreen('human', screenHumanDemo);
registerScreen(404, screenPageNotFound);
registerScreen('credits', screenCredits);
registerScreen('login', screenLogin);
registerScreen('create-account', screenCreateAccount);
registerScreen('dashboard', screenDashboard);

registerScreen('join-game', screenJoinGame);
registerScreen('dashboard', screenDashboard);

document.addEventListener("click", function unlockAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0; // Silent
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(0);
    oscillator.stop(0.001);
    document.removeEventListener("click", unlockAudio);
}, { once: true });

function initAudio() {
    // Load sounds first
    audioManager.loadSound("clone", cloneSound);
    audioManager.loadSound("humanDamage", playerDamage);
 
    audioManager
        .loadSound("menu", terrorMusic, { 
            loop: true, 
            volume: 0.6, 
            type: "music" // This is critical - must specify it's music
        })
        .then(() => {
            console.log("Menu music loaded successfully");
        })
        .catch(err => {
            console.error("Failed to load menu music:", err);
        });
}

initAudio();

// Navigate to the appropriate screen
navigate(location.pathname.slice(1) || 'menu');

