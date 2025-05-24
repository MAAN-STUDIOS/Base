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
        if (this.alive) {
            console.log("Drawing projectile at", this.position);
            super.draw(ctx);
        }
    }

    onImpact(target) {
        target.receiveDamage?.(this.damage);
        this.alive = false;
    }
}
