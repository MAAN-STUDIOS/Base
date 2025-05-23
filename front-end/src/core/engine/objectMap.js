import { Vector } from "@utils/vector.js";
import { GameObject } from "@engine/gameobject.js";
import { get_map_chunk } from "@utils/apimanager.js";
import { Hitbox } from "@utils/hitbox.js";
import logger from "@utils/logger.js";


/**
 * @class ObjectMap
 * @extends GameObject
 * @description Manages the game world map rendering.
 *
 * Features:
 * - Maintains a configurable NxN grid of chunks centered around the player
 * - Dynamic chunk loading based on player movement
 * - Efficient tile rendering within the viewport
 * - Automatic boundary creation at map edges
 * - Fallback rendering for failed chunk loads
 * - Automatic hitbox creation for configure tiles
 *
 * The map is organized as:
 * - World: composed of multiple chunks in a grid
 * - Chunks: fixed-size areas (default 16x16 tiles)
 * - Tiles: individual map elements from a spritesheet
 */
export class ObjectMap {
    /**
     * Creates a new ObjectMap instance
     *
     * @param {string|Object} source - The URL or source object for the map spritesheet
     * @param {number} width - Viewport width in pixels
     * @param {number} height - Viewport height in pixels
     * @param {Vector} [real_position=Vector.zero()] - Initial position in world coordinates
     * @param {Object} options - Configuration options
     * @param {number} [options.tiles_per_row=8] - Number of tiles per row in the spritesheet
     * @param {number} [options.tile_size=32] - Size of each tile in pixels
     * @param {number} [options.chunk_size=16] - Size of each chunk in tiles
     * @param {number} [options.n_loaded_chunks=1] - Radius of chunks to keep loaded around player
     * @param {boolean} [options.debug=false] - Whether to draw debug information
     * @param {number[]} [options.solidTilesID=[1]] - TilesID that the player cannot walk over.
     * @param {number} [options.scale=2] - Scalar to scale the map.
     * @param {boolean} [options.debug_info=false] - debug info.
     */
    constructor(source, width, height, real_position, options = {}) {
        this.spriteSheet = new Image();
        this.spriteSheet.src = source;
        this.spriteSheet.onload = () => logger.info("Map spritesheet loaded");
        this.spriteSheet.onerror = () => logger.error("Failed to load map spritesheet");

        /**
         * @type {Map<string, number[]|null>}
         * Map of loaded chunks. Keys are string coordinates "x,y" (subject to change),
         * values are chunk data or null if loading.
         */
        this.chunks_loaded = new Map();

        /** @type {Vector} Current chunk coordinates */
        this.current_chunk = Vector.zero(); // NOTE: Initialize with invalid chunk to force first load

        /** @type {{width: number, height: number}} Visible area dimensions */
        this.viewPort = {
            width: width,
            height: height
        };

        /** @type {Vector} Position in world coordinates */
        this.real_position = real_position || Vector.zero();

        /** @type {Hitbox[]} Array of boundary hitboxes */
        this.boundaries = [];

        /** @type {Hitbox[]} Array of hitboxes for inner collision*/
        this.hitboxes = [];

        /** @type {number[]} Array of tiles index (tiles id) that the player cannot pass through*/
        this.solidTilesID = options.solidTilesID || [1];

        /** @type {number} Milliseconds between boundary checks */
        this.boundaryCheckCooldown = 1000;

        /** @type {number} Number of tiles per row in spritesheet */
        this.tiles_per_row = options.tiles_per_row || 8;

        /** @type {number} Size of each tile in pixels */
        this.tile_size = options.tile_size || 32;

        /** @type {number} Size of each chunk in tiles */
        this.chunk_size = options.chunk_size || 16;

        /** @type {number} Radius of chunks to keep loaded around player */
        this.n_loaded_chunks = options.n_loaded_chunks || 1;

        /** @type {boolean} Whether to show debug visualization */
        this.debug = options.debug || false;

        this.debug_info = options.debug_info || false;

        /** @type {boolean} Whether to use local mockup data */
        this.local = true; // TODO: remove when server side generation is ready

        logger.debug(`Map created ${this}`);


        const initialChunk = this.#resolveChunk(this.real_position);
        this.#loadChunks(initialChunk);
    }

