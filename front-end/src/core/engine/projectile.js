import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class Projectile extends GameObject {
    constructor({ position, direction, speed, damage, range, type = "bullet", owner = null }) {
        super({ position, width: 10, height: 10, color: "yellow" });
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.range = range; //antes de desaparecer
        this.traveled = 0;
        this.type = type;
        this.alive = true;
        this.owner = owner; //human or flood

        this.hitbox = new Hitbox(this);
    }

    update(delta) {
        //si ya colisionó o se paso de rango
        if (!this.alive) return;

        //d=v*t
        const step = this.speed * delta;
        this.position.x += this.direction.x * step;
        this.position.y += this.direction.y * step;
        this.traveled += step;

        if (this.traveled > this.range) {
            this.alive = false;
        }

    }

    draw(ctx) {
        if (!this.alive || !this.owner) return;
    
        const screenCenter = new Vector(ctx.canvas.width / 2, ctx.canvas.height / 2);
        const cameraOffset = new Vector(this.position.x - this.owner.real_position.x, this.position.y - this.owner.real_position.y);
          
        const drawX = screenCenter.x + cameraOffset.x - this.width / 2;
        const drawY = screenCenter.y + cameraOffset.y - this.height / 2;
    
        //console.log(`Drawing projectile at screen coords: (${drawX.toFixed(2)}, ${drawY.toFixed(2)}), world pos: ${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}`);
    
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, drawY, this.width, this.height);
    }
    

    onImpact(target) {
        target.receiveDamage?.(this.damage);
        this.alive = false;
    }
}
