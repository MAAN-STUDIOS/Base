import { Player } from "./objectPlayer.js";
import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import { FloodClone } from "./floodclone.js";
import logger from "@utils/logger.js";


/**
 * Represents a player-controlled flood entity in the game.
 * Handles keyboard input for movement (WASD/arrow keys) and running with Shift.
 * It Also manages biomass, evolution, cloning, and attacks.
 * @extends Player
 */
export class FloodPlayer extends Player {
    /**
     * @param {Object} options - Configuration options for the flood player.
     * @param {Vector} options.position - Initial position.
     * @param {number} [options.walkSpeed=12] - Base walking speed.
     * @param {number} [options.runSpeed=120] - Running speed.
     * @param {number} [options.health=100] - Initial health points
     * @param {number} [options.maxHealth=100] - Maximum health points
     * @param {number} [options.width=0] - Width of the player
     * @param {number} [options.height=0] - Height of the player
     * @param {Vector} [options.direction=new Vector(1, 0)] - Initial direction vector
     * @param {Image|HTMLImageElement} [options.onDestroyImage] - Image to show when player is destroyed
     * @param {number} [options.health=100] - Initial health points
     * @param {number} [options.maxHealth=100] - Maximum health points
     * @param {Image|HTMLImageElement} [options.spriteImage=null] - Player sprite image
     * @param {number|null} [options.walkSpeed=12] - Walk speed.
     * @param {number|null} [options.runSpeed=walkSpeed times 10] - Run speed.
     */
    constructor(options = {}) {
        super({
            color: "#8b0000",
            ...options
        });

        this.biomass = 0;
        this.evolution = 1;
        this.cloneCooldown = 5000;
        this.lastCloneTime = 0;
        this.evolutionCooldown = 0;
        this.attackCooldowns = { melee: 0, acid: 0, toxicSmoke: 0, spikes: 0 };
        this.consumeCooldown = 0;

        /** @type {Array<FloodClone>} - Active clones of this player */
        this.clones = [];
        ;
        /** @type {Object} - Key states for movement and running */
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false,
            consume: false
        };

