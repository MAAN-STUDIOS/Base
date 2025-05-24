import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class FloodClone extends GameObject {
  constructor(options = {}) {
    super(options);
    this.health = 50;
    this.hitbox = new Hitbox(this);
    this.evolution = options.evolution || 1;
    this.speed = 350; // Speed in pixels per second
    this.target = null;
    this.visionRadius = 150;
    this.attackRange = 50; // Smaller attack range, needs to get closer to attack
    this.attackCooldown = 0;
    this.followDistance = 100;
    this.offset = new Vector(0, 0);
    this.player = options.player; // Store reference to the player
    this.real_position = this.position.clone(); // Add real_position for world coordinates
  }

  update(dt, player, enemies) {
    // Ensure we have a valid player reference
    this.player = this.player || player;
    if (!this.player) {
      console.error("No player reference found for clone");
      return;
    }

    this._updateOffset(this.player);
    this._acquireTarget(enemies);
    
    if (this.target) {
      this._chaseAndAttack(dt);
    } else {
      this._followPlayer(dt, this.player);
    }
  }

  _updateOffset(player) {
    if (!player || !player.clones) {
      player.clones = [];
    }
    
    const index = player.clones.indexOf(this);
    if (index !== -1) {
      const angle = (index * (2 * Math.PI / 4)) + (performance.now() / 1000);
      this.offset.x = Math.cos(angle) * this.followDistance;
      this.offset.y = Math.sin(angle) * this.followDistance;
    } else {
      // If clone is not in the array, add it
      player.clones.push(this);
      // Recalculate index after adding
      const newIndex = player.clones.indexOf(this);
      const angle = (newIndex * (2 * Math.PI / 4)) + (performance.now() / 1000);
      this.offset.x = Math.cos(angle) * this.followDistance;
      this.offset.y = Math.sin(angle) * this.followDistance;
    }
  }

  _acquireTarget(enemies) {
    const visibleEnemies = this._findVisibleEnemies(enemies);
    this.target = visibleEnemies.length > 0 ? this._findNearestEnemy(visibleEnemies) : null;
  }

  _chaseAndAttack(dt) {
    if (!this.target) return;

    const dx = this.target.position.x - this.real_position.x;
    const dy = this.target.position.y - this.real_position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.attackRange) {
      // Attack if in range
      this._attack(this.target);
    } else {
      // Move towards target
      const moveSpeed = this.speed * dt;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      this.real_position.x += normalizedDx * moveSpeed;
      this.real_position.y += normalizedDy * moveSpeed;
    }
  }

  _followPlayer(dt, player) {
    if (!player || !player.real_position) {
      console.error("Invalid player reference in _followPlayer");
      return;
    }

    const targetX = player.real_position.x + this.offset.x;
    const targetY = player.real_position.y + this.offset.y;
    
    const targetDx = targetX - this.real_position.x;
    const targetDy = targetY - this.real_position.y;
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

    if (targetDistance > 10) {
      const moveSpeed = this.speed * dt;
      const normalizedDx = targetDx / targetDistance;
      const normalizedDy = targetDy / targetDistance;
      this.real_position.x += normalizedDx * moveSpeed;
      this.real_position.y += normalizedDy * moveSpeed;
    }
  }

  _findVisibleEnemies(enemies) {
    if (!enemies || enemies.length === 0) return [];

    return enemies.filter(enemy => {
      const dx = enemy.position.x - this.real_position.x;
      const dy = enemy.position.y - this.real_position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= this.visionRadius && enemy.health > 0;
    });
  }

  _findNearestEnemy(enemies) {
    if (!enemies || enemies.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const dx = enemy.position.x - this.real_position.x;
      const dy = enemy.position.y - this.real_position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }

  _attack(target) {
    const now = performance.now();
    if (now < this.attackCooldown) return;

    // Deal damage to the target
    if (target && typeof target.takeDamage === 'function') {
      target.takeDamage(10);
      this.attackCooldown = now + 1000; // 1 second cooldown
      console.log("Clone attacked enemy", { 
        targetHealth: target.health,
        cooldown: this.attackCooldown - now 
      });
    }
  }

  draw(ctx) {
    // Calculate screen position based on player's position
    const screenX = this.real_position.x - this.player.real_position.x + ctx.canvas.width / 2;
    const screenY = this.real_position.y - this.player.real_position.y + ctx.canvas.height / 2;

    // Draw clone
    ctx.fillStyle = this.color;
    ctx.fillRect(screenX, screenY, this.width, this.height);

    // Draw vision radius (debug)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(screenX + this.width/2, screenY + this.height/2, this.visionRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw health bar
    const healthBarWidth = this.width;
    const healthBarHeight = 5;
    const healthPercentage = this.health / 50;

    ctx.fillStyle = "red";
    ctx.fillRect(screenX, screenY - 10, healthBarWidth, healthBarHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(screenX, screenY - 10, healthBarWidth * healthPercentage, healthBarHeight);

    // Draw attack cooldown
    const now = performance.now();
    const attackCooldownRemaining = Math.max(0, this.attackCooldown - now);
    const attackCooldownPercentage = attackCooldownRemaining / 1000;

    ctx.fillStyle = "gray";
    ctx.fillRect(screenX, screenY - 15, healthBarWidth, 2);
    if (attackCooldownRemaining > 0) {
      ctx.fillStyle = "blue";
      ctx.fillRect(screenX, screenY - 15, healthBarWidth * (1 - attackCooldownPercentage), 2);
    }

    // Draw attack range (debug)
    ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(screenX + this.width/2, screenY + this.height/2, this.attackRange, 0, 2 * Math.PI);
    ctx.stroke();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    // Remove clone from player's clones array when destroyed
    if (this.player && this.player.clones) {
      const index = this.player.clones.indexOf(this);
      if (index !== -1) {
        this.player.clones.splice(index, 1);
      }
    }
    console.log("Clone destroyed");
  }
}
