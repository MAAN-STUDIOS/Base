import './style.css';
import { registerScreen, navigate } from '@utils/router.js';
import screenMenu from '@/screens/menu.js';
import screenStartGame from '@/screens/startgame.js';
import screenFloodTest from "@/screens/demo-flood.js";
import screenPageNotFound from "@screens/404.js";
import screenCredits from "@screens/credits.js";
import screenHumanDemo from "@screens/demo.js";
import screenLogin from "@screens/login.js";
import screenCreateAccount from "@screens/createAccount.js";
import screenJoinGame from "@screens/joinGame.js";
import screenDashboard from "@screens/dashboard.js";
import context_screen from '@screens/context_screen.js';
import context_Flood_screen from '@screens/context_screenFlood.js';


import audioManager from "@utils/audiomanager.js";
import cloneSound from "@/assets/sfx/clone.wav";
import terrorMusic from "@/assets/sfx/Terror.mp3";
import playerDamage from "@/assets/sfx/player_damage.wav";
import pistolSound from "@/assets/sfx/pistol.wav";
import machineGunSound from "@/assets/sfx/machinegun.wav";
import shotgunSound from "@/assets/sfx/shotgun.wav";
import flamethrowerSound from "@/assets/sfx/flamethrower.wav";
import stepsSound from "@/assets/sfx/steps.wav";

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
registerScreen('context_screen', context_screen);
registerScreen('context_flood', context_Flood_screen);

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
    audioManager.loadSound("clone", cloneSound);
    audioManager.loadSound("humanDamage", playerDamage);

    audioManager.loadSound("gunPistol", pistolSound, {
        volume: 0.1,
        type: "sfx"
    });
    audioManager.loadSound("gunMachinegun", machineGunSound, {
        volume: 0.1,
        type: "sfx"
    });
    audioManager.loadSound("gunShotgun", shotgunSound, {
        volume: 0.1,
        type: "sfx"
    });
    audioManager.loadSound("gunFlamethrower", flamethrowerSound, {
        volume: 0.1,
        type: "sfx"
    });
    audioManager.loadSound("humanSteps", stepsSound, {
        volume: 0.1,
        type: "sfx"
    });

    audioManager
        .loadSound("menu", terrorMusic, { 
            loop: true, 
            volume: 0.6, 
            type: "music"
        })
        .then(() => {
            console.log("Menu music loaded successfully");
        })
        .catch(err => {
            console.error("Failed to load menu music:", err);
        });
}

initAudio();

navigate(location.pathname.slice(1) || 'menu');