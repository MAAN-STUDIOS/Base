import SpriteSheet from "@/assets/enemy/enemy.png";
import { floodEnemy } from "@engine/playerAnimation.js";
import { humanEnemy } from "@engine/playerAnimation.js";

export class OtherEnemy {
    constructor(position, state = 'IDLE', type) {
        this.position = position;
        this.target = position.clone();
        this.state = state;
        this.width = 32;
        this.height = 32;
        this.enemyType = type;

        this.img = new Image();
        this.img.src = SpriteSheet;

        this.spriteRect = new Rect(0, 0, 153, 153);
        this.state = STATES.IDLE;
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.repeat = true;
        this.frameDuration = 100;
        this.totalTime = 0;
        this.sheetCols = 6;

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
        const stateAnimations = this.enemyType === 'flood'
            ? {
                'IDLE': floodEnemy.idle,
                'PURSUE': floodEnemy.pursue,
                'SEARCH': floodEnemy.search,
                'ATTACK': floodEnemy.attack,
                'RETREAT': floodEnemy.retreat
            }
            : {
                'IDLE': humanEnemy.idle,
                'PURSUE': humanEnemy.pursue,
                'SEARCH': humanEnemy.search,
                'ATTACK': humanEnemy.attack,
                'RETREAT': humanEnemy.retreat
            };

        const anim = stateAnimations[this.state];

            if (this.state !== this.previousState) {
                this.setAnimation(...anim.frames, anim.repeat, anim.duration);
                this.previousState = this.state;
            }
    }

    update(dt) {
        this.position.lerpEqual(this.target, 1.0);

        this.setMovementAnimation();
        this.updateFrame(dt * 1000);
    }

    draw(ctx, playerPosition, cameraWidth, cameraHeight) {
        const screenX = this.position.x - playerPosition.x + (cameraWidth / 2);
        const screenY = this.position.y - playerPosition.y + (cameraHeight / 2);

        const isNotVisible = (
            screenX < -this.width ||
            screenX > cameraWidth + this.width ||
            screenY < -this.height ||
            screenY > cameraHeight + this.height
        );

        if (isNotVisible) return;

        ctx.drawImage(
            this.img,
            this.spriteRect.x * this.spriteRect.width,
            this.spriteRect.y * this.spriteRect.height,
            this.spriteRect.width,
            this.spriteRect.height,
            screenX - this.width / 2,
            screenY - this.height / 2,
            this.width,
            this.height
        );

        ctx.fillStyle = this.getStateColor();
        ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
    }

    getStateColor() {
        switch (this.state) {
            case 'IDLE':
                return 'blue';
            case 'PURSUE':
                return 'orange';
            case 'SEARCH':
                return 'yellow';
            case 'ATTACK':
                return 'red';
            case 'RETREAT':
                return 'purple';
            default:
                return 'gray';
        }
    }
}