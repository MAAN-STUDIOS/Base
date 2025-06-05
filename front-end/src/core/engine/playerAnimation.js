const animationDelay = 0.1;

export const playerMovement = {
    up: {
        frames: [41, 42], 
        repeat: true,
        duration: animationDelay
    }, 
    down: {
        frames: [46, 48], 
        repeat: true,
        duration: animationDelay
    },
    left: {
        frames: [8, 10], //11
        repeat: true,
        duration: animationDelay
    },
    right: {
        frames: [0, 2], //3
        repeat: true,
        duration: animationDelay
    }, 
    idle: {
        frames: [40, 40], 
        repeat: true,
        duration: animationDelay
    },
    shoot_pistol_right: {
        frames: [20, 23], 
        repeat: true,
        duration: animationDelay
    }, 
    shoot_pistol_left: {
        frames: [28, 31],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_machinegun_right: {
        frames: [49, 52],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_machinegun_left: {
        frames: [53, 56],
        repeat: true,
        duration: animationDelay
    },
    shoot_flamethrower_right: {
        frames: [24, 27],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_flamethrower_left: {
        frames: [32, 35],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_right: {
        frames: [4, 7],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_left: {
        frames: [11, 15],
        repeat: true,
        duration: animationDelay
    }, 
};