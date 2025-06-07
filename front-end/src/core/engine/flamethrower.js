 import { ShootingSystem } from "@engine/shootingsystem.js";
 import { Vector } from "@utils/vector.js";
 
 export class Flamethrower {
   constructor(options = {}) {
     this.config = {
       speed: options.speed || 150,
       damage: options.damage || 1,
       range: options.range || 700,
       projectileType: options.projectileType || "flame",
       projectileCount: options.projectileCount || 15,
       spread: options.spread || 0.2, 
       cooldown: options.cooldown || 0.1, 
     };
 
     this.cooldownTimer = 0;
   }
 
   update(dt) {
     if (this.cooldownTimer > 0) {
       this.cooldownTimer -= dt;
       if (this.cooldownTimer < 0) this.cooldownTimer = 0;
     }
   }
 
   fire(origin, direction, owner = null) {
     if (this.cooldownTimer > 0) return;
 
     const baseAngle = Math.atan2(direction.y, direction.x);
 
     for (let i = 0; i < this.config.projectileCount; i++) {
       const offset = (Math.random() - 0.5) * this.config.spread;
       const angle = baseAngle + offset;
       const dir = new Vector(Math.cos(angle), Math.sin(angle)).normalize();
 
       ShootingSystem.fire({
         origin: origin.clone(),
         direction: dir,
         weaponConfig: this.config,
         owner,
       });
     }
 
     this.cooldownTimer = this.config.cooldown;
   }
 }