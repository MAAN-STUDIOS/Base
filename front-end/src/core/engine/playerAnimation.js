const animationDelay = 0.1;

export const playerMovement = {
    up: {
        frames: [0, 3], 
        repeat: true,
        duration: animationDelay * 35
    }, 
    down: {
        frames: [60, 69], 
        repeat: true,
        duration: animationDelay * 35
    },
    left: {
        frames: [6, 16],
        repeat: true,
        duration: animationDelay * 35
    },
    right: {
        frames: [60, 69],
        repeat: true,
        duration: animationDelay * 35
    }, 
    idle: {
        frames: [57, 57], 
        repeat: true,
        duration: animationDelay
    },
    shoot_pistol_right: {
        frames: [70, 79], 
        repeat: true,
        duration: animationDelay
    }, 
    shoot_pistol_left: {
        frames: [17, 26],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_right_up: {
        frames: [110, 111],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_left_up: {
        frames: [116, 117],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_right_down: {
        frames: [114, 115],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_left_down: {
        frames: [112, 113],
        repeat: true,
        duration: animationDelay
    },
    shoot_machinegun_right: {
        frames: [90, 99],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_machinegun_left: {
        frames: [37, 46],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_right_up: {
        frames: [125, 126],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_left_up: {
        frames: [131, 132],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_right_down: {
        frames: [129, 130],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_left_down: {
        frames: [127, 128],
        repeat: true,
        duration: animationDelay
    },
    shoot_flamethrower_right: {
        frames: [100, 109],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_flamethrower_left: {
        frames: [47, 56],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_right_up: {
        frames: [133, 134],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_left_up: {
        frames: [137, 138],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_right_down: {
        frames: [139, 140],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_left_down: {
        frames: [135, 136],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_right: {
        frames: [27, 36],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_left: {
        frames: [81, 89],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_right_up: {
        frames: [118, 119],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_left_up: {
        frames: [124, 125],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_right_down: {
        frames: [122, 123],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_left_down: {
        frames: [120, 121],
        repeat: true,
        duration: animationDelay
    },
    dead: {
        frames: [59, 59],
        repeat: true,
        duration: animationDelay
    },
};

export const floodMovement = {
    down: {
      frames: [0, 4],
      repeat: true,
      duration: animationDelay + 2.5,
    },
    downRun: {
      frames: [0, 4],
      repeat: true,
      duration: animationDelay + 1,
    },
    up: {
      frames: [12, 15], 
      repeat: true,
      duration: animationDelay + 3.5,
    },
    upRun: {
      frames: [12, 15], 
      repeat: true,
      duration: animationDelay + 1.5,
    },
    left: {
      frames: [21, 25],
      repeat: true,
      duration: animationDelay + 3.5,
    },
    leftRun: {
      frames: [21, 25], 
      repeat: true,
      duration: animationDelay + 1.5,
    },
    right: {
      frames: [5, 11],
      repeat: true,
      duration: animationDelay + 3.5,
    },
    rightRun: {
      frames: [5, 11], 
      repeat: true,
      duration: animationDelay + 1.5,
    }, 
    death: {
      frames: [29, 30], 
      repeat: false,
      duration: animationDelay + 4.5,
    },
    eat: {
      frames: [26, 28], 
      repeat: true,
      duration: animationDelay + 6.5,
    },
    attack: {
      frames: [15, 19], 
      repeat: true,
      duration: animationDelay + 2.5,
    },
    idle: {
        frames: [0, 0], 
        repeat: true,
        duration: animationDelay + 2.5,
    },
};

export const clonMovement = {
    down: {
      frames: [0, 1],
      repeat: true,
      duration: animationDelay + 4.5,
    },
    up: {
      frames: [2, 4],
      repeat: true,
      duration: animationDelay + 4.5,
    },
    left: {
      frames: [25, 28], 
      repeat: true,
      duration: animationDelay + 4.5,
    },
    right: {
      frames: [16, 19],
      repeat: true,
      duration: animationDelay + 4.5,
    },
    death: {
      frames: [3, 3],
      repeat: false,
      duration: animationDelay + 4.5,
    },
    idle: {
        frames: [0, 0], 
        repeat: true,
        duration: animationDelay,
    },
}
