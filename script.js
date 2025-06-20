let currentLevel = 45; // 시작 레벨 15 * 3
let currentStage = 1;
let currentBetUnit = 0;
let totalUnits = 45; // 시작 유닛은 레벨 15부터 15 * 3으로 가정합니다.
let winStreak = 0; // 연속 승리 카운터 (0: 첫 베팅, 1: 첫 베팅 승리 후 다음 베팅)
let betHistory = []; // 이전 상태를 저장할 배열 (이전 단계 버튼용)

// 각 레벨 및 단계별 베팅 규칙 정의
const levelMap = {
    9: { // 3 * 3
        1: { bet: 9, win: { type: 'goto', level: 18 }, lose: { type: 'gameOver' } } // bet: 3 * 3, level: 6 * 3
    },
    12: { // 4 * 3
        1: { bet: 12, win: { type: 'goto', level: 24 }, lose: { type: 'gameOver' } } // bet: 4 * 3, level: 8 * 3
    },
    15: { // 5 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 9, win: { type: 'calcLevelSubUnit', subtract: 6 }, lose: { type: 'gameOver' } } // bet: 3 * 3, subtract: 2 * 3
    },
    18: { // 6 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 12, win: { type: 'calcLevelSubUnit', subtract: 6 }, lose: { type: 'gameOver' } } // bet: 4 * 3, subtract: 2 * 3
    },
    21: { // 7 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 15, win: { type: 'calcLevelSubUnit', subtract: 6 }, lose: { type: 'gameOver' } } // bet: 5 * 3, subtract: 2 * 3
    },
    24: { // 8 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 18, win: { type: 'calcLevelSubUnit', subtract: 6 }, lose: { type: 'gameOver' } } // bet: 6 * 3, subtract: 2 * 3
    },
    27: { // 9 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 21, win: { type: 'calcLevelSubUnit', subtract: 6 }, lose: { type: 'gameOver' } } // bet: 7 * 3, subtract: 2 * 3
    },
    30: { // 10 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 21, win: { type: 'goto', level: 42 }, lose: { type: 'gameOver' } } // bet: 7 * 3, level: 14 * 3
    },
    33: { // 11 * 3
        1: { bet: 6, win: { type: 'calcLevelSumCurrentLevel', units: [6] }, lose: { type: 'goto', stage: 2 } }, // bet: 2 * 3, units: [2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 21, win: { type: 'goto', level: 42 }, lose: { type: 'gameOver' } } // bet: 7 * 3, level: 14 * 3
    },
    36: { // 12 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 3 * 3
        4: { bet: 21, win: { type: 'goto', level: 42 }, lose: { type: 'gameOver' } } // bet: 7 * 3, level: 14 * 3
    },
    39: { // 13 * 3
        1: { bet: 6, win: { type: 'calcLevelSumCurrentLevel', units: [6] }, lose: { type: 'goto', stage: 2 } }, // bet: 2 * 3, units: [2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 3 * 3
        4: { bet: 21, win: { type: 'goto', level: 42 }, lose: { type: 'gameOver' } } // bet: 7 * 3, level: 14 * 3
    },
    42: { // 14 * 3
        1: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevel', units: [6, 12] }, lose: { type: 'goto', stage: 2 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3]
        2: { bet: 9, win: { type: 'goto', level: 45 }, lose: { type: 'goto', stage: 3 } }, // bet: 3 * 3, level: 15 * 3
        3: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 15 }, lose: { type: 'gotoLevel', level: 18 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 5 * 3, level: 6 * 3
    },
    45: { // 15 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    48: { // 16 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    51: { // 17 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    54: { // 18 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    57: { // 19 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    60: { // 20 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    63: { // 21 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet: 3 * 3, units: [3 * 3], subtract: 3 * 3
        4: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 18 }, lose: { type: 'calcLevelSubCurrentLevel', subtract: 27 } } // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 6 * 3, subtract: 9 * 3
    },
    66: { // 22 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 3 * 3
        4: {
            bet1: 27, bet2: 9, // bet1: 9 * 3, bet2: 3 * 3
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [27, 9], subtract: 18 }, // units: [9 * 3, 3 * 3], subtract: 6 * 3
            lose: { type: 'specialLoseLevel22_4' }
        }
    },
    69: { // 23 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 3 * 3
        4: {
            bet1: 27, bet2: 9, // bet1: 9 * 3, bet2: 3 * 3
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [27, 9], subtract: 18 }, // units: [9 * 3, 3 * 3], subtract: 6 * 3
            lose: { type: 'specialLoseLevel23_4' }
        }
    },
    72: { // 24 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 18, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 18], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 6 * 3, units: [3 * 3, 6 * 3], subtract: 3 * 3
        4: {
            bet1: 27, bet2: 9, // bet1: 9 * 3, bet2: 3 * 3
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [27, 9], subtract: 18 }, // units: [9 * 3, 3 * 3], subtract: 6 * 3
            lose: { type: 'specialLoseLevel24_4' }
        }
    },
    75: { // 25 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 12], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 4 * 3, units: [2 * 3, 4 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 15, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 15], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 5 * 3, units: [3 * 3, 5 * 3], subtract: 3 * 3
        4: {
            bet1: 27, bet2: 6, // bet1: 9 * 3, bet2: 2 * 3
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [27, 6], subtract: 18 }, // units: [9 * 3, 2 * 3], subtract: 6 * 3
            lose: { type: 'specialLoseLevel25_4' }
        }
    },
    78: { // 26 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 9], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 3 * 3, units: [2 * 3, 3 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 12, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 12], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 4 * 3, units: [3 * 3, 4 * 3], subtract: 3 * 3
        4: {
            bet1: 27, bet2: 3, // bet1: 9 * 3, bet2: 1 * 3
            win: { type: 'calcLevelSumCurrentLevelSubtract', units: [27, 3], subtract: 18 }, // units: [9 * 3, 1 * 3], subtract: 6 * 3
            lose: { type: 'specialLoseLevel26_4' }
        }
    },
    81: { // 27 * 3
        1: { bet1: 3, bet2: 6, win: { type: 'calcLevelSumCurrentLevel', units: [3, 6] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 2 * 3, units: [1 * 3, 2 * 3]
        2: { bet1: 6, bet2: 6, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 6], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 2 * 3, units: [2 * 3, 2 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 9, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 9], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 3 * 3, units: [3 * 3, 3 * 3], subtract: 3 * 3
        4: { bet: 27, win: { type: 'goto', level: 90 }, lose: { type: 'gotoLevel', level: 36 } } // bet: 9 * 3, level: 30 * 3, level: 12 * 3
    },
    84: { // 28 * 3
        1: { bet1: 3, bet2: 3, win: { type: 'calcLevelSumCurrentLevel', units: [3, 3] }, lose: { type: 'goto', stage: 2 } }, // bet1: 1 * 3, bet2: 1 * 3, units: [1 * 3, 1 * 3]
        2: { bet1: 6, bet2: 3, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [6, 3], subtract: 3 }, lose: { type: 'goto', stage: 3 } }, // bet1: 2 * 3, bet2: 1 * 3, units: [2 * 3, 1 * 3], subtract: 1 * 3
        3: { bet1: 9, bet2: 6, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 6], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 2 * 3, units: [3 * 3, 2 * 3], subtract: 3 * 3
        4: { bet: 24, win: { type: 'goto', level: 90 }, lose: { type: 'gotoLevel', level: 42 } } // bet: 8 * 3, level: 30 * 3, level: 14 * 3
    },
    87: { // 29 * 3
        1: { bet: 3, win: { type: 'goto', level: 90 }, lose: { type: 'goto', stage: 2 } }, // bet: 1 * 3, level: 30 * 3
        2: { bet: 6, win: { type: 'goto', level: 90 }, lose: { type: 'goto', stage: 3 } }, // bet: 2 * 3, level: 30 * 3
        3: { bet1: 9, bet2: 3, win: { type: 'calcLevelSumCurrentLevelSubtract', units: [9, 3], subtract: 9 }, lose: { type: 'goto', stage: 4 } }, // bet1: 3 * 3, bet2: 1 * 3, units: [3 * 3, 1 * 3], subtract: 3 * 3
        4: { bet: 21, win: { type: 'goto', level: 90 }, lose: { type: 'gotoLevel', level: 48 } } // bet: 7 * 3, level: 30 * 3, level: 16 * 3
    },
    90: { // 30 * 3
        1: { bet: 30, win: { type: 'gameWin' }, lose: { type: 'gameOver' } } // bet: 10 * 3
    }
};

