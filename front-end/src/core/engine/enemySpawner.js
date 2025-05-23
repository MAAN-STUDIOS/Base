import { Enemy } from "./enemy.js";
import { Vector } from "@utils/vector.js";
import logger from "@utils/logger.js";

export class EnemySpawner {
    constructor(config) {
        const {
            waves = [],
            tileGrid,
            obstacles = [],
            onWaveComplete = () => {},
            onAllWavesComplete = () => {}
        } = config;

        this.waves = waves;
        this.currentWave = 0;
        this.enemies = [];
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.isWaveActive = false;
        this.tileGrid = tileGrid;
        this.obstacles = obstacles;
        this.onWaveComplete = onWaveComplete;
        this.onAllWavesComplete = onAllWavesComplete;
    }

    update(dt, player) {
        // Update existing enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(dt, player);
            return enemy.health > 0;
        });

        // Handle wave spawning
        if (this.currentWave < this.waves.length) {
            const wave = this.waves[this.currentWave];
            
            if (!this.isWaveActive) {
                this.startWave(wave);
            }

            this.waveTimer += dt;
            this.spawnTimer += dt;
            
            // Spawn enemies based on interval
            if (this.spawnTimer >= wave.spawnInterval) {
                this.spawnEnemy(wave);
                this.spawnTimer = 0;
            }
            
            // Check if wave is complete
            if (this.waveTimer >= wave.duration && this.enemies.length === 0) {
                this.completeWave();
            }
        } else if (this.enemies.length === 0) {
            this.onAllWavesComplete();
        }
    }

    startWave(wave) {
        this.isWaveActive = true;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        logger.debug(`Starting wave ${this.currentWave + 1}`);
    }

    completeWave() {
        this.isWaveActive = false;
        this.currentWave++;
        this.onWaveComplete(this.currentWave);
        logger.debug(`Completed wave ${this.currentWave}`);
    }

    spawnEnemy(wave) {
        const spawnPoint = this.getRandomSpawnPoint(wave.spawnPoints);
        const waypoints = this.generateWaypoints(spawnPoint, wave.waypointCount);
        
        const enemy = new Enemy({
            position: spawnPoint,
            waypoints,
            homePoint: spawnPoint,
            tileGrid: this.tileGrid,
            obstacles: this.obstacles,
            ...wave.enemyConfig
        });

        this.enemies.push(enemy);
        logger.debug("Enemy spawned", { position: spawnPoint });
    }

    getRandomSpawnPoint(spawnPoints) {
        const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        return new Vector(point.x, point.y);
    }

    generateWaypoints(spawnPoint, count) {
        const waypoints = [];
        const radius = 100; // Patrol radius
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = spawnPoint.x + Math.cos(angle) * radius;
            const y = spawnPoint.y + Math.sin(angle) * radius;
            waypoints.push(new Vector(x, y));
        }
        
        return waypoints;
    }

    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }

    // Example level configuration
    static createLevelData() {
        return {
            waves: [
                {
                    duration: 30, // seconds
                    spawnInterval: 2, // seconds between spawns
                    waypointCount: 4, // number of patrol waypoints
                    spawnPoints: [
                        { x: 100, y: 100 },
                        { x: 700, y: 100 },
                        { x: 100, y: 500 },
                        { x: 700, y: 500 }
                    ],
                    enemyConfig: {
                        health: 100,
                        speed: 200,
                        damage: 10,
                        chaseRadius: 300,
                        attackRadius: 50,
                        retreatHealthThreshold: 30,
                        retreatDistance: 150
                    }
                },
                {
                    duration: 45,
                    spawnInterval: 1.5,
                    waypointCount: 6,
                    spawnPoints: [
                        { x: 100, y: 100 },
                        { x: 700, y: 100 },
                        { x: 100, y: 500 },
                        { x: 700, y: 500 }
                    ],
                    enemyConfig: {
                        health: 150,
                        speed: 250,
                        damage: 15,
                        chaseRadius: 350,
                        attackRadius: 60,
                        retreatHealthThreshold: 40,
                        retreatDistance: 200
                    }
                }
            ]
        };
    }
} 