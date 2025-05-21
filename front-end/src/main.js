import './style.css';
import { registerScreen, navigate } from '@utils/router.js';
import screenMenu from '@/screens/menu.js';
import screenStartGame from '@/screens/startgame.js';
import screenGame from "@screens/game.js";
import screenFloodTest from "@/screens/floodtest.js";
import screenPageNotFound from "@screens/404.js";
import screenCredits from "@screens/credits.js";
import screenHuman from "@screens/humanTest.js";
import audioManager from "@utils/audiomanager.js";
import cloneSound from "@/assets/sfx/clone.wav";
import terrorMusic from "@/assets/sfx/Terror.mp3";
import playerDamage from "@/assets/sfx/player_damage.wav";



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
        
        
    /* 
    audioManager
        .loadSound("battle", "assets/music/battle.mp3", { 
            loop: true, 
            volume: 0.7,
            type: "music"  // Also needed here
        });
    */
}

initAudio();

registerScreen('menu', screenMenu);
registerScreen('play', screenStartGame);
registerScreen('game', screenGame);
registerScreen('flood', screenFloodTest);
registerScreen('human', screenHuman)
registerScreen(404, screenPageNotFound);
registerScreen('credits', screenCredits);


navigate(location.pathname.slice(1) || 'menu');
