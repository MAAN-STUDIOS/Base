import { navigate } from "@utils/router.js";
import styles from "./styles/context_screenFlood.module.css";

import astronauta from "@assets/Flood/astronauta_sinfondo.png";

export default function () {
    const listener = () => {
        const starsContainer = document.getElementById('stars');
        const numStars = 150;

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = styles.star;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }

        document.getElementById("btn-play")?.addEventListener('click', () => {
            // alert('Let the carnage begin!'); not sure about it
            navigate("flood");
        });
    };

    return [listener, `
<main class="${styles.main}">
    <div class="${styles.stars}" id="stars"></div>
    
        <h1 class="${styles.title}">Cosmonavt</h1>
    <div class="${styles.container}">
        
        <div class="${styles.storySection}">
            <h2 class="${styles.sectionTitle}">What Happened?</h2>
            <div class="${styles.storyText}">
                The Qirax originate from the sulfurous swamps of Xyrrath Prime. There, acid lagoons bubble beneath metallic rains. Among pools of ancient organic matter, the first chemoautotrophic life forms grew, capable of metabolizing heavy metals and toxic compounds. From these inhospitable origins emerged an organism with sensory tentacles adapted to detect minute variations in pH and electromagnetic fields.
            </div>
            <div class="${styles.storyText}">
                The Prometheus fleet, while conducting exploration missions for mining purposes, found a strange rock on a star made of promethium, which they transported back to the Astral Dynamics mainframe only to discover that inside it lay a kind of viscous liquid. After being released, it escaped, evolved rapidly, and multiplied, destroying all life forms other than itself.
            </div>
            <div class="${styles.storyText}">
                Your objective is to exterminate any anthropomorphic form in your path; harness your immense strength.Multiply and create more floods. Remember, you need to kill humans to obtain biomass from them.
            </div>
            <div class="${styles.storyText}">
                To win, you need to collect all the cure fragments before the surviving astronauts inside the ship do.
            </div>
        </div>
        
        <div class="${styles.objectiveSection}">
            <h2 class="${styles.sectionTitle}">Main Objective</h2>
            <div class="${styles.objectiveText}">
                FIND ALL THE FRAGMENTS OF THE CURE SCATERRED AMONG THE BRAVE COSMONAUTS IN EACH ROOM, REMEMBER YOU NEED 3 FRAGMENTS TO WIN<br>
                DESTROY ALL INTELLIGENT LIFE FORMS<br>
                GAIN CONTROL OF THE PROMETHEUS SHIP
            </div>
        </div>
        
        <div class="${styles.enemiesSection}">
            <h2 class="${styles.sectionTitle}">Inteligent Life Forms</h2>
            <div class="item-grid">
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${astronauta}" alt="Cosmonavts" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">Cosmonavts</div>
                    <div class="${styles.itemDescription}">Human survivors inside the ship, handling heavy weaponry.</div>
                </div>
            </div>
        </div>

        <div class="${styles.controlsSection}">
    <h2 class="${styles.sectionTitle}">Controls</h2>
    <div class="${styles.itemGrid}">
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">⌨️</div>
            </div>
            <div class="${styles.itemName}">Movement</div>
            <div class="${styles.itemDescription}">Use WASD or the arrows in your keyboard to move around the ship. Hold SHIFT to attack to crush the human scum.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">⚠️</div>
            </div>
            <div class="${styles.itemName}">Clones</div>
            <div class="${styles.itemDescription}">Use the C key to multiplicate yourself. *Remember that this consumes biomass.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">⬆️</div>
            </div>
            <div class="${styles.itemName}">Evolve</div>
            <div class="${styles.itemDescription}">Use the E key to evolve to inflinct a lot of damage. *Remember that this consumes biomass.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">⚕️</div>
            </div>
            <div class="${styles.itemName}">Respawn</div>
            <div class="${styles.itemDescription}">You will respawn automatically.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">🍖</div>
            </div>
            <div class="${styles.itemName}">Consume Clone</div>
            <div class="${styles.itemDescription}">Press Q to eat one of your clones, restoring 100 health. You will lose the clone and gain no biomass but what does it matter!.</div>
        </div>
    </div>
</div>
        
        <button class="${styles.startButton}" id="btn-play"">Let the carnage begin!</button>
    </div>
</main>
  `];
}