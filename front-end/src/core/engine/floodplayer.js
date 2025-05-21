import { Player } from "./objectPlayer.js";
import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import { FloodClone } from "./floodClone.js";
import logger from "@utils/logger.js";

/**
 * Represents a player-controlled flood entity in the game.
 * Handles keyboard input for movement (WASD/arrow keys) and running with Shift.
 * Also manages biomass, evolution, cloning, and attacks.
 * @extends Player
 */
export class FloodPlayer extends Player {
  /**
   * @param {Object} options - Configuration options for the flood player.
   * @param {Vector} options.position - Initial position.
   * @param {number} options.width - Width of the player.
   * @param {number} options.height - Height of the player.
   * @param {number} [options.walkSpeed=12] - Base walking speed.
   * @param {number} [options.runSpeed=120] - Running speed.
   */
  constructor(options = {}) {
    super(options);
    this.biomass = 100;
    this.evolution = 1;
    this.cloneCooldown = 5000;
    this.lastCloneTime = 0;
    this.evolutionCooldown = 0;
    this.attackCooldowns = { melee: 0, acid: 0, toxicSmoke: 0, spikes: 0 };

    /** @type {string} - Color representation based on evolution */
    this.color = "#8b0000";

    /** @type {Hitbox} - Collision detection box */
    this.hitbox = new Hitbox(this);

    /** @type {Array<FloodClone>} - Active clones of this player */
    this.clones = [];

    // Movement setup
    /** @type {number} - Base walking speed */
    this.walkSpeed = options.walkSpeed || 12;
    /** @type {number} - Running speed */
    this.runSpeed = options.runSpeed || 120;
    /** @type {boolean} - Running flag */
    this.isRunning = false;
    /** @type {Vector} - Direction vector for movement */
    this.moveDirection = Vector.zero();
    /** @type {Object} - Key states for movement and running */
    this.keys = { up: false, down: false, left: false, right: false, shift: false };

    this.#setupControls();
    logger.debug("FloodPlayer initialized");
  }

  /**
   * Sets up keyboard event listeners for movement controls.
   * @private
   */
  #setupControls() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          this.keys.up = true;
          break;
        case "s":
        case "ArrowDown":
          this.keys.down = true;
          break;
        case "a":
        case "ArrowLeft":
          this.keys.left = true;
          break;
        case "d":
        case "ArrowRight":
          this.keys.right = true;
          break;
        case "Shift":
          this.keys.shift = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          this.keys.up = false;
          break;
        case "s":
        case "ArrowDown":
          this.keys.down = false;
          break;
        case "a":
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "d":
        case "ArrowRight":
          this.keys.right = false;
          break;
        case "Shift":
          this.keys.shift = false;
          break;
      }
    });

    logger.debug("FloodPlayer controls setup");
  }

  /**
   * Updates movement, clone/evolution cooldowns, and inherited update logic.
   * @param {number} dt - Delta time in seconds.
   * @override
   */
  update(dt) {
    // Movement
    this.moveDirection.clear();
    if (this.keys.up) this.moveDirection.y -= 1;
    if (this.keys.down) this.moveDirection.y += 1;
    if (this.keys.left) this.moveDirection.x -= 1;
    if (this.keys.right) this.moveDirection.x += 1;

    const moving = this.moveDirection.x !== 0 || this.moveDirection.y !== 0;
    if (moving) {
      if (this.moveDirection.x !== 0 && this.moveDirection.y !== 0) {
        this.moveDirection.normalize();
      }
      this.isRunning = this.keys.shift;
      const speed = this.isRunning ? this.runSpeed : this.walkSpeed;
      this.moveDirection.scaleEqual(speed * dt);
      this.position.addEqual(this.moveDirection);
      this.direction = this.moveDirection;
    }

    // Call original behaviors (cooldowns, clones, attacks handled externally)
    // Call base class update for inherited behaviors
    super.update(dt);
  }

  infectHuman(human) {
    if (human.infected) return;
    human.infected = true;
    this.biomass += 20;
    logger.debug(`Infected human! Biomass: ${this.biomass}`);
  }

  createClone() {
    const now = performance.now();
    if (now - this.lastCloneTime < this.cloneCooldown || this.biomass < 25) return;
    this.lastCloneTime = now;
    this.biomass -= 25;
    
    // Create clone with proper initialization
    const clone = new FloodClone({
      position: new Vector(this.position.x + 50, this.position.y),
      width: this.width,
      height: this.height,
      color: this.color,
      evolution: this.evolution,
      player: this
    });

    // Ensure the clone is added to our clones array
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
    logger.debug(`Evolved to level ${this.evolution}`);
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
      case "spikes":
        target.takeDamage?.(10);
        this.attackCooldowns.spikes = now + 1500;
        break;
    }
    logger.debug(`Attack ${type} executed on target`);
  }

  /**
   * Draws the flood player, biomass, evolution, and cooldown bars.
   * @param {CanvasRenderingContext2D} ctx - Rendering context.
   * @override
   */
  draw(ctx) {
    const colors = ["#8b0000", "#b80000", "#ff3030"];
    this.color = colors[this.evolution - 1];
    super.draw(ctx);

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
}
