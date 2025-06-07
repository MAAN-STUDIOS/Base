export class OtherEnemy {
    constructor(position, state = 'IDLE') {
        this.position = position;
        this.target = position.clone();
        this.state = state;
        this.width = 32;
        this.height = 32;
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
        const stateAnimations = {
            'IDLE': humanEnemy.idle,
            'PURSUE': humanEnemy.pursue,
            'SEARCH': humanEnemy.search,
            'ATTACK': humanEnemy.attack,
            'RETREAT': humanEnemy.retreat
        };
    
        const anim = stateAnimations[this.state];
    
        if (anim && this.currentDirection !== this.state) {
            this.setAnimation(...anim.frames, anim.repeat, anim.duration);
            this.currentDirection = this.state;
        }
    }
    

    update() {
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