        this.#setupControls();
        logger.debug("FloodPlayer initialized");
    }

    /**
     * Sets up keyboard event listeners for player controls.
     * Handles WASD, arrow keys, and shift for running.
     * @private
     */
    #setupControls() {
        const partialListener = (state) => {
            return (e) => {
                const key = e.key

                if (key === 'Shift') {
                    this.keys.shift = state;
                }

                if (key === 'q' || key === 'Q') {
                    this.keys.consume = state

                    if (state) this.consumeNearestClone();
                }
            }
        }

        window.addEventListener('keydown', partialListener(true));
        window.addEventListener('keyup', partialListener(false));
        logger.debug("FloodPlayer controls setup");
    }

    infectHuman(human) {
        // if (human.infected) return;
        // human.infected = true;
        this.biomass += 20;
        logger.debug(`Infected human! Biomass: ${this.biomass}`);
    }

    createClone() {
        const now = performance.now();
        if (now - this.lastCloneTime < this.cloneCooldown || this.biomass < 25) return;
        this.lastCloneTime = now;
        this.biomass -= 25;

        const clone = new FloodClone({
            position: new Vector(this.real_position.x + 50, this.real_position.y),
            width: this.width,
            height: this.height,
            color: this.color,
            evolution: this.evolution,
            _player: this
        });

        if (!this.clones) {
            this.clones = [];
        }
        this.clones.push(clone);

        logger.debug(`Clone created. Remaining biomass: ${this.biomass}`);
        return clone;
    }

    evolve() {
        const now = performance.now();
        const EVOLUTION_COST = 50;
        const EVOLUTION_COOLDOWN = 2000;
        if (now < this.evolutionCooldown || this.biomass < EVOLUTION_COST || this.evolution >= 3) return;
        this.biomass -= EVOLUTION_COST;
        this.evolution++;
        this.evolutionCooldown = now + EVOLUTION_COOLDOWN;
        this.cloneCooldown = 0;
        this.maxHealth += 100;
        this.health = this.maxHealth;
        logger.debug(`Evolved to level ${this.evolution}. Max health increased to ${this.maxHealth}`);
    }

    attack(type, target) {


        const now = performance.now();
        const cooldown = this.attackCooldowns[type] || 0;
        if (now < cooldown) return;
        switch (type) {
            case "melee":
                target.takeDamage?.(15);
                this.attackCooldowns.melee = now + 1000;
                break;
            case "acid":
                target.takeDamage?.(5);
                target.status = "corroded";
                this.attackCooldowns.acid = now + 2000;
                break;
            case "toxicSmoke":
                target.status = "confused";
                this.attackCooldowns.toxicSmoke = now + 3000;
                break;
        }
        logger.debug(`Attack ${type} executed on target`);
    }

    consumeNearestClone() {
        const now = performance.now();
        if (now < this.consumeCooldown || !this.clones || this.clones.length === 0) return;

        let nearestClone = null;
        let minDistance = Infinity;
        const CONSUME_RANGE = 100;

        for (const clone of this.clones) {
            if (clone.isDead) continue;

            const dx = clone.real_position.x - this.real_position.x;
            const dy = clone.real_position.y - this.real_position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && distance <= CONSUME_RANGE) {
                minDistance = distance;
                nearestClone = clone;
            }
        }

        if (nearestClone) {
            const healthRestored = 80;
            this.health = Math.min(this.maxHealth, this.health + healthRestored);
            nearestClone.die();
            this.consumeCooldown = now + 2000;
            logger.debug(`Consumed clone! Health restored: ${healthRestored}. Current health: ${this.health}`);
        }
    }

    /**
     * Draws the flood player, biomass, evolution, and cooldown bars.
     * @param {CanvasRenderingContext2D} ctx - Rendering context.
     * @override
     */
    draw(ctx) {
        super.draw(ctx);

        const colors = ["#8b0000", "#b80000", "#ff3030"];
        this.color = colors[this.evolution - 1];

        ctx.font = "12px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`Biomass: ${this.biomass}`, this.position.x, this.position.y - 20);
        ctx.fillText(`Evo: ${this.evolution}`, this.position.x, this.position.y - 35);

        const now = performance.now();
        // Evolution bar
        const evoRem = Math.max(0, this.evolutionCooldown - now);
        const evoPct = evoRem / 2000;
        ctx.fillStyle = "gray";
        ctx.fillRect(this.position.x, this.position.y - 50, 50, 3);
        if (evoRem > 0) {
            ctx.fillStyle = "purple";
            ctx.fillRect(this.position.x, this.position.y - 50, 50 * (1 - evoPct), 3);
        }

        // Clone bar
        const cloneRem = Math.max(0, this.cloneCooldown - (now - this.lastCloneTime));
        const clonePct = this.cloneCooldown > 0 ? cloneRem / this.cloneCooldown : 0;
        ctx.fillStyle = "gray";
        ctx.fillRect(this.position.x, this.position.y - 45, 50, 5);
        if (cloneRem > 0) {
            ctx.fillStyle = "blue";
            ctx.fillRect(this.position.x, this.position.y - 45, 50 * (1 - clonePct), 5);
        }

        // Consume cooldown bar
        const consumeRem = Math.max(0, this.consumeCooldown - now);
        const consumePct = consumeRem / 2000;
        ctx.fillStyle = "gray";
        ctx.fillRect(this.position.x, this.position.y - 60, 50, 3);
        if (consumeRem > 0) {
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.position.x, this.position.y - 60, 50 * (1 - consumePct), 3);
        }

        // Attack bars
        const attackY = this.position.y - 55;
        Object.entries(this.attackCooldowns).forEach(([type, cd], idx) => {
            const rem = Math.max(0, cd - now);
            const pct = rem / 3000;
            const x = this.position.x + idx * 15;
            ctx.fillStyle = "gray";
            ctx.fillRect(x, attackY, 10, 3);
            if (rem > 0) {
                ctx.fillStyle = "red";
                ctx.fillRect(x, attackY, 10 * (1 - pct), 3);
            }
        });
    }

    die() {
        super.die();

        this.biomass = 0;
        this.clones.forEach(clone => clone.die());
        this.clones = [];

        logger.debug("Flood died! Respawning in 3 seconds...");
    }
}
