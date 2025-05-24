import { Vector } from "@utils/vector.js";
import logger from "@utils/logger.js";

export class LineOfSight {
    constructor(tileGrid, obstacles = []) {
        this.tileGrid = tileGrid;
        this.obstacles = obstacles;
        this.losCache = new Map(); // Cache for tile-to-player LOS
        this.stepSize = 5; // Raycast step size
    }

    /**
     * Check if there's line of sight between two points
     * @param {Vector} src - Source position
     * @param {Vector} dst - Destination position
     * @returns {boolean} True if there's clear line of sight
     */
    hasLineOfSight(src, dst) {
        const direction = dst.sub(src);
        const distance = direction.magnitude();
        const step = direction.normalize().mul(this.stepSize);
        
        let current = src.clone();
        while (current.distanceTo(dst) > this.stepSize) {
            current = current.add(step);
            
            // Check against obstacles
            for (const obstacle of this.obstacles) {
                if (obstacle.containsPoint && obstacle.containsPoint(current)) {
                    return false;
                }
                
                // If obstacle doesn't have containsPoint, use basic collision detection
                if (obstacle.x !== undefined && obstacle.y !== undefined && 
                    obstacle.width !== undefined && obstacle.height !== undefined) {
                    if (current.x >= obstacle.x && current.x <= obstacle.x + obstacle.width &&
                        current.y >= obstacle.y && current.y <= obstacle.y + obstacle.height) {
                        return false;
                    }
                }
            }

            // Check against tile grid boundaries
            if (this.tileGrid && this.tileGrid.isPointInBounds && !this.tileGrid.isPointInBounds(current)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Update the LOS cache for all tiles relative to player position
     * @param {Vector} playerPos - Current player position
     */
    updateLosCache(playerPos) {
        this.losCache.clear();
        
        // If tileGrid doesn't have getAllTiles method, skip caching
        if (!this.tileGrid || !this.tileGrid.getAllTiles) {
            return;
        }
        
        const tiles = this.tileGrid.getAllTiles();
        
        for (const tile of tiles) {
            const tileCenter = new Vector(
                tile.x + (this.tileGrid.tileSize || 32) / 2,
                tile.y + (this.tileGrid.tileSize || 32) / 2
            );
            this.losCache.set(
                `${tile.x},${tile.y}`,
                this.hasLineOfSight(tileCenter, playerPos)
            );
        }
    }

    /**
     * Find the nearest tile with LOS to both enemy and player
     * @param {Vector} enemyPos - Enemy position
     * @param {Vector} playerPos - Player position
     * @returns {Vector|null} Position of nearest valid tile or null
     */
    findNearestValidTile(enemyPos, playerPos) {
        let nearestTile = null;
        let minDistance = Infinity;

        // If no cache or empty cache, return a simple fallback position
        if (this.losCache.size === 0) {
            // Return a position between enemy and player as fallback
            return enemyPos.lerp(playerPos, 0.5);
        }

        for (const [key, hasLos] of this.losCache) {
            if (!hasLos) continue;

            const [x, y] = key.split(',').map(Number);
            const tileCenter = new Vector(
                x + (this.tileGrid.tileSize || 32) / 2,
                y + (this.tileGrid.tileSize || 32) / 2
            );

            // Check if enemy has LOS to this tile
            if (!this.hasLineOfSight(enemyPos, tileCenter)) continue;

            const distance = enemyPos.distanceTo(tileCenter);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTile = tileCenter;
            }
        }

        return nearestTile;
    }

    /**
     * Draw debug visualization of LOS rays
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Vector} src - Source position
     * @param {Vector} dst - Destination position
     * @param {boolean} hasLos - Whether there's line of sight
     */
    drawLosRay(ctx, src, dst, hasLos) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(dst.x, dst.y);
        ctx.strokeStyle = hasLos ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        ctx.stroke();
    }
}