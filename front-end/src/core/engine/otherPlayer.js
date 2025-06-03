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
        this.position = position.clone();

        this.target = Vector.zero();

        this.health = 100;
        this.maxHealth = 100;
    }

    /**
     * Updates the player's state and position based on current key inputs.
     * Handles movement direction, speed (walk/run), and normalization for diagonal movement.
     * @param {number} dt - Delta time in seconds since the last update.
     * @override
     */
    update(dt) {
        this.position.lerpEqual(this.target, 1);
    }

    /**
     * Renders the player on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param p
     * @param w
     * @param h
     * @override
     */
    draw(ctx, p, w, h) {
        const screenX = this.position.x - p.x + w / 2;
        const screenY = this.position.y - p.y + h / 2;
        const width = 50;
        const height = 50;

        ctx.fillStyle = "green";
        ctx.fillRect(screenX - width / 2, screenY - height / 2, width, height);

        const healthBarWidth = width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;

        ctx.fillStyle = 'red';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            screenY - height / 2 - 10,
            healthBarWidth,
            healthBarHeight
        );

        ctx.fillStyle = 'green';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            screenY - height / 2 - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 300, 0, Math.PI * 2);
        ctx.stroke();
    }
}
