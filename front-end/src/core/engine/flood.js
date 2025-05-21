import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";

export class Flood extends GameObject {
  constructor({ position, width, height, color = "#8b0000" }) {
    super({ position, width, height, color });
    this.health = 150;
    this.mutationLevel = 1;
    this.hitbox = new Hitbox(this);
  }

  mutate() {
    this.mutationLevel++;
    this.health += 20;
    console.log(`Flood mutated to level ${this.mutationLevel}`);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) this.die();
  }

  die() {
    console.log("Flood has been destroyed");
  }
} 