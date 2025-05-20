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
     * @param width
     * @param height
     * @param {Object} options - Configuration options for the player.
     * @param {Vector} [options.position] - Initial position of the player.
     * @param {number|null} [options.width] - Width of the player.
     * @param {number|null} [options.height] - Height of the player.
     * @param {number|null} [options.walkSpeed=12] - Walk speed.
     * @param {number|null} [options.runSpeed=120] - Run speed.
     */
    constructor(position, width, height = null, options = {}) {
        // Example set up
        // TODO: Improve when implement game engine.
        super({ position, width, height: height ? height : width, ...options });

        this.real_position = position.clone();

        /** @type {string} - Color representation for the player. */
        this.color = "#2a52be";

        /** @type {number} - Base movement speed when walking. */
        this.walkSpeed = options.walkSpeed || 12;

        /** @type {number} - Increased movement speed when running. */
        this.runSpeed = options.runSpeed || 120;

        /** @type {boolean} - Flag indicating if the player is currently running. */
        this.isRunning = false;

        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = new Hitbox(this);
        this.moveDirection = Vector.zero();

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
            shift: false
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
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.up = true;
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.down = true;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Shift':
                    this.keys.shift = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.up = false;
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.down = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Shift':
                    this.keys.shift = false;
                    break;
            }
        });

        logger.debug("HumanPlayer controls setup");
    }

    /**
     * Updates the player's state and position based on current key inputs.
     * Handles movement direction, speed (walk/run), and normalization for diagonal movement.
     * @param {number} dt - Delta time in seconds since the last update.
     * @override
     */
    update(dt) {
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
}
