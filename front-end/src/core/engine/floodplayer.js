import { Player } from "@engine/objectPlayer.js";
import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import { FloodClone } from "@engine/floodclone.js";
import logger from "@utils/logger.js";
import { floodMovement } from "@engine/playerAnimation.js";
import { Rect } from "@utils/rectangle.js";
import SpriteSheet from "@/assets/Flood/flood-sprites1.png";


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
        this.attackCooldowns = { melee: 0, acid: 0};
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

        // Sprite setup
        this.img = new Image();
        this.img.src = SpriteSheet;

        this.spriteRect = new Rect(0, 0, 78, 70);
        this.previousDirection = "down";
        this.currentDirection = "down";
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.repeat = true;
        this.frameDuration = 100;
        this.totalTime = 0;
        this.sheetCols = 5;

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
        this.biomass += 20;
        logger.debug(`Infected human! Biomass: ${this.biomass}`);
    }

    setAnimation(minFrame, maxFrame, repeat, duration) {
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
        this.repeat = repeat;
        this.totalTime = 0;
        this.frameDuration = duration * 1000;
    }

    updateFrame(deltaTime) {
        this.totalTime += deltaTime;

        if (this.totalTime >= this.frameDuration) {
            const restartFrame = this.repeat ? this.minFrame : this.frame;
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : restartFrame;
    
            this.spriteRect.x = this.frame % this.sheetCols;
            this.spriteRect.y = Math.floor(this.frame / this.sheetCols);
    
            this.totalTime = 0;
        }
    }

    setMovementAnimation() {
        if (Math.abs(this.moveDirection.y) > Math.abs(this.moveDirection.x)) {

            if (this.moveDirection.y > 0) {
                if (this.keys.shift) {
                    this.currentDirection = "downRun";
                } else {
                    this.currentDirection = "down";
                }
            } else if (this.moveDirection.y < 0) {
                this.currentDirection = "up";
                if (this.keys.shift) {
                    this.currentDirection = "upRun";
                }
            } else {
                this.currentDirection = "idle";
            }
        } else {
            if (this.moveDirection.x > 0) {
                if (this.keys.shift) {
                    this.currentDirection = "rightRun";
                } else {
                    this.currentDirection = "right";
                }
            } else if (this.moveDirection.x < 0) {
                if (this.keys.shift) {
                    this.currentDirection = "leftRun";
                } else {
                    this.currentDirection = "left";
                }
            } else {
                this.currentDirection = "idle";
            }
        }

        if (this.keys.consume) {
            this.currentDirection = "eat";
        } else if (this.isDead) {
            this.currentDirection = "death";
        }

        if (this.isAttacking) {
            this.currentDirection = "attack";
        }

        if (this.keys.attack) {
            this.currentDirection = "attack";
        }
        

        if (this.currentDirection !== this.previousDirection) {
            const anim = floodMovement[this.currentDirection];
            this.setAnimation(...anim.frames, anim.repeat, anim.duration);
        }
    
        this.previousDirection = this.currentDirection;
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
        if (this.isAttacking) return;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.isAttacking = false;
            }, 1000);
        }
        this.isAttacking = true;

        const now = performance.now();

        const cooldown = this.attackCooldowns[type] || 0;
        if (now < cooldown) return;
        switch (type) {
            case "melee":
                if (this.evolution === 1) {
                    target.takeDamage?.(15);
                } else if (this.evolution === 2) {
                    target.takeDamage?.(25);
                } else if (this.evolution === 3) {
                    target.takeDamage?.(50);
                }
                this.attackCooldowns.melee = now + 200;
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

        const screenCenterX = ctx.canvas.width / 2;
        const screenCenterY = ctx.canvas.height / 2;

        let scale = 1.3;
        if (this.evolution === 2) scale = 1.4;
        else if (this.evolution === 3) scale = 1.8;

        const drawWidth = this.width * scale;
        const drawHeight = this.height * scale;

        ctx.drawImage(
            this.img,
            this.spriteRect.x * this.spriteRect.width,
            this.spriteRect.y * this.spriteRect.height,
            this.spriteRect.width,
            this.spriteRect.height,
            screenCenterX - this.width / 2,
            screenCenterY - this.height / 2,
            drawWidth,
            drawHeight
        );

        const colors = ["#8b0000", "#b80000", "#ff3030"];
        this.color = colors[this.evolution - 1];

        // Posición fija en la pantalla (un poco arriba de la mitad)
        const fixedX = ctx.canvas.width / 2 - 25; // Centrado horizontalmente, ajustado para el ancho de las barras
        const fixedY = ctx.canvas.height / 2 - 50; // Un poco arriba de la mitad

        const now = performance.now();
    }

    die() {
        super.die();

        this.biomass = 0;
        this.evolution = 1;
        // this.biomass = 150; 
        this.clones.forEach(clone => clone.die());
        this.clones = [];

        logger.debug("Flood died! Respawning in 3 seconds...");
    }

    update(dt) {
        super.update(dt);
        this.setMovementAnimation();
        this.updateFrame(dt * 1000);

        // Auto-restore health if below 30% 
        if (!this._lastAutoRestore) this._lastAutoRestore = 0;
        const now = performance.now();
        if (this.health < 0.4 * this.maxHealth && (now - this._lastAutoRestore > 5000)) {
            this.health = Math.max(this.health, Math.floor(0.3 * this.maxHealth));
            this._lastAutoRestore = now;
            logger.debug('Flood auto-restored to 30% health!');
        }
    }

    takeDamage(amount) {
        if (!this._lastDamageTime) this._lastDamageTime = 0;
        const now = performance.now();
        if (now - this._lastDamageTime < 500) return; // 0.5s cooldown
        this._lastDamageTime = now;
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
            logger.debug("Player died!");
            this.die();
        }
    }

}