// DOM 요소 가져오기
const currentLevelEl = document.getElementById('currentLevel');
const currentStageEl = document.getElementById('currentStage');
const currentBetUnitEl = document.getElementById('currentBetUnit');
const totalUnitsEl = document.getElementById('totalUnits');
const messageEl = document.getElementById('message');
const winButton = document.getElementById('winButton');
const loseButton = document.getElementById('loseButton');
const resetButton = document.getElementById('resetButton');
const undoButton = document.getElementById('undoButton');

// 게임 초기화 함수
function initializeGame() {
    currentLevel = 45; // 시작 레벨 15 * 3로 변경
    currentStage = 1;
    totalUnits = 45; // 시작 유닛 15 * 3로 변경
    winStreak = 0; // 연속 승리 카운터 리셋
    betHistory = []; // 기록 초기화
    updateDisplay(); // 화면 업데이트
    messageEl.textContent = `게임 시작! 레벨 ${currentLevel}, ${currentStage}단계.`;
    messageEl.classList.remove('win', 'lose'); // 메시지 클래스 초기화
    enableButtons(); // 버튼 활성화
}

// 디스플레이 업데이트 함수
function updateDisplay() {
    const levelData = levelMap[currentLevel];
    if (levelData && levelData[currentStage]) {
        const stageData = levelData[currentStage];
        // winStreak 값에 따라 bet1 또는 bet2를 사용
        if (stageData.bet) { // 단일 베팅이 정의된 경우
            currentBetUnit = stageData.bet;
        } else if (stageData.bet1 && stageData.bet2) { // 2단계 베팅이 정의된 경우
            currentBetUnit = winStreak === 0 ? stageData.bet1 : stageData.bet2;
        } else {
            currentBetUnit = 0; // 정의되지 않은 경우
        }
    } else {
        currentBetUnit = 0; // 정의되지 않은 레벨/단계 (새로운 레벨이 추가되어야 할 때 발생 가능)
    }

    currentLevelEl.textContent = currentLevel;
    currentStageEl.textContent = currentStage;
    currentBetUnitEl.textContent = currentBetUnit;
    totalUnitsEl.textContent = totalUnits;

    // 게임 승리 조건 확인
    if (totalUnits >= 90) { // 30 * 3
        gameWin("축하합니다! 총 유닛이 90에 도달하여 게임에 승리했습니다!"); // 30 * 3
        return; // 승리 시 추가 로직 실행 방지
    }
    // 게임 패배 조건 확인 (초기화 시점 제외)
    // totalUnits가 0 이하가 되면 게임 오버. 단, 초기 totalUnits가 45일 때는 예외.
    if (totalUnits <= 0 && !(currentLevel === 45 && currentStage === 1 && totalUnits === 45)) { // currentLevel: 15 * 3, totalUnits: 15 * 3
        gameOver("총 유닛이 0이거나 0 미만이 되어 게임에 패배했습니다.");
        return; // 패배 시 추가 로직 실행 방지
    }

    // 이전 단계 버튼 활성화/비활성화 상태 업데이트
    undoButton.disabled = betHistory.length === 0;
}

