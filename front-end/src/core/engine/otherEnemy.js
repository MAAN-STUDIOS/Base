export class OtherEnemy {
    constructor(position, state = 'IDLE') {
        this.position = position;
        this.target = position.clone();
        this.state = state;
        this.width = 32;
        this.height = 32;
    }

    update() {
        this.position.lerpEqual(this.target, 1.0);
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