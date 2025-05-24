import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class FloodClone extends GameObject {
  constructor(options = {}) {
    super(options);
    this.health = 50;
    this.hitbox = new Hitbox(this);
    this.evolution = options.evolution || 1;
    this.speed = 150;
    this.target = null;
    this.visionRadius = 150;
    this.attackRange = 50;
    this.attackCooldown = 0;
    this.followDistance = 100;
    this.player = options.player;
    this.real_position = this.position.clone();
    this.targetWorldPosition = null;
    this.formationOffset = new Vector(0, 0);
    this.comfortZone = 40;
    this.followSpeed = 50;
    this.urgentFollowSpeed = 80;
    this.urgentDistance = 10000;
  }

  update(dt, player, enemies) {
    this.player = this.player || player;
    if (!this.player) {
      console.error("No player reference found for clone");
      return;
    }

    this._updateFormationOffset(this.player);
    this._acquireTarget(enemies);
    
    if (this.target) {
      this._chaseAndAttack(dt);
    } else {
      this._followPlayerInWorldSpace(dt, this.player);
    }
  }

  _updateFormationOffset(player) {
    if (!player || !player.clones) {
      player.clones = [];
    }
    
    const index = player.clones.indexOf(this);
    if (index !== -1) {
      const angle = (index * (2 * Math.PI / 4)) + (performance.now() / 5000);
      this.formationOffset.x = Math.cos(angle) * this.followDistance;
      this.formationOffset.y = Math.sin(angle) * this.followDistance;
    } else {
      player.clones.push(this);
      const newIndex = player.clones.indexOf(this);
      const angle = (newIndex * (2 * Math.PI / 4)) + (performance.now() / 5000);
      this.formationOffset.x = Math.cos(angle) * this.followDistance;
      this.formationOffset.y = Math.sin(angle) * this.followDistance;
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
      this._attack(this.target);
    } else {
      const dtInSeconds = dt > 1 ? dt / 1000 : dt;
      const moveSpeed = this.speed * dtInSeconds;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      this.real_position.x += normalizedDx * moveSpeed;
      this.real_position.y += normalizedDy * moveSpeed;
    }
  }

  _followPlayerInWorldSpace(dt, player) {
    if (!player || !player.real_position) {
      console.error("Invalid player reference in _followPlayer");
      return;
    }

    const idealTarget = new Vector(
      player.real_position.x + this.formationOffset.x,
      player.real_position.y + this.formationOffset.y
    );
    
    if (!this.targetWorldPosition) {
      this.targetWorldPosition = idealTarget.clone();
    } else {
      const targetDx = idealTarget.x - this.targetWorldPosition.x;
      const targetDy = idealTarget.y - this.targetWorldPosition.y;
      
      this.targetWorldPosition.x += targetDx * 0.03;
      this.targetWorldPosition.y += targetDy * 0.03;
    }

    const dx = this.targetWorldPosition.x - this.real_position.x;
    const dy = this.targetWorldPosition.y - this.real_position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.comfortZone) {
      let currentSpeed;
      if (distance > this.urgentDistance) {
        currentSpeed = this.urgentFollowSpeed;
      } else {
        const speedScale = Math.max(0.3, (distance - this.comfortZone) / (this.urgentDistance - this.comfortZone));
        currentSpeed = this.followSpeed * speedScale;
      }
      
      const dtInSeconds = dt > 1 ? dt / 1000 : dt;
      const moveDistance = currentSpeed * dtInSeconds;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const actualMoveDistance = Math.min(moveDistance, distance - this.comfortZone);
      
      this.real_position.x += normalizedDx * actualMoveDistance;
      this.real_position.y += normalizedDy * actualMoveDistance;
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

    if (target && typeof target.takeDamage === 'function') {
      target.takeDamage(10);
      this.attackCooldown = now + 1000;
      console.log("Clone attacked enemy", { 
        targetHealth: target.health,
        cooldown: this.attackCooldown - now 
      });
    }
  }

  draw(ctx) {
    const screenX = this.real_position.x - this.player.real_position.x + ctx.canvas.width / 2;
    const screenY = this.real_position.y - this.player.real_position.y + ctx.canvas.height / 2;

    if (screenX >= -this.width && screenX <= ctx.canvas.width + this.width &&
        screenY >= -this.height && screenY <= ctx.canvas.height + this.height) {

      ctx.fillStyle = this.color || 'lightblue';
      ctx.fillRect(screenX, screenY, this.width, this.height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(screenX + this.width/2, screenY + this.height/2, this.visionRadius, 0, 2 * Math.PI);
      ctx.stroke();

      const healthBarWidth = this.width;
      const healthBarHeight = 5;
      const healthPercentage = this.health / 50;

      ctx.fillStyle = "red";
      ctx.fillRect(screenX, screenY - 10, healthBarWidth, healthBarHeight);

      ctx.fillStyle = "green";
      ctx.fillRect(screenX, screenY - 10, healthBarWidth * healthPercentage, healthBarHeight);

      const now = performance.now();
      const attackCooldownRemaining = Math.max(0, this.attackCooldown - now);
      const attackCooldownPercentage = attackCooldownRemaining / 1000;

      ctx.fillStyle = "gray";
      ctx.fillRect(screenX, screenY - 15, healthBarWidth, 2);
      if (attackCooldownRemaining > 0) {
        ctx.fillStyle = "blue";
        ctx.fillRect(screenX, screenY - 15, healthBarWidth * (1 - attackCooldownPercentage), 2);
      }

      ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.arc(screenX + this.width/2, screenY + this.height/2, this.attackRange, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (this.player && this.player.clones) {
      const index = this.player.clones.indexOf(this);
      if (index !== -1) {
        this.player.clones.splice(index, 1);
      }
    }
    console.log("Clone destroyed");
  }
}