// 게임 승리 처리 함수
function gameWin(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('lose');
    messageEl.classList.add('win'); // 승리 메시지 스타일 적용
    disableButtons();
    currentLevelEl.textContent = "승리";
    currentStageEl.textContent = "승리";
    currentBetUnitEl.textContent = "0";
}

// 게임 패배 처리 함수
function gameOver(msg) {
    messageEl.textContent = msg;
    messageEl.classList.remove('win');
    messageEl.classList.add('lose'); // 패배 메시지 스타일 적용
    disableButtons();
    currentLevelEl.textContent = "패배";
    currentStageEl.textContent = "패배";
    currentBetUnitEl.textContent = "0";
}

// 버튼 비활성화 함수
function disableButtons() {
    winButton.disabled = true;
    loseButton.disabled = true;
    undoButton.disabled = true;
}

// 버튼 활성화 함수
function enableButtons() {
    winButton.disabled = false;
    loseButton.disabled = false;
    // 이전 단계 버튼은 기록이 있을 때만 활성화
    undoButton.disabled = betHistory.length === 0;
}

// 현재 게임 상태 저장 (이전 단계 버튼용)
function saveState() {
    betHistory.push({
        level: currentLevel,
        stage: currentStage,
        totalUnits: totalUnits,
        winStreak: winStreak
    });
}

