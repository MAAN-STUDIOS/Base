import styles from "@screens/styles/floodHUD.module.css";
import logger from "@utils/logger.js";

export default class FloodHUD {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.setup();
    }

    setup() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.className = styles.container;
        this.hudContainer.style.position = 'absolute';
        this.hudContainer.style.top = '0';
        this.hudContainer.style.left = '0';
        this.hudContainer.style.width = '100%';
        this.hudContainer.style.height = '100%';
        this.hudContainer.style.pointerEvents = 'none';

        this.setupCoreStats();
        this.setupCloneAbilities();
        this.setupMutationPowers();
        this.setupControls();

        this.hudContainer.appendChild(this.statsContainer);
        this.hudContainer.appendChild(this.cloneAbilities);
        this.hudContainer.appendChild(this.mutationPowers);
        this.hudContainer.appendChild(this.controlsContainer);

        this.gameContainer.appendChild(this.hudContainer);
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

        this.healthBar = this.createStatBar('Vida', '#16742d');
        this.statsContainer.appendChild(this.healthBar.label);
        this.statsContainer.appendChild(this.healthBar.bar);
        
        this.biomassBar = this.createStatBar('Biomasa', '#77ff00');
        this.statsContainer.appendChild(this.biomassBar.label);
        this.statsContainer.appendChild(this.biomassBar.bar);

        this.levelContainer = document.createElement('div');
        this.levelContainer.style.display = 'flex';
        this.levelContainer.style.alignItems = 'center';
        this.levelContainer.style.gap = '10px';
        this.levelContainer.style.marginTop = '5px';

        const levelLabel = document.createElement('div');
        levelLabel.textContent = 'Nivel';
        levelLabel.style.color = 'white';
        levelLabel.style.fontSize = '14px';
        levelLabel.style.textShadow = '1px 1px 2px black';

        this.levelValue = document.createElement('div');
        this.levelValue.textContent = '1';
        this.levelValue.style.color = '#006400';
        this.levelValue.style.fontSize = '18px';
        this.levelValue.style.fontWeight = 'bold';
        this.levelValue.style.textShadow = '1px 1px 2px black';

        this.levelContainer.appendChild(levelLabel);
        this.levelContainer.appendChild(this.levelValue);
        this.statsContainer.appendChild(this.levelContainer);
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
        slot.style.width = '80px';
        slot.style.height = '80px';
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
        icon.style.width = '50px';
        icon.style.height = '50px';
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
        cooldown.style.fontSize = '14px';
        cooldown.style.textAlign = 'center';
        cooldown.style.padding = '2px 0';
        
        const costKeyContainer = document.createElement('div');
        costKeyContainer.style.position = 'absolute';
        costKeyContainer.style.top = '-20px';
        costKeyContainer.style.left = '50%';
        costKeyContainer.style.transform = 'translateX(-50%)';
        costKeyContainer.style.display = 'flex';
        costKeyContainer.style.flexDirection = 'column';
        costKeyContainer.style.alignItems = 'center';
        costKeyContainer.style.gap = '2px';
        
        const cost = document.createElement('div');
        cost.className = styles.biomassCost;
        cost.textContent = `${(index + 1) * 10}`;
        cost.style.color = '#77ff00';
        cost.style.fontSize = '14px';
        cost.style.fontWeight = 'bold';
        cost.style.textShadow = '1px 1px 2px black';
        
        const key = document.createElement('div');
        const keyText = index === 0 ? 'C' : (index === 1 ? 'E' : 'F');
        key.textContent = `[${keyText}]`;
        key.style.color = 'white';
        key.style.fontSize = '12px';
        key.style.textShadow = '1px 1px 2px black';
        
        costKeyContainer.appendChild(cost);
        costKeyContainer.appendChild(key);
        
        slot.appendChild(icon);
        slot.appendChild(cooldown);
        slot.appendChild(costKeyContainer);
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

        const cloneInfoContainer = document.createElement('div');
        cloneInfoContainer.style.display = 'flex';
        cloneInfoContainer.style.flexDirection = 'column';
        cloneInfoContainer.style.alignItems = 'center';
        cloneInfoContainer.style.gap = '5px';

        this.cloneCount = document.createElement('div');
        this.cloneCount.style.color = '#77ff00';
        this.cloneCount.style.fontSize = '16px';
        this.cloneCount.style.fontWeight = 'bold';
        this.cloneCount.style.textShadow = '1px 1px 2px black';
        this.cloneCount.textContent = 'Clones: 0';

        this.cloneHealthContainer = document.createElement('div');
        this.cloneHealthContainer.style.display = 'flex';
        this.cloneHealthContainer.style.flexDirection = 'column';
        this.cloneHealthContainer.style.gap = '8px';
        this.cloneHealthContainer.style.width = '120px';
        this.cloneHealthContainer.style.background = 'rgba(0, 0, 0, 0.5)';
        this.cloneHealthContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        this.cloneHealthContainer.style.borderRadius = '8px';
        this.cloneHealthContainer.style.padding = '8px';

        cloneInfoContainer.appendChild(this.cloneCount);
        cloneInfoContainer.appendChild(this.cloneHealthContainer);
        this.mutationPowers.appendChild(cloneInfoContainer);
    }

    setupControls() {
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = styles.controls;
        this.controlsContainer.style.position = 'absolute';
        this.controlsContainer.style.bottom = '150px';
        this.controlsContainer.style.left = '20px';
        this.controlsContainer.style.background = 'rgba(0, 0, 0, 0.7)';
        this.controlsContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        this.controlsContainer.style.borderRadius = '8px';
        this.controlsContainer.style.padding = '15px';
        this.controlsContainer.style.display = 'flex';
        this.controlsContainer.style.flexDirection = 'column';
        this.controlsContainer.style.gap = '8px';

        const title = document.createElement('div');
        title.textContent = 'CONTROLES';
        title.style.color = '#77ff00';
        title.style.fontSize = '16px';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        title.style.marginBottom = '5px';
        title.style.textShadow = '1px 1px 2px black';

        const controls = [
            'Movimiento: ↑ ↓ ← →',
            'Correr: Shift + Flechas',
            'Clonar: [C]',
            'Evolucionar: [E]',  
            'Atacar: [F]',
            'Reiniciar: [R]'
        ];

        this.controlsContainer.appendChild(title);

        controls.forEach(control => {
            const controlElement = document.createElement('div');
            controlElement.textContent = control;
            controlElement.style.color = 'white';
            controlElement.style.fontSize = '12px';
            controlElement.style.textShadow = '1px 1px 2px black';
            controlElement.style.whiteSpace = 'nowrap';
            this.controlsContainer.appendChild(controlElement);
        });
    }

    update(player) {
        const maxHealth = 100 * player.evolution;
        const maxBiomass = 200;
        
        const healthPercent = (player.health / maxHealth) * 100;
        const biomassPercent = (player.biomass / maxBiomass) * 100;
        
        const healthBarWidth = 200 * player.evolution;
        this.healthBar.bar.style.width = `${healthBarWidth}px`;
        this.healthBar.fill.style.width = `${healthPercent}%`;
        
        this.biomassBar.fill.style.width = `${biomassPercent}%`;
        
        this.levelValue.textContent = player.evolution;
        
        const cloneCosts = [25, 50, 75];
        const now = performance.now();
        
        this.cloneSlots.forEach((slot, index) => {
            const cost = cloneCosts[index];
            const canAfford = player.biomass >= cost;
            const cooldownRemaining = player.lastCloneTime + player.cloneCooldown - now;
            
            slot.slot.style.opacity = canAfford ? '1' : '0.5';
            slot.cost.textContent = `${cost}`;
            
            if (cooldownRemaining > 0) {
                const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
                slot.cooldown.textContent = `${cooldownSeconds}s`;
                slot.cooldown.style.background = 'rgba(255, 0, 0, 0.7)';
            } else {
                slot.cooldown.textContent = 'Listo';
                slot.cooldown.style.background = 'rgba(0, 0, 0, 0.7)';
            }
        });

        if (player.clones) {
            this.cloneCount.textContent = `Clones: ${player.clones.length}`;
            
            this.cloneHealthContainer.innerHTML = '';
            
            player.clones.forEach((clone, index) => {
                const healthBar = document.createElement('div');
                healthBar.style.width = '100%';
                healthBar.style.height = '12px';
                healthBar.style.background = 'rgba(0, 0, 0, 0.5)';
                healthBar.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                healthBar.style.borderRadius = '6px';
                healthBar.style.overflow = 'hidden';

                const healthFill = document.createElement('div');
                healthFill.style.width = `${(clone.health / clone.maxHealth) * 100}%`;
                healthFill.style.height = '100%';
                healthFill.style.background = '#16742d';
                healthFill.style.transition = 'width 0.3s ease';

                healthBar.appendChild(healthFill);
                this.cloneHealthContainer.appendChild(healthBar);
            });
        } else {
            this.cloneCount.textContent = 'Clones: 0';
            this.cloneHealthContainer.innerHTML = '';
        }
    }
}