import { Player } from "@engine/objectPlayer.js";
import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import logger from "@utils/logger.js";


/**
 * Represents a human-controlled player in the game.
 * Handles keyboard input for player movement with WASD/arrow keys and running with Shift.
 * @extends Player
 */
export class HumanPlayer extends Player {
    /**
     * Creates a new human-controlled player.
     * @param position
     * @param {Object} options - Configuration options for the player.
     * @param {Vector} [options.position] - Initial position of the player.
     * @param {number|null} [options.width] - Width of the player.
     * @param {number|null} [options.height] - Height of the player.
     * @param {number|null} [options.walkSpeed=70] - Walk speed.
     * @param {number|null} [options.runSpeed=walkSpeed + 20] - Run speed.
     */
    constructor(position, options = {}) {
        // Example set up
        // TODO: Improve when implement game engine.
        super({ position, ...options });

        this.walkSpeed = options.walkSpeed || 12;
        this.runSpeed = options.runSpeed || this.walkSpeed + 50;
        this.isRunning = false;

        this.oxygen = 100;

        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = new Hitbox(this);

        /** @type {Vector} */
        this.real_position = position.clone();

        /** @type {Vector} */
        this.moveDirection = Vector.zero();

        /** @type {string} - Color representation for the player. */
        this.color = "#2a52be";


        this.lastDirection = new Vector(1, 0);

        this.attackCooldown = 0.3;
        this.timeSinceLastAttack = this.attackCooldown;


        /**
         * @type {Object} - Tracks the current state of movement keys.
         * @property {boolean} up - Whether the up key is pressed.
         * @property {boolean} down - Whether the down key is pressed.
         * @property {boolean} left - Whether the left key is pressed.
         * @property {boolean} right - Whether the right key is pressed.
         * @property {boolean} shift - Whether the shift key is pressed.
         */
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false,
            f: false,
            space: false
        };

        this.#setupControls();
        logger.debug("HumanPlayer initialized");
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
                if (key === `W` || key === 'w' || key === 'ArrowUp') {
                    this.keys.up = state;
                }
                if (key === `S` || key === 's' || key === 'ArrowDown') {
                    this.keys.down = state;
                }
                if (key === `A` || key === 'a' || key === 'ArrowLeft') {
                    this.keys.left = state;
                }
                if (key === `D` || key === 'd' || key === 'ArrowRight') {
                    this.keys.right = state;
                }
                if (key === 'Shift') {
                    this.keys.shift = state;
                }
                if (state && (key === ' ' || key === 'f')) {
                    this.attack();
                }
            }
        }

        window.addEventListener('keydown', partialListener(true));
        window.addEventListener('keyup', partialListener(false));
        logger.debug("HumanPlayer controls setup");
    }

    /**
     * Updates the player's state and position based on current key inputs.
     * Handles movement direction, speed (walk/run), and normalization for diagonal movement.
     * @param {number} dt - Delta time in seconds since the last update.
     * @override
     */
    update(dt) {
        this.timeSinceLastAttack += dt;
        this.moveDirection.clear();

        if (this.keys.up) this.moveDirection.y -= 1;
        if (this.keys.down) this.moveDirection.y += 1;
        if (this.keys.left) this.moveDirection.x -= 1;
        if (this.keys.right) this.moveDirection.x += 1;

        const moving = this.moveDirection.x !== 0 || this.moveDirection.y !== 0;
        if (moving) {
            const movingDiagonally = (
                this.moveDirection.x !== 0 && this.moveDirection.y !== 0
            );
            if (movingDiagonally) this.moveDirection.normalize();

            this.isRunning = this.keys.shift;
            const speed = this.isRunning ? this.runSpeed : this.walkSpeed;

            const frameAdjustedSpeed = speed * dt;
            this.moveDirection.scaleEqual(frameAdjustedSpeed);

            this.real_position.addEqual(this.moveDirection);
            this.direction = this.moveDirection;
        }

        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.lastDirection = this.direction.clone();
        }
    }

    /**
     * Renders the player on the canvas.
     * Draws the player and displays current movement status.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @override
     */
    draw(ctx) {
        super.draw(ctx);

        ctx.font = "16px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`${this.isRunning ? "Running" : "Walking"}`, this.position.x, this.position.y - 15);
    }

    attack() {
        const inCooldown = this.timeSinceLastAttack < this.attackCooldown;
        if (inCooldown) return;

        const weapon = this.attackSlots[this.activeSlot];
        if (!weapon || typeof weapon.fire !== "function") return;

        let direction = this.direction.clone();
        if (direction.x === 0 && direction.y === 0 && this.lastDirection) {
            direction = this.lastDirection.clone();
        }
        if (direction.x === 0 && direction.y === 0) {
            console.log("No direction to fire");
            return;
        }

        direction.normalize();
        weapon.fire(this.real_position.clone(), direction, this);

        this.timeSinceLastAttack = 0;
    }
}
