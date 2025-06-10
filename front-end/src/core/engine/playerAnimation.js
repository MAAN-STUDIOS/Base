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
    down_pistol: {
        frames: [70, 79], 
        repeat: true,
        duration: animationDelay * 35
    },
    down_machinegun: {
        frames: [90, 99],
        repeat: true,
        duration: animationDelay * 35
    }, 
    down_shotgun: {
        frames: [80, 89],
        repeat: true,
        duration: animationDelay * 35
    },
    down_flamethrower: {
        frames: [100, 109],
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
        duration: animationDelay * 35
    },
    shoot_pistol_right: {
        frames: [70, 79], 
        repeat: true,
        duration: animationDelay * 35
    }, 
    shoot_pistol_left: {
        frames: [17, 26],
        repeat: true,
        duration: animationDelay * 35
    },
    pistol_diagonal_right_up: {
        frames: [110, 111],
        repeat: true,
        duration: animationDelay * 35
    },
    pistol_diagonal_left_up: {
        frames: [116, 117],
        repeat: true,
        duration: animationDelay * 35
    },
    pistol_diagonal_right_down: {
        frames: [114, 115],
        repeat: true,
        duration: animationDelay * 35
    },
    pistol_diagonal_left_down: {
        frames: [112, 113],
        repeat: true,
        duration: animationDelay * 35
    },
    shoot_machinegun_right: {
        frames: [90, 99],
        repeat: true,
        duration: animationDelay * 35
    }, 
    shoot_machinegun_left: {
        frames: [37, 46],
        repeat: true,
        duration: animationDelay * 35
    },
    machinegun_diagonal_right_up: {
        frames: [126, 127],
        repeat: true,
        duration: animationDelay * 35
    },
    machinegun_diagonal_left_up: {
        frames: [132, 133],
        repeat: true,
        duration: animationDelay * 35
    },
    machinegun_diagonal_right_down: {
        frames: [130, 131],
        repeat: true,
        duration: animationDelay * 35
    },
    machinegun_diagonal_left_down: {
        frames: [128, 129],
        repeat: true,
        duration: animationDelay * 35
    },
    shoot_flamethrower_right: {
        frames: [100, 109],
        repeat: true,
        duration: animationDelay * 35
    }, 
    shoot_flamethrower_left: {
        frames: [47, 56],
        repeat: true,
        duration: animationDelay * 35
    },
    flamethrower_diagonal_right_up: {
        frames: [134, 135],
        repeat: true,
        duration: animationDelay * 35
    },
    flamethrower_diagonal_left_up: {
        frames: [140, 141],
        repeat: true,
        duration: animationDelay * 35
    },
    flamethrower_diagonal_right_down: {
        frames: [138, 139],
        repeat: true,
        duration: animationDelay * 35
    },
    flamethrower_diagonal_left_down: {
        frames: [136, 137],
        repeat: true,
        duration: animationDelay * 35
    }, 
    shoot_shotgun_right: {
        frames: [80, 89],
        repeat: true,
        duration: animationDelay * 35
    }, 
    shoot_shotgun_left: {
        frames: [27, 36],
        repeat: true,
        duration: animationDelay * 35
    },
    shotgun_diagonal_right_up: {
        frames: [118, 119],
        repeat: true,
        duration: animationDelay * 35
    },
    shotgun_diagonal_left_up: {
        frames: [124, 125],
        repeat: true,
        duration: animationDelay * 35
    },
    shotgun_diagonal_right_down: {
        frames: [122, 123],
        repeat: true,
        duration: animationDelay * 35
    },
    shotgun_diagonal_left_down: {
        frames: [120, 121],
        repeat: true,
        duration: animationDelay * 35
    },
    dead: {
        frames: [59, 59],
        repeat: true,
        duration: animationDelay * 35
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

export const floodEnemy = {
    idle: {
        frames: [0, 2], 
        repeat: true,
        duration: animationDelay,
    },
    pursue: {
        frames: [3, 5], 
        repeat: true,
        duration: animationDelay,
    },
    search: {
        frames: [6, 8], 
        repeat: true,
        duration: animationDelay,
    },
    attack: {
        frames: [9, 11], 
        repeat: true,
        duration: animationDelay,
    },
    retrack: {
        frames: [12, 14], 
        repeat: true,
        duration: animationDelay,
    },
    retreat: {
        frames: [15, 17], 
        repeat: true,
        duration: animationDelay,
    },
}

export const humanEnemy = {
    idle: {
        frames: [18, 18], 
        repeat: true,
        duration: animationDelay,
    },
    pursue: {
        frames: [21, 23], 
        repeat: true,
        duration: animationDelay,
    },
    search: {
        frames: [27, 28], 
        repeat: true,
        duration: animationDelay,
    },
    attack: {
        frames: [19, 20], 
        repeat: true,
        duration: animationDelay,
    },
    retrack: {
        frames: [22, 23], 
        repeat: true,
        duration: animationDelay,
    },
    retreat: {
        frames: [31, 33], 
        repeat: true,
        duration: animationDelay,
    },
}