    /**
     * Indicates whether the map spritesheet has completely loaded
     *
     * @returns {boolean} True if the spritesheet is fully loaded
     */
    get isLoaded() {
        return this.spriteSheet.complete;
    }

    /**
     * Updates map state based on player position
     * Handles chunk loading and boundary updates
     * NOTE: Don't use delta time in calculation cause
     * new position is expected to be already normalize with dt.
     * @param {Vector} targetPosition - Player position in world coordinates
     * @param {number} dt - Delta time in ms !Important.
     */
    update(targetPosition, dt) {
        this.real_position.addEqual(targetPosition.subEqual(this.real_position));

        const playerChunk = this.#resolveChunk(this.real_position);

        if (!this.current_chunk.equals(playerChunk)) {
            logger.info(`Moving from chunk ${this.current_chunk} to ${playerChunk}`);
            this.#loadChunks(playerChunk);

            const loadedChunks = Array.from(this.chunks_loaded.keys())
                .filter(key => this.chunks_loaded.get(key) !== null)
                .map(key => {
                    const [x, y] = key.split(',').map(Number);
                    return new Vector(x, y);
                });

            this.#attachHitboxes(loadedChunks);
        }

        this.timeSinceLastCheck = (this.timeSinceLastCheck || 0) + dt;
        if (this.timeSinceLastCheck > this.boundaryCheckCooldown) {
            this.#resolveBoundaries(playerChunk);
            this.timeSinceLastCheck = 0;
        }
    }

    /**
     * Draws the map on the canvas
     * Only draws chunks and tiles that are visible in the viewport
     *
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
     */
    draw(ctx) {
        if (!this.isLoaded) return;

        const startChunkX = this.#getStartChunk(this.real_position.x);
        const startChunkY = this.#getStartChunk(this.real_position.y);

        const endChunkX = this.#getEndChunk(this.real_position.x, this.viewPort.width);
        const endChunkY = this.#getEndChunk(this.real_position.y, this.viewPort.height);

        for (let y = startChunkY; y <= endChunkY; ++y) {
            for (let x = startChunkX; x <= endChunkX; ++x) {
                this.#drawChunk(ctx, x, y);
            }
        }

        if (this.debug) {
            this.#drawChunkBoundaries(ctx, startChunkX, startChunkY, endChunkX, endChunkY);
            this.#drawInnerBoundaries(ctx);
        }

        if (this.debug_info) {
            this.#drawDebugInfo(ctx);
        }
    }

    collidesWith(other) {
        for (let hb of this.hitboxes) {
            if (hb.collidesWith(other)) return true;
        }

        for (let hb of this.boundaries) {
            if (hb.collidesWith(other)) return true;
        }

        return false;
    }

    /**
     * Creates a string representation of the map
     *
     * @returns {string} JSON string of serialized map data
     */
    toString() {
        return JSON.stringify(this.serialize());
    }

    /**
     * Serializes map data for logging or saving
     *
     * @returns {Object} Serialized map configuration
     */
    serialize() {
        return {
            spriteSheet: this.spriteSheet.src,
            viewPort: this.viewPort,
            boundaries: this.boundaries,
            boundaryCheckCooldown: this.boundaryCheckCooldown,
            tiles_per_row: this.tiles_per_row,
            tiles_size: this.tile_size,
            chunk_size: this.chunk_size,
            n_loaded_chunks: this.n_loaded_chunks,
            debug: this.debug
        }
    }

    /**
     * Obtiene la posición del jugador dentro del chunk actual
     * @param {Vector} worldPosition - Posición mundial en píxeles
     * @returns {Vector} Posición relativa dentro del chunk (0 a chunk_size * tile_size)
     */
    #getPositionInChunk(worldPosition) {
        const chunkPixelSize = this.chunk_size * this.tile_size;

