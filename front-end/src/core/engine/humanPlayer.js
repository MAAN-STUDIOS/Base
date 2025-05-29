import { Player } from "@engine/objectPlayer.js";
import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import logger from "@utils/logger.js";
import HUD from "@/assets/HUD/fondo.png"

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
     * Here we can review the both bars usages rates, as well as the runnig speed
     */
    constructor(position, options = {}) {
        // Example set up
        // TODO: Improve when implement game engine.
        super({ position, ...options });

        this.walkSpeed = options.walkSpeed || 12;
        this.runSpeed = options.runSpeed || this.walkSpeed + 50;
        this.isRunning = false;

        //Set up 
        this.maxHealth = 100;
        this.maxOxygen = 100;
        this.health = this.maxHealth;
        this.oxygen = this.maxOxygen;

        //Estados iniciales 
        this.isDamaged = false; //Daño a salud 
        this.isReduce = false;  //Reducción de oxígeno 

        //Tasas de uso REVISAR 
        this.oxygenUse = 10;       //Uso de oxígeno al correr  
        this.oxygenReload = 0.3;  //Recarga de oxígeno al dejar de correr 
        this.healthDamage = 1;    //Daño del flood hacia humano 
        this.healthRecover = 0.4;   //Recarga de salud al no recibir daño

        this.healthTimer = 0;
        this.oxygenTimer = 0;


        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = new Hitbox(this);

        /** @type {Vector} */
        this.real_position = position.clone();

        /** @type {Vector} */
        this.moveDirection = Vector.zero();

        /** @type {string} - Color representation for the player. */
        this.color = "#2a52be";


        this.lastDirection = new Vector(1, 0);

        //this.attackCooldown = 0.3;
        //this.timeSinceLastAttack = this.attackCooldown;
        this.mouseDirection = new Vector(1, 0);

        this.attackSlots = options.attackSlots || [];
        this.activeSlot = 0;
        this.img = new Image();
        this.img.src = HUD;


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
                    this.keys.shift = state && this.oxygen > 20;
                }
                if (state && (key === ' ' || key === 'f')) {
                    this.attack();
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

            // Corregido: Solo puede correr si tiene oxígeno
            this.isRunning = this.keys.shift && this.oxygen > 0;
            const speed = this.isRunning ? this.runSpeed : this.walkSpeed;

            const frameAdjustedSpeed = speed * dt;
            this.moveDirection.scaleEqual(frameAdjustedSpeed);

            this.real_position.addEqual(this.moveDirection);
            this.direction = this.moveDirection;
        } else {
            // Cuando no se mueve, no está corriendo
            this.isRunning = false;
        }

        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.lastDirection = this.direction.clone();
        }

        //Sistema de oxígeno
        if (this.isRunning) {
            // Consume oxígeno solo cuando está corriendo
            this.oxygenTimer += dt;
            if (this.oxygenTimer >= 5.0) {
                this.oxygen -= this.oxygenUse;
                if (this.oxygen < 0) this.oxygen = 0;
                this.oxygenTimer = 0;
            }
        } else if (this.oxygen < this.maxOxygen) {
            // Regenera oxígeno solo cuando NO está corriendo
            this.oxygen += this.oxygenReload * dt;
            if (this.oxygen > this.maxOxygen) this.oxygen = this.maxOxygen;
        }

        // Sistema de salud
        if (this.health < this.maxHealth) {
            this.healthTimer += dt;
            if (this.healthTimer >= 3.0) {
                this.health += 1;
                if (this.health > this.maxHealth) this.health = this.maxHealth;
                this.healthTimer = 0;
            }
        } 
    }



    /**
     * Renders the player on the canvas.
     * Draws the player and displays current movement status.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @override
     * Draw the life and oxigen barts for the human player, every bar have a white border
     */
    draw(ctx) {
        //super.draw(ctx);

        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = "red"; 
        ctx.fillRect(25, 5, 250 * healthPercentage, 20);   

        ctx.fillStyle = "white";
        ctx.fillText("Salud", 280, 20); 
        
        ctx.strokeStyle = "white";
        ctx.strokeRect(25, 5, 250, 20);
        
        ctx.fillStyle = "white";
        
        const oxygenPercentage = this.oxygen / this.maxOxygen;
        ctx.fillStyle = "#5ac3e7";
        ctx.fillRect(25, 30, 200 * oxygenPercentage, 20); 

        ctx.fillStyle = "white";
        ctx.fillText("Oxígeno", 230, 45);
        
        ctx.strokeStyle = "white";
        ctx.strokeRect(25, 30, 200, 20);
        
        ctx.fillStyle = "white";

        //Imagen HUD
        ctx.drawImage(this.img, 0, 0, 2304, 1728, 0, 0, ctx.canvas.width, ctx.canvas.height); 

        
        ctx.font = "16px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`${this.isRunning ? "Running" : "Walking"}`, this.position.x, this.position.y - 15);

        const weapon = this.attackSlots[this.activeSlot];
        ctx.fillText(`Weapon: ${weapon.constructor.name}`, this.position.x, this.position.y - 30);

    }

    initMouseTracking() {
        const canvas = document.querySelector("canvas");
    
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
    }
    
    attack() {
        const weapon = this.attackSlots[this.activeSlot];
        if (!weapon || typeof weapon.fire !== "function") return;

        const direction = this.mouseDirection.clone();
        weapon.fire(this.real_position.clone(), direction, this);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0; 
            this.die(); 
        }
    }

    die() {
        super.die();
        this.health = this.maxHealth;
        this.oxygen = this.maxOxygen;
    }
}

