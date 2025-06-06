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

export const floodMovement = {
    down: {
      frames: [0, 4],
      repeat: true,
      duration: animationDelay,
    },
    up: {
      frames: [5, 7], //10
      repeat: true,
      duration: animationDelay,
    },
    left: {
      frames: [11, 14],
      repeat: true,
      duration: animationDelay,
    },
    leftRun: {
      frames: [20, 23], //16 17 18
      repeat: true,
      duration: animationDelay * 0.6,
    },
    right: {
      frames: [11, 14],
      repeat: true,
      duration: animationDelay,
    },
    rightRun: {
      frames: [20, 23], //16 17 18
      repeat: true,
      duration: animationDelay * 0.6,
    }, 
    death: {
      frames: [26, 27], 
      repeat: false,
      duration: animationDelay * 0.8,
    },
    eat: {
      frames: [23, 24], //15
      repeat: true,
      duration: animationDelay * 0.8,
    },
    attack: {
      frames: [11, 13], //17
      repeat: true,
      duration: animationDelay * 0.8,
    },
    idle: {
        frames: [0, 0], //17
        repeat: true,
        duration: animationDelay,
    },
};

export const clonMovement = {
    down: {
      frames: [0, 1],
      repeat: true,
      duration: animationDelay,
    },
    up: {
      frames: [2, 4],
      repeat: true,
      duration: animationDelay,
    },
    left: {
      frames: [5, 7], //9
      repeat: true,
      duration: animationDelay,
    },
    leftRun: {
      frames: [8, 10], //12-13
      repeat: true,
      duration: animationDelay * 0.6,
    },
    right: {
      frames: [16, 17], //14 22
      repeat: true,
      duration: animationDelay,
    },
    rightRun: {
      frames: [14, 21], 
      repeat: true,
      duration: animationDelay * 0.6,
    },
    death: {
      frames: [3, 3],
      repeat: false,
      duration: animationDelay * 0.8,
    },
    idle: {
        frames: [0, 0], //17
        repeat: true,
        duration: animationDelay,
    },
}
