import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";

export class Projectile extends GameObject {
  constructor({
      id,
    position,
    direction,
    speed,
    damage,
    range,
    type = "bullet",
    owner = null,
  }) {
    super({ position, width: 10, height: 10, color: "yellow" });
    this.direction = direction;
    this.speed = speed;
    this.damage = damage;
    this.range = range;
    this.traveled = 0;
    this.type = type;
    this.alive = true;
    this.owner = owner;
    this.id = id;

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

  draw(ctx, p) {
    let screenX;
    let screenY;

    const isNotLocalShoot = !this.owner.amazing;
    if (isNotLocalShoot) {
      screenX =
          this.position.x - this.owner.real_position.x - (p.x - this.owner.real_position.x) + ctx.canvas.width / 2;
      screenY =
          this.position.y - this.owner.real_position.y - (p.y - this.owner.real_position.y) + ctx.canvas.height / 2;
    } else {
      screenX =
          this.position.x - this.owner.real_position.x + ctx.canvas.width / 2;
      screenY =
          this.position.y - this.owner.real_position.y + ctx.canvas.height / 2;

    }

    if (this.type === "flame") {
      const radius = 8 + Math.random() * 4;
      const red = 255;
      const green = Math.floor(120 + Math.random() * 80); // entre 120 y 200
      const alpha = 1 + Math.random() * 0.4;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${red}, ${green}, 0, ${alpha.toFixed(2)})`;
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (!this.alive || !this.owner) return;

      // const screenCenter = new Vector(
      //   ctx.canvas.width / 2,
      //   ctx.canvas.height / 2
      // );
      // const cameraOffset = new Vector(
      //   this.position.x - this.owner.real_position.x,
      //   this.position.y - this.owner.real_position.y
      // );

      const drawX = screenX - this.width / 2;
      const drawY = screenY - this.height / 2;

      ctx.fillStyle = this.color;
      ctx.fillRect(drawX, drawY, this.width, this.height);
    }
  }

  /**
   *
   * @param {Enemy|Player} target
   */
  onImpact(target) {
   if (this.owner === target) return;

    target.takeDamage?.(this.damage);
    this.alive = false;
  }
}