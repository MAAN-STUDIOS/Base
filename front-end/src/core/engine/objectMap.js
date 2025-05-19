import logger from "@utils/logger.js";
import { Vector } from "@utils/vector.js";
import { GameObject } from "@engine/gameobject.js";
import { get_map_chunk } from "@utils/apimanager.js";
import { Hitbox } from "@utils/hitbox.js";


/**
 * @class
 * ObjectMap
 * Responsible for rendering the game world map and managing object collisions.
 *
 * Features:
 * - Maintains 9 chunks in a 3x3 grid (center chunk plus surrounding chunks)
 * - Renders only tiles visible within the current viewport
 * - Dynamically loads new chunk data when player moves beyond center chunk boundaries
 * - Handles map boundaries and network errors by maintaining edge hitboxes
 * - Uses fallback tilemap rendering for chunks that fail to load
 *
 * Implementation details:
 * - Chunks are represented as arrays of integers (tile indices in the spritesheet)
 * - Uses Vector objects for positions and directions
 * - Collision detection uses hitboxes (managed by the game engine)
 */
export class ObjectMap extends GameObject {
    /**
     * ObjectMap
     * Responsible for rendering the game world map and managing object collisions.
     *
     * @param {{}|string}source
     * @param {number}width
     * @param {number}height
     * @param {{
     *     tiles_per_row: number|null,
     *     tile_size: number|null,
     *     chunk_size: number|null,
     *     n_loaded_chunks: number|null
     *     debug: boolean|null
     * }} options - Configuration options
     */
    constructor(source, width, height, options = {}) {
        super({ position: Vector.zero(), width, height });
        this.spriteSheet = new Image();
        this.spriteSheet.src = source;
        this.spriteSheet.onload = () => logger.info("Map spritesheet loaded");
        this.spriteSheet.onerror = () => logger.error("Failed to load map spritesheet");

        this.current_chunk = new Vector(0, 0);
        this.chunks_loaded = new Map();
        this.maxDistance = 2;

        this.viewPort = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        this.boundaries = [];

        this.lastBoundaryCheck = 0;
        this.boundaryCheckCooldown = 1000;

        this.tiles_per_row = options.tiles_per_row || 8;
        this.tiles_size = options.tile_size || 32;
        this.chunk_size = options.chunk_size | 16;
        this.n_loaded_chunks = options.n_loaded_chunks || 1;
        this.debug = options.debug || false;

        logger.debug(`Map created ${this}`);
    }

    /**
     * The read-only interface's attribute is a
     * Boolean value which indicates
     * whether the image has completely loaded.
     * @returns {boolean}
     */
    get loaded() {
        return this.spriteSheet.complete;
    }

    /**
     * Updates map state based on player position
     * @param {Vector} center - Player position in world coordinates
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    update(center, width, height) {
        this.viewPort = {
            x: center.x - width / 2,
            y: center.y - height / 2,
            width,
            height
        };

        const playerChunk = this.#resolveChunk(center);

        if (!this.current_chunk.equals(playerChunk)) {
            logger.info(`Moving to new chunk: ${playerChunk.x},${playerChunk.y}`);
            this.#loadChunks(playerChunk);
        }

        const now = Date.now();
        if (now - this.lastBoundaryCheck > this.boundaryCheckCooldown) {
            this.#resolveBoundaries(playerChunk);
            this.lastBoundaryCheck = now;
        }
    }

    /**
     * Draws the map on the canvas
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
     */
    draw(ctx) {
        if (!this.loaded) return;

        const startChunkX = Math.floor(this.viewPort.x / (this.chunk_size * this.tiles_size)) - 1;
        const startChunkY = Math.floor(this.viewPort.y / (this.chunk_size * this.tiles_size)) - 1;

        const endChunkX = Math.ceil((this.viewPort.x + this.viewPort.width) / (this.chunk_size * this.tiles_size)) + 1;
        const endChunkY = Math.ceil((this.viewPort.y + this.viewPort.height) / (this.chunk_size * this.tiles_size)) + 1;

        for (let y = startChunkY; y <= endChunkY; y++) {
            for (let x = startChunkX; x <= endChunkX; x++) {
                const chunkKey = `${x},${y}`;
                const chunk = this.chunks_loaded.get(chunkKey);

                if (!chunk) continue;

                this.#drawChunk(ctx, x, y, chunk);
            }
        }

        if (this.debug) {
            this.#drawChunkBoundaries(ctx, startChunkX, startChunkY, endChunkX, endChunkY);
        }
    }

