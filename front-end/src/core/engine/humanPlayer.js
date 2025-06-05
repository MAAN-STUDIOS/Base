import { Player } from "@engine/objectPlayer.js";
import { Vector } from "@utils/vector.js";
import logger from "@utils/logger.js";

/** @type {string}*/
import HUD from "@/assets/HUD/fondo.png";
/** @type {string}*/
import Shotgun from "@/assets/Armas/escopeta.png";
/** @type {string}*/
import Metra from "@/assets/Armas/ametralladora.png";
/** @type {string}*/
import Pistola from "@/assets/Armas/pistola.png";
/** @type {string}*/
import Granada from "@/assets/Armas/granada.png";

import Barra from "@assets/HUD/Barra_sinfo.png";

import Circulo from "@assets/HUD/Circulo_sinfo.png";


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
     * @param {number|null} [options.walkSpeed=12] - Walk speed.
     * @param {number|null} [options.runSpeed=walkSpeed times 10] - Run speed.
     * @param [options.attackSlots]
     */
    constructor(position, options = {}) {
        super({ position, color: "#2a52be", ...options });

        this.maxOxygen = 100;
        this.oxygen = this.maxOxygen;

        // TODO: Tasas de uso REVISAR
        this.oxygenUse = 10;
        this.oxygenReload = 0.3;

        this.healthTimer = 0;
        this.oxygenTimer = 0;

        this.mouseDirection = new Vector(1, 0);

        this.attackSlots = options.attackSlots || [];
        this.activeSlot = 0;

        this.img = new Image();
        this.img.src = HUD;

        this.imga = new Image();
        this.imga.src = Shotgun;

        this.img2 = new Image();
        this.img2.src = Metra;

        this.img3 = new Image();
        this.img3.src = Pistola;

        this.img4 = new Image();
        this.img4.src = Granada;

        this.img5 = new Image();
        this.img5.src = Barra;

        this.img6 = new Image();
        this.img6.src = Circulo;


        /**
         * @type {Object} - Tracks the current state of movement keys.
         * @property {boolean} up - Whether the up key is pressed.
         * @property {boolean} down - Whether the down key is pressed.
         * @property {boolean} left - Whether the left key is pressed.
         * @property {boolean} right - Whether the right key is pressed.
         * @property {boolean} shift - Whether the shift key is pressed.
         * @property {boolean} f - fire
         */
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false,
            attack: false,
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

                if (key === 'Shift') {
                    this.keys.shift = state;
                }
                if (state && (key === ' ' || key === 'f')) {
                    // TODO: check it later
                    this.keys.attack = true;
                    this.attack();
                } else {
                    this.keys.attack = false;
                }
                if (key === '1') {
                    this.activeSlot = 0;
                }
                if (key === '2') {
                    this.activeSlot = 1;
                }
                if (key === '3') {
                    this.activeSlot = 2;
                }
                if (key === '4') {
                    this.activeSlot = 3;
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
        super.update(dt);
        this.updateOxygen(dt);
        this.updateHealth(dt);
        this.updateWeapons(dt);
    }

    updateOxygen(dt) {
        if (this.isRunning) {
            this.oxygenTimer += dt;
            if (this.oxygenTimer >= 5.0) {
                this.oxygen -= this.oxygenUse;
                if (this.oxygen < 0) this.oxygen = 0;
                this.oxygenTimer = 0;
            }
        } else if (this.oxygen < this.maxOxygen) {
            this.oxygen += this.oxygenReload * dt;
            if (this.oxygen > this.maxOxygen) this.oxygen = this.maxOxygen;
        }

    }

    updateHealth(dt) {
        if (this.health < this.maxHealth) {
            this.healthTimer += dt;
            if (this.healthTimer >= 3.0) {
                this.health += 1;
                if (this.health > this.maxHealth) this.health = this.maxHealth;
                this.healthTimer = 0;
            }
        }
    }

    updateWeapons(dt) {
        for (let weapon of this.attackSlots) {
            if (weapon && typeof weapon.update === "function") {
                weapon.update(dt);
            }
        }
    }

    get isRunning() {
        return this.keys.shift && this.oxygen > 20;
    }

    /**
     * Renders the player on the canvas.
     * Draws the player and displays current movement status.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @override
     * Draw the life and oxygen bars for the human player, every bar has a white border
     */
    draw(ctx) {
        super.draw(ctx);

        this.drawHealth(ctx);
        this.drawOxygen(ctx);
        this.drawHUD(ctx);
        this.drawWeapons(ctx);
    }

    drawHealth(ctx) {
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = "red";
        ctx.fillRect(25, 5, 250 * healthPercentage, 20);

        ctx.fillStyle = "white";
        ctx.fillText("Salud", 280, 20);

        ctx.strokeStyle = "white";
        ctx.strokeRect(25, 5, 250, 20);
    }

    drawOxygen(ctx) {
        const oxygenPercentage = this.oxygen / this.maxOxygen;
        ctx.fillStyle = "#5ac3e7";
        ctx.fillRect(25, 30, 200 * oxygenPercentage, 20);

        ctx.fillStyle = "white";
        ctx.fillText("Oxígeno", 230, 45);

        ctx.strokeStyle = "white";
        ctx.strokeRect(25, 30, 200, 20);
    }

    drawHUD(ctx) {
        ctx.fillStyle = "white";

        //Imagen HUD
        //ctx.drawImage(this.img, 0, 0, 2304, 1728, 0, 0, ctx.canvas.width, ctx.canvas.height);

        //Barra 
        ctx.drawImage(this.img5, 0, ctx.canvas.height - 135, 463, 135);
        //Circulo
        ctx.drawImage(this.img6, ctx.canvas.width - 134, ctx.canvas.height - 111, 134, 111);
    }


    drawWeapons(ctx) {
        const screenX = (ctx.canvas.width - this.width) / 2;
        const screenY = ctx.canvas.height / 2 + this.height;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

                        //(image, dx, dy, dWidth, dHeight)
                        
        // Escopeta (shotgun)
        ctx.drawImage(this.imga, 37, canvasHeight - 100, 85, 85);
        // Ametralladora (machine gun)
        ctx.drawImage(this.img2, 140, canvasHeight - 115, 95, 95);
        // Pistola (pistol)
        ctx.drawImage(this.img3, 262, canvasHeight - 105, 82, 82);

        // Grenade
        ctx.drawImage(this.img4, canvasWidth - 110, canvasHeight - 110, 90, 90);

        ctx.font = "16px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`${this.isRunning ? "Running" : "Walking"}`, screenX, screenY);

        const weapon = this.attackSlots[this.activeSlot];
        ctx.fillText(`Weapon: ${weapon.constructor.name}`, screenX, screenY + 15);
    }

    init(canvas) {
        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const screenCenter = new Vector(canvas.width / 2, canvas.height / 2);
            const offset = new Vector(mouseX - screenCenter.x, mouseY - screenCenter.y);

            if (offset.x !== 0 || offset.y !== 0) {
                this.mouseDirection = offset.normalize();
            }
        });

        canvas.addEventListener("mousedown", (e) => {
            const leftClick = e.button === 0;
            if (leftClick) {
                this.attack();
            }
        });
    }

    attack() {
        const weapon = this.attackSlots[this.activeSlot];
        if (!weapon || typeof weapon.fire !== "function") return;

        const direction = this.mouseDirection.clone();
        weapon.fire(this.real_position.clone(), direction, this);
    }

    die() {
        super.die();
        this.health = this.maxHealth;
        this.oxygen = this.maxOxygen;
    }
}
