import logger from "@utils/logger.js";

export class HumanHUD {
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
        logger.debug("HUD container created");

        this.setupCoreStats();

        this.hudContainer.appendChild(this.statsContainer);

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

        this.healthBar = this.createStatBar('Vida', '#FF0000');
        this.statsContainer.appendChild(this.healthBar.label);
        this.statsContainer.appendChild(this.healthBar.bar);

        this.oxygenBar = this.createStatBar('Oxígeno', '##5ac3e7');
        this.statsContainer.appendChild(this.oxygenBar.label);
        this.statsContainer.appendChild(this.oxygenBar.bar);
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

    /**
     *
     * @param {HumanPlayer} player
     */
    update(player) {
        const maxHealth = 100;
        const maxOxygen = 200;

        const healthPercent = (player.health / maxHealth) * 100;
        const oxygenPercent = (player.oxygen / maxOxygen) * 100;

        const healthBarWidth = 200 * player.evolution;
        this.healthBar.bar.style.width = `${healthBarWidth}px`;
        this.healthBar.fill.style.width = `${healthPercent}%`;

        this.oxygenBar.fill.style.width = `${oxygenPercent}%`;
        //
        // logger.debug("HUD updated", {
        //     healthPercent,
        //     oxygenPercent,
        //     evolution: player.evolution,
        //     biomass: player.oxygen,
        //     activeClones: player.clones?.length || 0
        // });
    }
}
