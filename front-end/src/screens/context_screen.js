import { navigate } from "@utils/router.js";
import styles from "./styles/context_screen.module.css";

import clone from "@assets/Flood/Clone/clone_sinfondo.png";
import beast from "@assets/Flood/Flood_sinfondo.png";
import ametralladora from "@assets/Armas/ametralladora.png";
import lanzallamas from "@assets/Armas/lanzallamas.png";
import escopeta from "@assets/Armas/escopeta.png";
import pistola from "@assets/Armas/pistola.png";

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
            // alert('¡La misión comienza! Buena suerte Ronan Rhys... La necesitarás'); not sure about it
            navigate("human");
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
                The Stellar Odyssey ship, en route to Saturn and crewed by six Astral Dynamics engineers, passed through the ergosphere of Geminis D3, a black hole 16 times the size of Earth.
            </div>
            <div class="${styles.storyText}">
                The force of spacetime pulled them into the event horizon, a place where no one is supposed to survive.
            </div>
            <div class="${styles.storyText}">
                Ronan Rhys (you) was the only one who managed to escape the ship and redirect back to the Astral Dynamics fleet, only to realize that what felt like a brief moment had actually been 72 years, due to the time distortion caused by the event horizon.
            </div>
            <div class="${styles.storyText}">
                The A.D fleet "Prometheus" was attacked by a never-before-seen enemy — a mysterious alien race whose sole purpose is to wipe out all life. Your mission is to find a possible cure to destroy the Flood and escape the ship. "Survival is not expected..."
            </div>
        </div>
        
        <div class="${styles.objectiveSection}">
            <h2 class="${styles.sectionTitle}">Main Objective</h2>
            <div class="${styles.objectiveText}">
                FIND ALL THE FRAGMENTS OF THE CURE SCATERRED AMONG THE HOSTILE BOSSES IN EACH ROOM, REMEMBER YOU NEED 3 FRAGMENTS TO WIN.<br>
                DESTROY THE FLOOD<br>
                AND ESCAPE FROM THE PROMETHEUS SHIP ALIVE
            </div>
        </div>
        
        <div class="${styles.weaponsSection}">
            <h2 class="${styles.sectionTitle}">Combat Inventory</h2>
            <div class="${styles.itemGrid}">
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${pistola}" alt="MV-1 Officer Pistol" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">MV-1 Officer Pistol</div>
                    <div class="${styles.itemDescription}">Standard-issue sidearm for USGC officers. Compact, accurate, and reliable under zero-gravity conditions</div>
                </div>
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${escopeta}" alt="MV-5 Proton Shotgun" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">MV-5 Proton Shotgun</div>
                    <div class="${styles.itemDescription}">Short-range proton shotgun that fires bursts of unstable energy, capable of disintegrating alien organisms with a single blast</div>
                </div>
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${ametralladora}" alt="MV-4 Ceris Machine Gun" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">MV-4 Ceris Machine Gun</div>
                    <div class="${styles.itemDescription}">High-caliber automatic weapon with a rapid rate of fire. Designed to suppress alien hordes and destroy light cover. Overheats quickly—but leaves no survivors</div>
                </div>
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${lanzallamas}" alt="MV-6 Plasma Flamethrower" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">MV-6 Plasma Flamethrower</div>
                    <div class="item-description">Experimental device that projects jets of incandescent plasma. Engineered to burn organic material at the molecular level—ideal against Flood biological threats</div>
                </div>
            </div>
        </div>
        
        <div class="${styles.enemiesSection}">
            <h2 class="${styles.sectionTitle}">Hostile Entities</h2>
            <div class="item-grid">
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${beast}" alt="Flood-Beast" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">Flood-Beast</div>
                    <div class="${styles.itemDescription}">Extremely hostile organic lifeforms; at close range, they deal heavy damage</div>
                </div>
                <div class="${styles.itemCard}">
                    <div class="${styles.itemImage}">
                        <img src="${clone}" alt="Flood Clone" class="${styles.weaponImg}">
                    </div>
                    <div class="${styles.itemName}">Flood Clone</div>
                    <div class="${styles.itemDescription}">Parasites originating from the Flood-Beast, these are created from the biomass obtained by killing the surviving humans</div>
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
            <div class="${styles.itemDescription}">Use WASD or the arrows in your keyboard to move around the ship. Hold SHIFT to run when escaping dangerous situations *Remember that this consumes oxygen.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">🖱️</div>
            </div>
            <div class="${styles.itemName}">Shooting Control</div>
            <div class="${styles.itemDescription}">Use the F key to shoot and aim with your keyboard cursor.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">🔄</div>
            </div>
            <div class="${styles.itemName}">Weapon Switch</div>
            <div class="${styles.itemDescription}">Press numbers 1-4 to switch between weapons.1 for Pistol, 2 for Shotgun, 3 for Machinegun and 4 for Flamethrower.</div>
        </div>
        <div class="${styles.itemCard}">
            <div class="${styles.itemImage}">
                <div style="color: #ffaa00; font-size: 2rem;">⚕️</div>
            </div>
            <div class="${styles.itemName}">Respawn</div>
            <div class="${styles.itemDescription}">You will respawn automatically.</div>
        </div>
    </div>
</div>
        
        <button class="${styles.startButton}" id="btn-play"">Begin mission</button>
    </div>
</main>
  `];
}