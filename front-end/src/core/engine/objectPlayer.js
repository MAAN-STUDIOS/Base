import { GameObject } from "./gameobject";
import { Vector } from "../utils/vector.js";
import logger from "@utils/logger.js";


export class Player extends GameObject {

    /**
     * Creates a new Player instance
     * @param {Object} options - Configuration options
     * @param {Vector} [options.position] - The position of the player
     * @param {number} [options.width=0] - Width of the player
     * @param {number} [options.height=0] - Height of the player
     * @param {string} [options.color] - Color of the player in case no sprite image available
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
            position: options.position,
            width: options.width,
            height: options.height,
            onDestroyImage: options.onDestroyImage
        });

        /** @type {Vector} */
        this.direction = options.direction || Vector.zero();

        /** @type {Vector} */
        this.moveDirection = Vector.zero();

        this.walkSpeed = options.walkSpeed || 12;
        this.runSpeed = options.runSpeed || this.walkSpeed * 10;

        /** @type {Vector} - Direction vector for movement */
        this.moveDirection = Vector.zero()

        /** @type {Vector} */
        this.real_position = options.position || Vector.zero();

        this.health = options.health || 100;
        this.maxHealth = options.maxHealth || 100;

        this.isDead = false;
        this.spriteImage = options.spriteImage;

        this.color = options.color || "#ffffff";

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
            right: false
        };

        this.#setupControls();
    }

    get world_position() {
        return this.real_position.clone();
    }

    init() {

    }

    /**
     *
     * @param {number} dt
     * @override
     */
    update(dt) {
        if (this.isDead) return;

        this.moveDirection.clear();

        if (this.keys.up) this.moveDirection.y -= 1;
        if (this.keys.down) this.moveDirection.y += 1;
        if (this.keys.left) this.moveDirection.x -= 1;
        if (this.keys.right) this.moveDirection.x += 1;

        const isMoving = this.moveDirection.x !== 0 || this.moveDirection.y !== 0;
        if (!isMoving) return;

        const movingDiagonally = (
            this.moveDirection.x !== 0 && this.moveDirection.y !== 0
        );
        if (movingDiagonally) this.moveDirection.normalize();

        const speed = this.isRunning ? this.runSpeed : this.walkSpeed;

        const frameAdjustedSpeed = speed * dt;
        this.moveDirection.scaleEqual(frameAdjustedSpeed);

        this.real_position.addEqual(this.moveDirection);
        this.direction = this.moveDirection;
    }

    get isRunning() {
        return this.keys.shift;
    }

    interact(obj) {
        if (obj && typeof obj.onInteract === "function") {
            obj.onInteract(this);
        }
    }

    attack() {
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;

            logger.debug("Player died!");
            this.die();
        }
    }

    die() {
        this.isDead = true;
        logger.debug("Player died! Respawning in 3 seconds...");
    }

    reSpawn(position) {
        this.isDead = false;
        this.health = this.maxHealth;
        this.real_position = position;

        logger.debug("Player respawned!");
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
            }
        }

        window.addEventListener('keydown', partialListener(true));
        window.addEventListener('keyup', partialListener(false));
        logger.debug("Player controls setup");
    }
}
