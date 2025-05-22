import styles from "@screens/styles/floodHUD.module.css";
import logger from "@utils/logger.js";

export default class FloodHUD {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.setup();
    }

    setup() {
        // Create HUD container
        this.hudContainer = document.createElement('div');
        this.hudContainer.className = styles.container;
        this.hudContainer.style.position = 'absolute';
        this.hudContainer.style.top = '0';
        this.hudContainer.style.left = '0';
        this.hudContainer.style.width = '100%';
        this.hudContainer.style.height = '100%';
        this.hudContainer.style.pointerEvents = 'none';
        logger.debug("HUD container created");

        // Create and setup all HUD elements
        this.setupCoreStats();
        this.setupSpeedIndicator();
        this.setupCloneAbilities();
        this.setupMutationPowers();

        // Add all elements to container
        this.hudContainer.appendChild(this.statsContainer);
        this.hudContainer.appendChild(this.speedIndicator);
        this.hudContainer.appendChild(this.cloneAbilities);
        this.hudContainer.appendChild(this.mutationPowers);

        // Add HUD to game container
        this.gameContainer.appendChild(this.hudContainer);
        logger.debug("HUD added to game container");
    }

    setupCoreStats() {
        this.statsContainer = document.createElement('div');
        this.statsContainer.className = styles.coreStats;
        this.statsContainer.style.position = 'absolute';
        this.statsContainer.style.top = '20px';
        this.statsContainer.style.left = '20px';
        this.statsContainer.style.display = 'flex';
        this.statsContainer.style.flexDirection = 'column';
        this.statsContainer.style.gap = '10px';

        // Health bar
        this.healthBar = this.createStatBar('Vida', '#8B0000');
        this.statsContainer.appendChild(this.healthBar.label);
        this.statsContainer.appendChild(this.healthBar.bar);

        // Biomass bar
        this.biomassBar = this.createStatBar('Biomasa', '#800080');
        this.statsContainer.appendChild(this.biomassBar.label);
        this.statsContainer.appendChild(this.biomassBar.bar);

        // Evolution bar
        this.evolutionBar = this.createStatBar('Evolución', '#006400');
        this.statsContainer.appendChild(this.evolutionBar.label);
        this.statsContainer.appendChild(this.evolutionBar.bar);
    }

    createStatBar(label, color) {
        const bar = document.createElement('div');
        bar.className = styles.statBar;
        bar.style.width = '200px';
        bar.style.height = '20px';
        bar.style.background = 'rgba(0, 0, 0, 0.5)';
        bar.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        bar.style.borderRadius = '10px';
        bar.style.overflow = 'hidden';

        const fill = document.createElement('div');
        fill.className = `${styles.statFill}`;
        fill.style.height = '100%';
        fill.style.background = color;
        fill.style.transition = 'width 0.3s ease';

        const labelElement = document.createElement('div');
        labelElement.className = styles.statLabel;
        labelElement.textContent = label;
        labelElement.style.color = 'white';
        labelElement.style.fontSize = '14px';
        labelElement.style.marginBottom = '2px';
        labelElement.style.textShadow = '1px 1px 2px black';

        bar.appendChild(fill);
        return { bar, fill, label: labelElement };
    }

    setupSpeedIndicator() {
        this.speedIndicator = document.createElement('div');
        this.speedIndicator.className = styles.speedIndicator;
        this.speedIndicator.style.position = 'absolute';
        this.speedIndicator.style.top = '20px';
        this.speedIndicator.style.right = '20px';
        this.speedIndicator.style.color = 'white';
        this.speedIndicator.style.fontSize = '14px';
        this.speedIndicator.style.textShadow = '1px 1px 2px black';
        this.speedIndicator.style.display = 'flex';
        this.speedIndicator.style.alignItems = 'center';
        this.speedIndicator.style.gap = '5px';

        const speedIcon = document.createElement('div');
        speedIcon.className = styles.speedIcon;
        speedIcon.style.width = '20px';
        speedIcon.style.height = '20px';
        speedIcon.style.background = 'url(@assets/icons/speed.png) no-repeat center';
        speedIcon.style.backgroundSize = 'contain';

        this.speedText = document.createElement('span');
        this.speedText.textContent = 'Normal';

        this.speedIndicator.appendChild(speedIcon);
        this.speedIndicator.appendChild(this.speedText);
    }

    setupCloneAbilities() {
        this.cloneAbilities = document.createElement('div');
        this.cloneAbilities.className = styles.cloneAbilities;
        this.cloneAbilities.style.position = 'absolute';
        this.cloneAbilities.style.bottom = '20px';
        this.cloneAbilities.style.left = '20px';
        this.cloneAbilities.style.display = 'flex';
        this.cloneAbilities.style.gap = '15px';

        const cloneTypes = ['Infectador', 'Tanque', 'Explosivo'];
        this.cloneSlots = cloneTypes.map((type, index) => this.createCloneSlot(type, index));
    }

    createCloneSlot(type, index) {
        const slot = document.createElement('div');
        slot.className = styles.cloneSlot;
        slot.style.width = '60px';
        slot.style.height = '60px';
        slot.style.background = 'rgba(0, 0, 0, 0.5)';
        slot.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        slot.style.borderRadius = '8px';
        slot.style.display = 'flex';
        slot.style.flexDirection = 'column';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        slot.style.position = 'relative';
        
        const icon = document.createElement('div');
        icon.className = styles.cloneIcon;
        icon.style.width = '40px';
        icon.style.height = '40px';
        icon.style.backgroundImage = `url(@assets/icons/${type.toLowerCase()}.png)`;
        icon.style.backgroundSize = 'contain';
        icon.style.backgroundRepeat = 'no-repeat';
        icon.style.backgroundPosition = 'center';
        
        const cooldown = document.createElement('div');
        cooldown.className = styles.cooldownOverlay;
        cooldown.textContent = 'Listo';
        cooldown.style.position = 'absolute';
        cooldown.style.bottom = '0';
        cooldown.style.left = '0';
        cooldown.style.width = '100%';
        cooldown.style.background = 'rgba(0, 0, 0, 0.7)';
        cooldown.style.color = 'white';
        cooldown.style.fontSize = '12px';
        cooldown.style.textAlign = 'center';
        cooldown.style.padding = '2px 0';
        
        const cost = document.createElement('div');
        cost.className = styles.biomassCost;
        cost.textContent = `${(index + 1) * 10}`;
        cost.style.position = 'absolute';
        cost.style.top = '-20px';
        cost.style.left = '50%';
        cost.style.transform = 'translateX(-50%)';
        cost.style.color = '#800080';
        cost.style.fontSize = '12px';
        cost.style.textShadow = '1px 1px 2px black';
        
        slot.appendChild(icon);
        slot.appendChild(cooldown);
        slot.appendChild(cost);
        this.cloneAbilities.appendChild(slot);
        return { slot, cooldown, cost };
    }

    setupMutationPowers() {
        this.mutationPowers = document.createElement('div');
        this.mutationPowers.className = styles.mutationPowers;
        this.mutationPowers.style.position = 'absolute';
        this.mutationPowers.style.bottom = '20px';
        this.mutationPowers.style.right = '20px';
        this.mutationPowers.style.display = 'flex';
        this.mutationPowers.style.gap = '15px';

        const mutationSlot = document.createElement('div');
        mutationSlot.className = styles.mutationSlot;
        mutationSlot.style.width = '50px';
        mutationSlot.style.height = '50px';
        mutationSlot.style.background = 'rgba(0, 0, 0, 0.5)';
        mutationSlot.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        mutationSlot.style.borderRadius = '50%';
        mutationSlot.style.display = 'flex';
        mutationSlot.style.alignItems = 'center';
        mutationSlot.style.justifyContent = 'center';
        mutationSlot.style.position = 'relative';
        
        const mutationIcon = document.createElement('div');
        mutationIcon.className = styles.mutationIcon;
        mutationIcon.style.width = '30px';
        mutationIcon.style.height = '30px';
        mutationIcon.style.backgroundImage = 'url(@assets/icons/mutation.png)';
        mutationIcon.style.backgroundSize = 'contain';
        mutationIcon.style.backgroundRepeat = 'no-repeat';
        mutationIcon.style.backgroundPosition = 'center';
        
        this.usesIndicator = document.createElement('div');
        this.usesIndicator.className = styles.usesIndicator;
        this.usesIndicator.textContent = 'X2';
        this.usesIndicator.style.position = 'absolute';
        this.usesIndicator.style.bottom = '-15px';
        this.usesIndicator.style.left = '50%';
        this.usesIndicator.style.transform = 'translateX(-50%)';
        this.usesIndicator.style.color = 'white';
        this.usesIndicator.style.fontSize = '12px';
        this.usesIndicator.style.textShadow = '1px 1px 2px black';
        
        mutationSlot.appendChild(mutationIcon);
        mutationSlot.appendChild(this.usesIndicator);
        this.mutationPowers.appendChild(mutationSlot);
    }

    update(player) {
        // Update stat bars
        const healthPercent = (player.health / player.maxHealth) * 100;
        const biomassPercent = (player.biomass / player.maxBiomass) * 100;
        const evolutionPercent = (player.evolution / player.maxEvolution) * 100;
        
        this.healthBar.fill.style.width = `${healthPercent}%`;
        this.biomassBar.fill.style.width = `${biomassPercent}%`;
        this.evolutionBar.fill.style.width = `${evolutionPercent}%`;
        
        // Update speed indicator
        this.speedText.textContent = player.isRunning ? 'Sprint' : 'Normal';
        
        // Update clone slots
        this.cloneSlots.forEach((slot, index) => {
            const canAfford = player.biomass >= (index + 1) * 10;
            slot.slot.style.opacity = canAfford ? '1' : '0.5';
            slot.cooldown.textContent = 'Listo';
        });
        
        // Update mutation slot
        this.usesIndicator.textContent = `X${player.mutationUses || 0}`;
        
        logger.debug("HUD updated", { healthPercent, biomassPercent, evolutionPercent });
    }
} 