    toString() {
        return JSON.stringify(this.serialize());
    }

    serialize() {
        return {
            spriteSheet: this.spriteSheet.src,
            maxDistance: this.maxDistance,
            viewPort: this.viewPort,
            boundaries: this.boundaries,
            boundaryCheckCooldown: this.boundaryCheckCooldown,
            tiles_per_row: this.tiles_per_row,
            tiles_size: this.tiles_size,
            chunk_size: this.chunk_size,
            n_loaded_chunks: this.n_loaded_chunks,
            debug: this.debug
        }
    }

    /**
     * Determines which chunk a world position belongs to
     * @param {Vector} position - World position
     * @returns {Vector} - Chunk coordinates
     */
    #resolveChunk(position) {
        const chunkX = Math.floor(position.x / (this.chunk_size * this.tiles_size));
        const chunkY = Math.floor(position.y / (this.chunk_size * this.tiles_size));
        return new Vector(chunkX, chunkY);
    }

    /**
     * Loads all chunks in a NxN grid around the center
     * where N is the configurable option n_loaded_chunks
     * @param {Vector} center - Center chunk coordinates
     */
    #loadChunks(center) {
        this.current_chunk = center.clone();

        for (let y = center.y - 1; y <= center.y + this.n_loaded_chunks; ++y) {
            for (let x = center.x - 1; x <= center.x + this.n_loaded_chunks; ++x) {
                const chunkKey = `${x},${y}`;

                if (this.chunks_loaded.has(chunkKey)) continue;

                this.chunks_loaded.set(chunkKey, null);

                get_map_chunk(x, y)
                    .then(data => {
                        if (data) {
                            this.chunks_loaded.set(chunkKey, data);
                            logger.info(`Loaded chunk at ${x},${y}`);
                        } else {
                            // Create fallback for failed loads
                            this.chunks_loaded.set(chunkKey, this.#createFallbackChunk());
                            logger.warn(`Using fallback for chunk ${x},${y}`);
                        }
                    })
                    .catch(err => {
                        logger.error(`Error loading chunk ${x},${y}: ${err}`);
                        this.chunks_loaded.set(chunkKey, this.#createFallbackChunk());
                    });
            }
        }

        this.#cleanupDistantChunks(center);
    }

    /**
     * Creates a fallback chunk pattern for when loading fails
     * @returns {Object} Fallback chunk data
     */
    #createFallbackChunk() {
        const tiles = [];
        for (let i = 0; i < this.chunk_size * this.chunk_size; ++i) {
            const x = i % this.chunk_size;
            const y = Math.floor(i / this.chunk_size);

            if (x === 0 || y === 0 || x === this.chunk_size - 1 || y === this.chunk_size - 1) {
                tiles.push(2); // Border tile
            } else {
                tiles.push((x + y) % 2 === 0 ? 0 : 1);
            }
        }

        return { tiles };
    }

    /**
     * Removes chunks that are too far from center
     * @param {Vector} center - Center chunk coordinates
     */
    #cleanupDistantChunks(center) {
        for (const [key, _] of this.chunks_loaded) {
            const [x, y] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(x - center.x), Math.abs(y - center.y));

            if (distance > this.maxDistance) {
                this.chunks_loaded.delete(key);
                logger.debug(`Removed distant chunk at ${key}`);
            }
        }
    }

    /**
     * Draws a single chunk on the canvas
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     * @param {Object} chunk - Chunk data
     */
    #drawChunk(ctx, chunkX, chunkY, chunk) {
        const chunkWorldX = chunkX * this.chunk_size * this.tiles_size;
        const chunkWorldY = chunkY * this.chunk_size * this.tiles_size;

        const startTileX = Math.max(0, Math.floor((this.viewPort.x - chunkWorldX) / this.tiles_size));
        const startTileY = Math.max(0, Math.floor((this.viewPort.y - chunkWorldY) / this.tiles_size));

        const endTileX = Math.min(this.chunk_size - 1, Math.ceil((this.viewPort.x + this.viewPort.width - chunkWorldX) / this.tiles_size));
        const endTileY = Math.min(this.chunk_size - 1, Math.ceil((this.viewPort.y + this.viewPort.height - chunkWorldY) / this.tiles_size));

        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                const tileIndex = tileY * this.chunk_size + tileX;
                const tileId = chunk.tiles[tileIndex];

                // Skip empty tiles (0)
                if (tileId === 0) continue;

                const srcX = (tileId % this.tiles_per_row) * this.tiles_size;
                const srcY = Math.floor(tileId / this.tiles_per_row) * this.tiles_size;

                const destX = chunkWorldX + tileX * this.tiles_size - this.viewPort.x;
                const destY = chunkWorldY + tileY * this.tiles_size - this.viewPort.y;

                ctx.drawImage(
                    this.spriteSheet,
                    srcX, srcY, this.tiles_size, this.tiles_size,
                    destX, destY, this.tiles_size, this.tiles_size
                );
            }
        }
    }

    /**
     * Debug method to draw chunk boundaries
     *
     * @param {CanvasRenderingContext2D}ctx
     * @param {number}startX
     * @param {number}startY
     * @param {number}endX
     * @param {number}endY
     */
    #drawChunkBoundaries(ctx, startX, startY, endX, endY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.lineWidth = 2;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const worldX = x * this.chunk_size * this.tiles_size - this.viewPort.x;
                const worldY = y * this.chunk_size * this.tiles_size - this.viewPort.y;
                ctx.strokeRect(worldX, worldY, this.chunk_size * this.tiles_size, this.chunk_size * this.tiles_size);
            }
        }

        ctx.restore();
    }

    /**
     * Updates map boundaries based on available chunks
     * @param {Vector} center - Current chunk coordinates
     */
    #resolveBoundaries(center) {
        this.boundaries = [];

        for (let y = center.y - 1; y <= center.y + 1; y++) {
            for (let x = center.x - 1; x <= center.x + 1; x++) {
                const chunkKey = `${x},${y}`;

                if (!this.chunks_loaded.has(chunkKey) || this.chunks_loaded.get(chunkKey) === null) {
                    this.#createBoundaryHitbox(x, y);

                    get_map_chunk(x, y).then(data => {
                        if (data) {
                            this.chunks_loaded.set(chunkKey, data);
                        }
                    });
                }
            }
        }
    }

    /**
     * Creates boundary hitboxes at the edges of a chunk where no adjacent chunks exist
     *
     * @param {number} chunkX - X coordinate of the chunk in the chunk grid
     * @param {number} chunkY - Y coordinate of the chunk in the chunk grid
     * @returns {void}
     */
    #createBoundaryHitbox(chunkX, chunkY) {
        const worldX = chunkX * this.chunk_size * this.tiles_size;
        const worldY = chunkY * this.chunk_size * this.tiles_size;
        const size = this.chunk_size * this.tiles_size;
        const edgeDim = 8;

        const directions = [
            { dx: -1, dy: 0, edge: 'left' },
            { dx: 1, dy: 0, edge: 'right' },
            { dx: 0, dy: -1, edge: 'top' },
            { dx: 0, dy: 1, edge: 'bottom' }
        ];

        for (const dir of directions) {
            const adjacentKey = `${chunkX + dir.dx},${chunkY + dir.dy}`;

            if (!this.chunks_loaded.has(adjacentKey)) {
                let boundaryObj;

                switch (dir.edge) {
                    case 'left':
                        boundaryObj = new GameObject({
                            position: new Vector(worldX, worldY),
                            width: edgeDim,
                            height: size
                        });
                        break;
                    case 'right':
                        boundaryObj = new GameObject({
                            position: new Vector(worldX + size - edgeDim, worldY),
                            width: edgeDim,
                            height: size
                        });
                        break;
                    case 'top':
                        boundaryObj = new GameObject({
                            position: new Vector(worldX, worldY),
                            width: size,
                            height: edgeDim
                        });
                        break;
                    case 'bottom':
                        boundaryObj = new GameObject({
                            position: new Vector(worldX, worldY + size - edgeDim),
                            width: size,
                            height: edgeDim
                        });
                        break;
                }

                const boundary = new Hitbox(boundaryObj);
                boundary.isPhysical = true;
                this.boundaries.push(boundary);

                logger.debug(`Boundary created ${boundary}`);
            }
        }
    }
}