        const modX = ((worldPosition.x % chunkPixelSize) + chunkPixelSize) % chunkPixelSize;
        const modY = ((worldPosition.y % chunkPixelSize) + chunkPixelSize) % chunkPixelSize;
        return new Vector(modX, modY);
    }

    /**
     * Convierte coordenadas de chunk a posición mundial
     * @param {Vector} chunkCoords - Coordenadas del chunk
     * @returns {Vector} Posición mundial del origen del chunk
     */
    #chunkToWorld(chunkCoords) {
        const chunkPixelSize = this.chunk_size * this.tile_size;
        return new Vector(
            chunkCoords.x * chunkPixelSize,
            chunkCoords.y * chunkPixelSize
        );
    }

    /**
     * Obtiene información completa de la posición
     * @param {Vector} worldPosition - Posición mundial
     * @returns {Object} Información detallada de la posición
     */
    getPositionInfo(worldPosition) {
        const chunk = this.#resolveChunk(worldPosition);
        const posInChunk = this.#getPositionInChunk(worldPosition);
        const tileInChunk = new Vector(
            Math.floor(posInChunk.x / this.tile_size),
            Math.floor(posInChunk.y / this.tile_size)
        );

        return {
            worldPosition: worldPosition,
            chunk: chunk,
            positionInChunk: posInChunk,
            tileInChunk: tileInChunk
        };
    }

    /**
     * Generates a unique key for a chunk based on its coordinates
     *
     * @private
     * @param {number} x - Chunk X coordinate
     * @param {number} y - Chunk Y coordinate
     * @returns {string} Unique chunk identifier as "x,y"
     */
    #genChunKey(x, y) {
        return `${x},${y}`;
    }

    /**
     * Determines which chunk a world position belongs to
     *
     * @private
     * @param {Vector} position - World position in pixels
     * @returns {Vector} Chunk coordinates
     */
    #resolveChunk(position) {
        const chunkPixelSize = this.chunk_size * this.tile_size;

        const chunkX = Math.floor(position.x / chunkPixelSize);
        const chunkY = Math.floor(position.y / chunkPixelSize);
        return new Vector(chunkX, chunkY);
    }

    /**
     * Loads all chunks in a grid around the center chunk
     * Initiates async loading of missing chunks and cleans up distant ones
     *
     * @private
     * @param {Vector} center - Center chunk coordinates
     */
    #loadChunks(center) {
        this.current_chunk = center.clone();

        for (let y = center.y - this.n_loaded_chunks; y <= center.y + this.n_loaded_chunks; ++y) {
            for (let x = center.x - this.n_loaded_chunks; x <= center.x + this.n_loaded_chunks; ++x) {
                const chunkKey = this.#genChunKey(x, y);

                if (this.chunks_loaded.has(chunkKey)) continue;

                this.chunks_loaded.set(chunkKey, null);

                get_map_chunk(x, y, this.local)
                    .then(data => this.#mountChunk(data, chunkKey))
                    .catch(err => this.#errorMountingChunk(err, chunkKey));
            }
        }

        this.#cleanupDistantChunks(center);
    }

    /**
     * Creates hitboxes for solid tiles in specified chunks
     * @private
     * @param {Array<Vector>} chunks - Array of chunk coordinates to process
     */
    #attachHitboxes(chunks) {
        this.hitboxes = []; // NOTE: If performance critical improve.

        for (let chunkPos of chunks) {
            const chunkKey = this.#genChunKey(chunkPos.x, chunkPos.y);
            const chunkData = this.chunks_loaded.get(chunkKey);

            if (!chunkData) continue;


            const chunkWorld = this.#chunkToWorld(chunkPos);

            for (let tileY = 0; tileY < this.chunk_size; tileY++) {
                for (let tileX = 0; tileX < this.chunk_size; tileX++) {
                    const tileIndex = tileY * this.chunk_size + tileX;
                    const tileId = chunkData[tileIndex];

                    if (!this.solidTilesID.includes(tileId)) continue;

                    const tileWorldX = chunkWorld.x + tileX * this.tile_size;
                    const tileWorldY = chunkWorld.y + tileY * this.tile_size;

                    // NOTE: If scale change, apply scale to hbs to match visual size.
                    const tileWrapper = {
                        position: new Vector(tileWorldX, tileWorldY),
                        width: this.tile_size,
                        height: this.tile_size
                    };

                    const hb = new Hitbox(tileWrapper, {
                        isPhysical: true
                    });

                    // NOTE: Debugging info
                    hb.tileId = tileId;
                    hb.chunkCoords = chunkPos;

                    this.hitboxes.push(hb);
                }
            }
        }

        logger.debug(`Created ${this.hitboxes.length} collision hitboxes`);
    }

    /**
     * Creates a fallback chunk pattern for when loading fails
     * Uses a checkerboard pattern with borders
     *
     * @private
     * @param {string} chunkKey - Chunk identifier
     * @returns {number[]} Fallback chunk data as tile indices
     */
    #createFallbackChunk(chunkKey) {
        // TODO: Impl new fallback chunk / pattern / idk
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

        logger.warn(`Using fallback for chunk: ${chunkKey}`);

        return tiles;
    }

    /**
     * Removes chunks that are too far from center to conserve memory
     *
     * @private
     * @param {Vector} center - Center chunk coordinates
     */
    #cleanupDistantChunks(center) {
        for (const [key, _] of this.chunks_loaded) {
            const [x, y] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(x - center.x), Math.abs(y - center.y));

            if (distance > this.n_loaded_chunks) {
                this.chunks_loaded.delete(key);
                logger.debug(`Removed distant chunk at ${key}`);
            }
        }
    }

    /**
     * Draws a single chunk on the canvas
     * Only renders tiles that are visible in the viewport
     *
     * @private
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     */
    #drawChunk(ctx, chunkX, chunkY) {
        const chunk = this.chunks_loaded.get(this.#genChunKey(chunkX, chunkY));
        if (!chunk) return;

        const chunkWorldX = chunkX * this.chunk_size * this.tile_size;
        const chunkWorldY = chunkY * this.chunk_size * this.tile_size;

        const startTileX = this.#getStartTile(this.real_position.x, chunkWorldX);
        const startTileY = this.#getStartTile(this.real_position.y, chunkWorldY);

        const endTileX = this.#getEndTile(this.real_position.x, chunkWorldX);
        const endTileY = this.#getEndTile(this.real_position.y, chunkWorldY);

        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                this.#drawTile(
                    ctx, chunk,
                    tileX, tileY,
                    chunkWorldX, chunkWorldY
                );
            }
        }
    }

    /**
     * Draws a single tile on the canvas
     *
     * @private
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number[]} chunk - Chunk data as array of tile indices
     * @param {number} tileX - Tile X index within the chunk
     * @param {number} tileY - Tile Y index within the chunk
     * @param {number} chunkWorldX - Chunk's world X position
     * @param {number} chunkWorldY - Chunk's world Y position
     */
    #drawTile(ctx, chunk, tileX, tileY, chunkWorldX, chunkWorldY) {
        const tileIndex = tileY * this.chunk_size + tileX;
        const tileId = chunk[tileIndex];

        if (tileId === 0) return; // NOTE: Skip empty tiles (0)

        const srcX = (tileId % this.tiles_per_row) * this.tile_size;
        const srcY = Math.floor(tileId / this.tiles_per_row) * this.tile_size;


        const tileWorldX = chunkWorldX + tileX * this.tile_size;
        const tileWorldY = chunkWorldY + tileY * this.tile_size;

        const destX = tileWorldX - this.real_position.x + this.viewPort.width / 2;
        const destY = tileWorldY - this.real_position.y + this.viewPort.height / 2;

        ctx.drawImage(
            this.spriteSheet,
            srcX, srcY, this.tile_size, this.tile_size,
            destX, destY, this.tile_size, this.tile_size
        );
    }

    /**
     * Calculates the first chunk to render on an axis
     *
     * @private
     * @param {number} axisPosition - Position on the axis (x or y)
     * @returns {number} The first chunk index to render
     */
    #getStartChunk(axisPosition) {
        return Math.floor(
            axisPosition / (this.chunk_size * this.tile_size)
        ) - 1;
    }

    /**
     * Calculates the last chunk to render on an axis
     *
     * @private
     * @param {number} axisPosition - Position on the axis (x or y)
     * @param {number} dimensionOffset - Viewport width or height
     * @returns {number} The last chunk index to render
     */
    #getEndChunk(axisPosition, dimensionOffset) {
        return Math.ceil(
            (axisPosition + dimensionOffset) / (this.chunk_size * this.tile_size)
        ) + 1;
    }

    /**
     * Calculates the starting tile index for rendering within a chunk on one axis
     *
     * @private
     * @param {number} axisPosition - The current viewport position on an axis (x or y)
     * @param {number} worldPosition - The chunk's world position on the same axis
     * @returns {number} The index of the first tile to render (bounded to 0)
     */
    #getStartTile(axisPosition, worldPosition) {
        const halfViewport = this.viewPort.width / 2;
        return Math.max(0, Math.floor(
            (axisPosition - halfViewport - worldPosition) / this.tile_size)
        );
    }


    /**
     * Calculates the ending tile index for rendering within a chunk on one axis
     *
     * @private
     * @param {number} axisPosition - The current viewport position on an axis (x or y)
     * @param {number} worldPosition - The chunk's world position on the same axis
     * @returns {number} The index of the last tile to render (bounded to chunk_size-1)
     */
    #getEndTile(axisPosition, worldPosition) {
        const halfViewport = this.viewPort.width / 2;
        return Math.min(this.chunk_size - 1, Math.ceil(
            (axisPosition + halfViewport - worldPosition) / this.tile_size)
        );
    }

    /**
     * Draws debug visualization of chunk boundaries
     *
     * @private
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} startX - First chunk X coordinate to render
     * @param {number} startY - First chunk Y coordinate to render
     * @param {number} endX - Last chunk X coordinate to render
     * @param {number} endY - Last chunk Y coordinate to render
     */
    #drawChunkBoundaries(ctx, startX, startY, endX, endY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.lineWidth = 2;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const chunkWorldX = x * this.chunk_size * this.tile_size;
                const chunkWorldY = y * this.chunk_size * this.tile_size;

                const screenX = chunkWorldX - this.real_position.x + this.viewPort.width / 2;
                const screenY = chunkWorldY - this.real_position.y + this.viewPort.height / 2;

                ctx.strokeRect(screenX, screenY, this.chunk_size * this.tile_size, this.chunk_size * this.tile_size);
            }
        }

        ctx.restore();
    }

    /**
     * Draws the inner boundaries (hitboxes and map boundaries) on the canvas.
     *
     * This method is used for debugging purposes to visualize the hitboxes and boundaries
     * within the viewport. It draws red rectangles for hitboxes and green rectangles for boundaries.
     * NOTE: pass debug=true in options to enable.
     *
     * @private
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     */
    #drawInnerBoundaries(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;

        for (let hb of this.hitboxes) {
            const screenX = hb.x - this.real_position.x + this.viewPort.width / 2;
            const screenY = hb.y - this.real_position.y + this.viewPort.height / 2;

            if (screenX + hb.width >= 0 && screenX <= this.viewPort.width &&
                screenY + hb.height >= 0 && screenY <= this.viewPort.height) {
                ctx.fillRect(screenX, screenY, hb.width, hb.height);
                ctx.strokeRect(screenX, screenY, hb.width, hb.height);
            }
        }

        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        for (let boundary of this.boundaries) {
            const screenX = boundary.x - this.real_position.x + this.viewPort.width / 2;
            const screenY = boundary.y - this.real_position.y + this.viewPort.height / 2;

            if (screenX + boundary.width >= 0 && screenX <= this.viewPort.width &&
                screenY + boundary.height >= 0 && screenY <= this.viewPort.height) {
                ctx.fillRect(screenX, screenY, boundary.width, boundary.height);
                ctx.strokeRect(screenX, screenY, boundary.width, boundary.height);
            }
        }
        ctx.restore();
    }

    /**
     * Draws debug information about player position
     * @private
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     */
    #drawDebugInfo(ctx) {
        const info = this.getPositionInfo(this.real_position);

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 120);

        ctx.fillStyle = 'white';
        ctx.font = '14px monospace';
        ctx.fillText(`World Pos: ${Math.floor(info.worldPosition.x)}, ${Math.floor(info.worldPosition.y)}`, 20, 30);
        ctx.fillText(`Chunk: ${info.chunk.x}, ${info.chunk.y}`, 20, 50);
        ctx.fillText(`Pos in Chunk: ${Math.floor(info.positionInChunk.x)}, ${Math.floor(info.positionInChunk.y)}`, 20, 70);
        ctx.fillText(`Tile in Chunk: ${info.tileInChunk.x}, ${info.tileInChunk.y}`, 20, 90);
        ctx.fillText(`Loaded Chunks: ${this.chunks_loaded.size}`, 20, 110);
        ctx.restore();
    }

    /**
     * Updates map boundaries based on available chunks
     * Creates collision hitboxes for missing chunks
     *
     * @private
     * @param {Vector} center - Current chunk coordinates
     */
    #resolveBoundaries(center) {
        this.boundaries = [];

        for (let y = center.y - 1; y <= center.y + 1; y++) {
            for (let x = center.x - 1; x <= center.x + 1; x++) {
                const chunkKey = this.#genChunKey(x, y);
                const orphan_chunk = (
                    !this.chunks_loaded.has(chunkKey) ||
                    this.chunks_loaded.get(chunkKey) === null
                );

                if (orphan_chunk) {
                    this.#createBoundaryHitbox(x, y);

                    get_map_chunk(x, y, this.local)
                        .then(data => this.#mountChunk(data, chunkKey))
                        .catch(err => this.#errorMountingChunk(err, chunkKey));
                }
            }
        }
    }

    /**
     * Stores chunk data in the chunks_loaded map
     *
     * @private
     * @param {number[]|null} data - Chunk data as array of tile indices
     * @param {string} chunkKey - Chunk identifier
     */
    #mountChunk(data, chunkKey) {
        if (data) {
            this.chunks_loaded.set(chunkKey, data);
            logger.info(`Loaded chunk at ${chunkKey}`);
            return;
        }

        this.chunks_loaded.set(chunkKey, this.#createFallbackChunk(chunkKey));
        logger.warn(`Using fallback for chunk ${chunkKey}`);
    }

    /**
     * Handles chunk loading errors by using fallback chunk data
     *
     * @private
     * @param {Error} err - The error that occurred during loading
     * @param {string} chunkKey - Chunk identifier
     */
    #errorMountingChunk(err, chunkKey) {
        logger.error(`Error loading chunk ${chunkKey}: ${err}`);
        this.chunks_loaded.set(chunkKey, this.#createFallbackChunk(chunkKey));
    }

    /**
     * Creates boundary hitboxes at the edges of a chunk where no adjacent chunks exist
     * These hitboxes prevent the player from moving into unloaded areas
     *
     * @private
     * @param {number} chunkX - X coordinate of the chunk in the chunk grid
     * @param {number} chunkY - Y coordinate of the chunk in the chunk grid
     */
    #createBoundaryHitbox(chunkX, chunkY) {
        const worldX = chunkX * this.chunk_size * this.tile_size;
        const worldY = chunkY * this.chunk_size * this.tile_size;
        const size = this.chunk_size * this.tile_size;
        const edgeDim = 8;

        const directions = [
            { dx: -1, dy: 0, edge: 'left' },
            { dx: 1, dy: 0, edge: 'right' },
            { dx: 0, dy: -1, edge: 'top' },
            { dx: 0, dy: 1, edge: 'bottom' }
        ];

        for (const dir of directions) {
            const adjacentKey = this.#genChunKey(chunkX + dir.dx, chunkY + dir.dy);

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