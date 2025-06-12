import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { clonMovement } from "@engine/playerAnimation.js";
import { Rect } from "@utils/rectangle.js";
import SpriteSheet from "@/assets/Flood/Clone/clone-sprites.png";


export class OtherClone extends GameObject {
    constructor(position, player, options = {}) {
        super(options);
        this.health = 300;
        this.maxHealth = 300;
        this.player = player;

        this.evolution = options.evolution || 1;
        this.width = 110;
        this.height = 110;

        this.real_position = position;
        this.isDead = false;
        this.target = this.real_position.clone();

        this.img = new Image();
        this.img.src = SpriteSheet;

        this.spriteRect = new Rect(0, 0, 70, 62);
        this.previousDirection = "down";
        this.currentDirection = "down";
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.repeat = true;
        this.frameDuration = 100;
        this.totalTime = 0;
        this.sheetCols = 8;

        this.hitbox = new Hitbox(this);
    }

    setAnimation(minFrame, maxFrame, repeat, duration) {
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
        this.repeat = repeat;
        this.totalTime = 0;
        this.frameDuration = duration * 1000;
    }

    updateFrame(deltaTime) {
        this.totalTime += deltaTime;

        if (this.totalTime > this.frameDuration) {
            const restartFrame = this.repeat ? this.minFrame : this.frame;
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : restartFrame;

            this.spriteRect.x = this.frame % this.sheetCols;
            this.spriteRect.y = Math.floor(this.frame / this.sheetCols);

            this.totalTime = 0;
        }
    }

    setMovementAnimation() {
        if (!this.currentDirection) this.currentDirection = "idle";
        if (this.currentDirection !== this.previousDirection) {
            const anim = clonMovement[this.currentDirection];
            this.setAnimation(...anim.frames, anim.repeat, anim.duration);
        }

        this.previousDirection = this.currentDirection;
    }


    update(dt) {
        this.real_position.lerpEqual(this.target, 1);

        this.setMovementAnimation();
        this.updateFrame(dt * 1000);
    }


    _attack(target) {
        const now = performance.now();
        if (now < this.attackCooldown) return;

        if (target && typeof target.takeDamage === 'function') {
            target.takeDamage(10);
            this.attackCooldown = now + 500;
        }
    }

    draw(ctx, pm) {
        const screenX = this.real_position.x - this.player.position.x - (pm.x - this.player.position.x) + ctx.canvas.width / 2;
        const screenY = this.real_position.y - this.player.position.y - (pm.y - this.player.position.y) + ctx.canvas.height / 2;

        ctx.save();

        ctx.drawImage(
            this.img,
            this.spriteRect.x * this.spriteRect.width,
            this.spriteRect.y * this.spriteRect.height,
            this.spriteRect.width,
            this.spriteRect.height,
            screenX,
            screenY,
            this.width,
            this.height
        );


        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.visionRadius, 0, 2 * Math.PI);
        ctx.stroke();

        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;

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
        ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.attackRange, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        this.isDead = true;
        if (this.player && this.player.clones) {
            const index = this.player.clones.indexOf(this);
            if (index !== -1) {
                this.player.clones.splice(index, 1);
            }
        }
    }
}