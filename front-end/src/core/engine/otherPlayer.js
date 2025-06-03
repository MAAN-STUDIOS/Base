import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import logger from "@utils/logger.js";


export class OtherPlayer {
    /**
     * Creates a new human-controlled player.
     * @param position
     */
    constructor(position) {
        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = new Hitbox(this);

        /** @type {Vector} */
        this.real_position = position.clone();

        this.target = Vector.zero();
    }

    /**
     * Updates the player's state and position based on current key inputs.
     * Handles movement direction, speed (walk/run), and normalization for diagonal movement.
     * @param {number} dt - Delta time in seconds since the last update.
     * @override
     */
    update(dt) {
        this.real_position.lerpEqual(this.target, 1);
    }

    /**
     * Renders the player on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @override
     */
}