// 승리 버튼 클릭 핸들러
function handleWin() {
    saveState(); // 현재 상태 저장

    const levelData = levelMap[currentLevel];
    if (!levelData || !levelData[currentStage]) {
        messageEl.textContent = "오류: 현재 레벨/단계 데이터가 정의되지 않았습니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    const stageData = levelData[currentStage];
    let unitsWon = currentBetUnit; // 기본적으로 현재 베팅 유닛만큼 획득

    // 총 유닛 증가
    totalUnits += unitsWon;

    // 승리 로직 처리
    if (stageData.win.type === 'goto') {
        currentLevel = stageData.win.level;
        currentStage = 1;
        winStreak = 0; // 레벨 이동 시 연속 승리 리셋
        messageEl.textContent = `승리! 레벨 ${currentLevel}로 이동합니다.`;
    } else if (stageData.win.type === 'calcLevelSumCurrentLevel') {
        winStreak++;
        if (winStreak === 2) { // 2연승
            const sumOfBetUnits = stageData.win.units.reduce((sum, u) => sum + u, 0);
            currentLevel += sumOfBetUnits;
            currentStage = 1;
            winStreak = 0; // 2연승 달성 후 연속 승리 리셋
            messageEl.textContent = `2연승! 레벨 ${currentLevel}로 이동합니다.`;
        } else { // 1연승
            messageEl.textContent = `승리! 2번째 베팅(${stageData.bet2}유닛)을 시도합니다.`;
        }
    } else if (stageData.win.type === 'calcLevelSumCurrentLevelSubtract') {
        winStreak++;
        if (winStreak === 2 || !stageData.bet1 || !stageData.bet2) { // 2연승이거나 단일 베팅인데 해당 타입인 경우
            const sumOfBetUnits = stageData.win.units.reduce((sum, u) => sum + u, 0);
            currentLevel += sumOfBetUnits - stageData.win.subtract;
            currentStage = 1;
            winStreak = 0;
            messageEl.textContent = `승리! 레벨 ${currentLevel}로 이동합니다.`;
        } else { // 1연승
            messageEl.textContent = `승리! 2번째 베팅(${stageData.bet2}유닛)을 시도합니다.`;
        }
    } else if (stageData.win.type === 'gameWin') {
        gameWin("최종 목표 달성! 게임에 승리했습니다!");
        return;
    } else {
        messageEl.textContent = "오류: 알 수 없는 승리 규칙입니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    updateDisplay();
}

// 패배 버튼 클릭 핸들러
function handleLose() {
    saveState(); // 현재 상태 저장

    const levelData = levelMap[currentLevel];
    if (!levelData || !levelData[currentStage]) {
        messageEl.textContent = "오류: 현재 레벨/단계 데이터가 정의되지 않았습니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    const stageData = levelData[currentStage];
    let unitsLost = currentBetUnit; // 현재 베팅 유닛만큼 손실

    // 총 유닛 감소
    totalUnits -= unitsLost;

    // 연속 승리 카운터 리셋
    winStreak = 0;

    // 패배 로직 처리
    if (stageData.lose.type === 'gameOver') {
        gameOver("베팅 패배로 유닛이 소진되었습니다.");
    } else if (stageData.lose.type === 'goto') {
        currentStage = stageData.lose.stage;
        messageEl.textContent = `패배! ${currentStage}단계로 이동합니다.`;
    } else if (stageData.lose.type === 'gotoLevel') {
        currentLevel = stageData.lose.level;
        currentStage = 1; // 레벨 이동 시 1단계로 리셋
        messageEl.textContent = `패배! 레벨 ${currentLevel}로 이동합니다.`;
    } else if (stageData.lose.type === 'calcLevelSubCurrentLevel') {
        currentLevel -= stageData.lose.subtract;
        currentStage = 1; // 레벨 이동 시 1단계로 리셋
        messageEl.textContent = `패배! 레벨 ${currentLevel}로 이동합니다.`;
    }
    // 레벨 22-26의 4단계 특수 패배 로직
    else if (stageData.lose.type && stageData.lose.type.startsWith('specialLoseLevel')) {
        let nextLevel = currentLevel;
        // 패배한 베팅 유닛이 첫 번째 베팅 유닛(bet1)과 같으면 1번째 패배로 간주
        // 아니면 (대부분 2번째 베팅 유닛 bet2에서 패배한 경우) 2번째 패배로 간주
        if (unitsLost === stageData.bet1) {
            nextLevel = currentLevel - 45; // 15 * 3
            messageEl.textContent = `패배! (1번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
        } else if (unitsLost === stageData.bet2) {
            if (stageData.lose.type === 'specialLoseLevel25_4') {
                nextLevel = currentLevel + 3; // 1 * 3
                messageEl.textContent = `패배! (2번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
            } else if (stageData.lose.type === 'specialLoseLevel26_4') {
                nextLevel = currentLevel + 6; // 2 * 3
                messageEl.textContent = `패배! (2번째 베팅 실패) 레벨 ${nextLevel}로 이동합니다.`;
            } else { // 22, 23, 24의 4단계 2번째 베팅 패배 시
                nextLevel = currentLevel; // 현재 레벨 유지
                messageEl.textContent = `패배! (2번째 베팅 실패) 현재 레벨 ${nextLevel}을 유지합니다.`;
            }
        } else {
            messageEl.textContent = "오류: 알 수 없는 4단계 패배 규칙입니다.";
            gameOver("시스템 오류로 게임 종료.");
            return;
        }
        currentLevel = nextLevel;
        currentStage = 1; // 특수 패배 후 다음 레벨의 1단계로 이동
    }
    else {
        messageEl.textContent = "알 수 없는 패배 규칙입니다.";
        gameOver("시스템 오류로 게임 종료.");
        return;
    }

    updateDisplay();
}

// 리셋 버튼 클릭 핸들러
function handleReset() {
    if (confirm("정말로 게임을 리셋하시겠습니까?")) {
        initializeGame();
    }
}

// 이전 단계 버튼 클릭 핸들러
function handleUndo() {
    if (betHistory.length > 0) {
        const prevState = betHistory.pop(); // 가장 최근 상태 가져오기
        currentLevel = prevState.level;
        currentStage = prevState.stage;
        totalUnits = prevState.totalUnits;
        winStreak = prevState.winStreak;
        messageEl.textContent = "이전 상태로 돌아갑니다.";
        messageEl.classList.remove('win', 'lose'); // 메시지 클래스 초기화
        updateDisplay();
        enableButtons(); // 이전 단계 후 버튼 활성화
    } else {
        messageEl.textContent = "더 이상 돌아갈 이전 상태가 없습니다.";
        undoButton.disabled = true; // 기록이 없으면 비활성화
    }
}

// 이벤트 리스너 연결
winButton.addEventListener('click', handleWin);
loseButton.addEventListener('click', handleLose);
resetButton.addEventListener('click', handleReset);
undoButton.addEventListener('click', handleUndo);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeGame);