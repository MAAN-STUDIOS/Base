const animationDelay = 0.1;

export const playerMovement = {
    up: {
        frames: [31, 34], 
        repeat: true,
        duration: animationDelay
    }, 
    down: {
        frames: [2, 4], 
        repeat: true,
        duration: animationDelay
    },
    left: {
        frames: [0, 0],
        repeat: true,
        duration: animationDelay
    },
    right: {
        frames: [1, 1],
        repeat: true,
        duration: animationDelay
    }, 
    idle: {
        frames: [2, 2], 
        repeat: true,
        duration: animationDelay
    },
    shoot_pistol_right: {
        frames: [6, 6], 
        repeat: true,
        duration: animationDelay
    }, 
    shoot_pistol_left: {
        frames: [5, 5],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_right_up: {
        frames: [7, 7],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_left_up: {
        frames: [8, 8],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_right_down: {
        frames: [10, 10],
        repeat: true,
        duration: animationDelay
    },
    pistol_diagonal_left_down: {
        frames: [9, 9],
        repeat: true,
        duration: animationDelay
    },
    shoot_machinegun_right: {
        frames: [18, 18],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_machinegun_left: {
        frames: [17, 17],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_right_up: {
        frames: [19, 19],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_left_up: {
        frames: [20, 20],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_right_down: {
        frames: [22, 22],
        repeat: true,
        duration: animationDelay
    },
    machinegun_diagonal_left_down: {
        frames: [21, 21],
        repeat: true,
        duration: animationDelay
    },
    shoot_flamethrower_right: {
        frames: [24, 24],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_flamethrower_left: {
        frames: [23, 23],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_right_up: {
        frames: [25, 25],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_left_up: {
        frames: [26, 26],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_right_down: {
        frames: [28, 28],
        repeat: true,
        duration: animationDelay
    },
    flamethrower_diagonal_left_down: {
        frames: [27, 27],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_right: {
        frames: [12, 12],
        repeat: true,
        duration: animationDelay
    }, 
    shoot_shotgun_left: {
        frames: [11, 11],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_right_up: {
        frames: [13, 13],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_left_up: {
        frames: [14, 14],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_right_down: {
        frames: [16, 16],
        repeat: true,
        duration: animationDelay
    },
    shotgun_diagonal_left_down: {
        frames: [15, 15],
        repeat: true,
        duration: animationDelay
    },
    dead: {
        frames: [29, 30],
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
