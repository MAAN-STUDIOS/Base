import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class FloodClone extends GameObject {
  constructor(options = {}) {
    super(options);
    this.health = 50;
    this.hitbox = new Hitbox(this);
    this.evolution = options.evolution || 1;
    this.speed = 1.5;
    this.target = null;
    this.attackRange = 50;
    this.attackCooldown = 0;
    this.visionRadius = 150; // Radio de detección de enemigos
    this.followDistance = 100; // Distancia que mantiene del jugador (seguirlo)
    this.offset = new Vector(0, 0); // Offset para evitar superposición
  }

  update(player, enemies) {
    // Actualizar el offset para evitar superposición con otros clones
    this.updateOffset(player);

    // Buscar enemigos en el radio visual
    const visibleEnemies = this.findVisibleEnemies(enemies);
    if (visibleEnemies.length > 0) {
      this.target = this.findNearestEnemy(visibleEnemies);
    } else {
      this.target = null;
    }

    if (this.target) {
      // Calcular dirección hacia el objetivo
      const dx = this.target.position.x - this.position.x;
      const dy = this.target.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Si está en rango de ataque, atacar
      if (distance <= this.attackRange) {
        this.attack(this.target);
      } else {
        // Si no está en rango, moverse hacia el objetivo
        const speed = this.speed;
        if (dx !== 0) this.position.x += (dx / distance) * speed;
        if (dy !== 0) this.position.y += (dy / distance) * speed;
      }
    } else {
      // Si no hay objetivo, seguir al jugador manteniendo la distancia
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calcular la posición objetivo con el offset
      const targetX = player.position.x + this.offset.x;
      const targetY = player.position.y + this.offset.y;
      
      // Calcular la distancia a la posición objetivo
      const targetDx = targetX - this.position.x;
      const targetDy = targetY - this.position.y;
      const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

      if (targetDistance > 10) { // Si no está lo suficientemente cerca de su posición objetivo
        const speed = this.speed;
        if (targetDx !== 0) this.position.x += (targetDx / targetDistance) * speed;
        if (targetDy !== 0) this.position.y += (targetDy / targetDistance) * speed;
      }
    }
  }

  updateOffset(player) {
    // Calcular un offset basado en el índice del clon en el array de clones
    const index = player.clones.indexOf(this);
    if (index !== -1) {
      const angle = (index * (2 * Math.PI / 4)) + (performance.now() / 1000); 
      this.offset.x = Math.cos(angle) * this.followDistance;
      this.offset.y = Math.sin(angle) * this.followDistance;
    }
  }

  findVisibleEnemies(enemies) {
    if (!enemies || enemies.length === 0) return [];

    return enemies.filter(enemy => {
      const dx = enemy.position.x - this.position.x;
      const dy = enemy.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= this.visionRadius;
    });
  }

  findNearestEnemy(enemies) {
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

  attack(target) {
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
    const healthPercentage = this.health / 50; // 50 es la vida máxima

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
    console.log("Clone destroyed");
  }
}
