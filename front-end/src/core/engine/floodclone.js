import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class FloodClone extends GameObject {
  constructor(options = {}) {
    super(options);
    this.health = 50;
    this.hitbox = new Hitbox(this);
    this.evolution = options.evolution || 1;
    this.speed = 150; // Speed in pixels per second
    this.target = null;
    this.attackRange = 50;
    this.attackCooldown = 0;
    this.visionRadius = 150;
    this.followDistance = 100;
    this.offset = new Vector(0, 0);
    this.player = options.player; // Store reference to the player
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
    const dx = this.target.position.x - this.position.x;
    const dy = this.target.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.attackRange) {
      this._attack(this.target);
    } else {
      const moveSpeed = this.speed * dt;
      if (dx !== 0) this.position.x += (dx / distance) * moveSpeed;
      if (dy !== 0) this.position.y += (dy / distance) * moveSpeed;
    }
  }

  _followPlayer(dt, player) {
    if (!player || !player.position) {
      console.error("Invalid player reference in _followPlayer");
      return;
    }

    const targetX = player.position.x + this.offset.x;
    const targetY = player.position.y + this.offset.y;
    
    const targetDx = targetX - this.position.x;
    const targetDy = targetY - this.position.y;
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

    if (targetDistance > 10) {
      const moveSpeed = this.speed * dt;
      if (targetDx !== 0) this.position.x += (targetDx / targetDistance) * moveSpeed;
      if (targetDy !== 0) this.position.y += (targetDy / targetDistance) * moveSpeed;
    }
  }

  _findVisibleEnemies(enemies) {
    if (!enemies || enemies.length === 0) return [];

    return enemies.filter(enemy => {
      const dx = enemy.position.x - this.position.x;
      const dy = enemy.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= this.visionRadius;
    });
  }

  _findNearestEnemy(enemies) {
    if (!enemies || enemies.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const dx = enemy.position.x - this.position.x;
      const dy = enemy.position.y - this.position.y;
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

    target.takeDamage?.(10);
    this.attackCooldown = now + 2000; // 2 segundos de cooldown
  }

  draw(ctx) {
    // Dibujar el clon
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Dibujar el radio visual (solo para debug)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(this.position.x + this.width/2, this.position.y + this.height/2, this.visionRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Dibujar la barra de vida
    const healthBarWidth = this.width;
    const healthBarHeight = 5;
    const healthPercentage = this.health / 50;

    // Fondo de la barra de vida
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y - 10, healthBarWidth, healthBarHeight);

    // Vida actual
    ctx.fillStyle = "green";
    ctx.fillRect(this.position.x, this.position.y - 10, healthBarWidth * healthPercentage, healthBarHeight);

    // Dibujar cooldown de ataque
    const now = performance.now();
    const attackCooldownRemaining = Math.max(0, this.attackCooldown - now);
    const attackCooldownPercentage = attackCooldownRemaining / 1000;

    ctx.fillStyle = "gray";
    ctx.fillRect(this.position.x, this.position.y - 15, healthBarWidth, 2);
    if (attackCooldownRemaining > 0) {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.position.x, this.position.y - 15, healthBarWidth * (1 - attackCooldownPercentage), 2);
    }
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
