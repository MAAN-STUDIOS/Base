
import { Player } from "./objectplayer.js";
import { Hitbox } from "@utils/hitbox.js";
import { FloodClone } from "./floodclone.js";
import { Vector } from "@utils/vector.js";
import eventBus from "@utils/eventbus.js";

export class FloodPlayer extends Player {
  constructor(options = {}) {
    super(options);
    this.biomass = 100;
    this.evolution = 1;
    this.cloneCooldown = 5000; // ms
    this.lastCloneTime = 0;
    this.color = "#8b0000";
    this.hitbox = new Hitbox(this);
    this.clones = [];
    this.evolutionCooldown = 0; // Nuevo cooldown para evolución
    this.attackCooldowns = {
      melee: 0,
      acid: 0,
      toxicSmoke: 0,
      spikes: 0
    };
  }

  infectHuman(human) {
    if (human.infected) return;
    human.infected = true;
    this.biomass += 20;
    console.log("Infected human! Biomass:", this.biomass);
  }

  createClone() {
    const now = performance.now();
    if (now - this.lastCloneTime < this.cloneCooldown || this.biomass < 25) return;

    this.lastCloneTime = now;
    this.biomass -= 25;
    console.log("Clone created. Remaining biomass:", this.biomass);
    
    // Crear el clon en una posición cercana al jugador
    const clonePosition = new Vector(
      this.position.x + 50,  
      this.position.y
    );
    
    const clone = new FloodClone({
      position: clonePosition,
      width: this.width,
      height: this.height,
      color: this.color,
      evolution: this.evolution // Pasar el nivel de evolución al clon
    });

    this.clones.push(clone);
    eventBus.emit("flood:createClone", { 
      position: clonePosition, 
    });
    return clone;
  }

  evolve() {
    const now = performance.now();
    const EVOLUTION_COST = 50;
    const EVOLUTION_COOLDOWN = 2000; // 2 segundos de cooldown

    // Verificar si está en cooldown, si tiene suficiente biomasa y si no está en nivel máximo
    if (now < this.evolutionCooldown || this.biomass < EVOLUTION_COST || this.evolution >= 3) {
      return;
    }

    this.biomass -= EVOLUTION_COST;
    this.evolution++;
    this.evolutionCooldown = now + EVOLUTION_COOLDOWN;
    console.log("Evolved to level", this.evolution);
    this.cloneCooldown = 0; // Resetear el cooldown de clonación
    eventBus.emit("flood:evolve", { level: this.evolution })
  }
  takeDamage(amount) {
    super.takeDamage(amount);
    
    eventBus.emit("entity:takeDamage", {
      entity: "player",
      amount,
      health: this.health,
      position: this.position
    });
  }

  attack(type, target) {
    

    const now = performance.now();
    const cooldown = this.attackCooldowns[type] || 0;
    
    if (now < cooldown) return; // Si está en cooldown, no atacar

    switch (type) {
      case "melee":
        target.takeDamage?.(15);
        this.attackCooldowns.melee = now + 1000; // 1 segundo de cooldown
        break;
      case "acid":
        target.takeDamage?.(5);
        target.status = "corroded";
        this.attackCooldowns.acid = now + 2000; // 2 segundos de cooldown
        break;
      case "toxicSmoke":
        target.status = "confused";
        this.attackCooldowns.toxicSmoke = now + 3000; // 3 segundos de cooldown
        break;
      case "spikes":
        target.takeDamage?.(10);
        this.attackCooldowns.spikes = now + 1500; // 1.5 segundos de cooldown
        break;
    }
    eventBus.emit("player:attack", { 
      type, 
      target: target.id || 'unknown',
      position: this.position
    });
    
  }

  draw(ctx) {
    const colors = ["#8b0000", "#b80000", "#ff3030"];
    this.color = colors[this.evolution - 1];
    super.draw(ctx);

    // Dibujar biomasa y nivel
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(`Biomass: ${this.biomass}`, this.position.x, this.position.y - 20);
    ctx.fillText(`Evo: ${this.evolution}`, this.position.x, this.position.y - 35);

    // Dibujar cooldown de evolución
    const now = performance.now();
    const evolutionCooldownRemaining = Math.max(0, this.evolutionCooldown - now);
    const evolutionCooldownPercentage = evolutionCooldownRemaining / 2000;

    ctx.fillStyle = "gray";
    ctx.fillRect(this.position.x, this.position.y - 50, 50, 3);
    if (evolutionCooldownRemaining > 0) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.position.x, this.position.y - 50, 50 * (1 - evolutionCooldownPercentage), 3);
    }

    // Dibujar cooldown de clonación
    const cloneCooldownRemaining = Math.max(0, this.cloneCooldown - (now - this.lastCloneTime));
    const cloneCooldownPercentage = cloneCooldownRemaining / this.cloneCooldown;
    
    // Barra de cooldown de clonación
    const cooldownBarWidth = 50;
    const cooldownBarHeight = 5;
    ctx.fillStyle = "gray";
    ctx.fillRect(this.position.x, this.position.y - 45, cooldownBarWidth, cooldownBarHeight);
    ctx.fillStyle = "blue";
    ctx.fillRect(this.position.x, this.position.y - 45, cooldownBarWidth * (1 - cloneCooldownPercentage), cooldownBarHeight);

    // Dibujar cooldowns de ataques
    const attackCooldownY = this.position.y - 55;
    Object.entries(this.attackCooldowns).forEach(([type, cooldown], index) => {
      const remaining = Math.max(0, cooldown - now);
      const percentage = remaining / 3000; // Normalizar a 3 segundos
      const x = this.position.x + (index * 15);
      
      ctx.fillStyle = "gray";
      ctx.fillRect(x, attackCooldownY, 10, 3);
      if (remaining > 0) {
        ctx.fillStyle = "red";
        ctx.fillRect(x, attackCooldownY, 10 * (1 - percentage), 3);
      }
    });
  }
}

