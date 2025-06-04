import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";


export class GameObject {
    /**
     * Creates a new GameObject instance
     * @param {Object} options - Configuration options
     * @param {Vector} [options.position] - The position of the game object
     * @param {number} [options.width=0] - Width of the game object
     * @param {number} [options.height=0] - Height of the game object
     * @param {Hitbox} [options.hitbox] - Custom hitbox for collision detection
     * @param {Image|HTMLImageElement} [options.destroyImage=null] - Image to show when object is destroyed
     * @param {boolean} [options.debug] - Whether to show debug visuals
     */
    constructor(options = {}) {
        this.position = options.position || Vector.zero();
        this.width = options.width || 0;
        this.height = options.height || 0;

        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = options.hitbox || new Hitbox(this);

        this.destroyImage = options.destroyImage || null;
        this.debug = options.debug;
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (!this.debug) return;

        this.drawBoundingBox(ctx);
        this.hitbox.drawDebug(ctx);
    }

    /**
     *
     * @param {GameObject || {hitbox: Hitbox}} other
     * @returns {boolean|*}
     */
    collidesWith(other) {
        return this.hitbox.collidesWith(other.hitbox);

    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawBoundingBox(ctx) {
        ctx.strokeStyle = "#2100ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    onDestroy(ctx) {
        if (this.destroyImage) {
            ctx.drawImage(this.destroyImage, this.position.x, this.position.y, this.width, this.height);
        }

        ctx.clearRect(this.position.x, this.position.y, this.width, this.height);

        this.hitbox?.clear();

        this.spriteImage = null;
        this.position = null;
        this.width = null;
        this.height = null;
        this.hitbox = null;
        this.destroyImage = null;

        this.clear();
    }

    /**
     *
     * @param {{x: number, y: number, width: number, height: number}} viewport
     * @returns {boolean}
     */
    isVisible(viewport) {
        // TODO: is correct?
        return !(
            this.position.x + this.width < viewport.x ||
            this.position.x > viewport.x + viewport.width ||
            this.position.y + this.height < viewport.y ||
            this.position.y > viewport.y + viewport.height
        );
    }

    clear() {

    }

    setSprite(imagePath, rect) {
        this.spriteImage = new Image();
        this.spriteImage.src = imagePath;
        if (rect) {
            this.spriteRect = rect;
        }
    }

    serialize() {
        return {
            position: this.position,
            width: this.width,
            height: this.height,
            hitbox: this.hitbox,
            sprite: this.spriteImage,
            destroyImage: this.destroyImage
        };
    }

    /**
     *
     * @param dt
     * @returns void
     */
    update(dt) {
        // TODO:Method to be implemented
    }
}
