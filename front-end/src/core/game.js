import { Player } from "@engine/objectPlayer.js";
import { ObjectMap } from "@engine/objectMap.js";
import { Vector } from "@utils/vector.js";
import MapSS from "@assets/map.png";

import logger from "@utils/logger.js";
import { HumanPlayer } from "@engine/humanPlayer.js";
import { FloodPlayer } from "@engine/floodplayer.js";


class Game {
    /**
     * @param options
     * @param [options.fps]
     * @param [options.player.size]
     * @param [options.player.position]
     * @param [options.miniMapWidth]
     * @param [options.miniMapHeight]
     * @param [options.map.width]
     * @param [options.map.height]
     * @param [options.miniMap.width]
     * @param [options.miniMap.height]
     */
    constructor(options = {}) {
        this.map = {};
        this.miniMap = {};

        this.map.width = options.map.width || window.innerWidth;
        this.map.height = options.map.height || window.innerHeight;

        this.miniMap.width = options.miniMap.width || this.map.width * 0.1;
        this.miniMap.height = options.miniMap.height || this.map.height * 0.1;

        this.fps = options.fps || 60;

        this.canvasMap = null;
        this.canvasMiniMap = null;

        this.contextMap = null;
        this.contextMiniMap = null;

        this.player = {};
        this.player.size = options.player.size || 50;
        this.player.position = options.position || new Vector(
            this.width / 2 - this.player.size / 2,
            this.height / 2 - this.player.size / 2
        );

        if (options.player === "human") {
            this.player.obj = new HumanPlayer(
                this.player.position, {
                    walkSpeed: 600,
                    runSpeed: 1200,
                    width: this.player.size,
                    height: this.player.size,
                });
        } else {
            this.player.obj = new FloodPlayer();
        }

        this.world = {};

        /** @type {ObjectMap} */
        this.world.map = new ObjectMap(MapSS, this.width, this.height, {
            tiles_per_row: 1,
            tile_size: 32,
            chunk_size: 16,
            n_loaded_chunks: 2,
            debug: true,
            real_position: Vector.zero(),
            scale: 1
        });

        this.previousTime = null;
        this.currentFrameID = null;

        logger.info("Game created.");
    }

    /**
     *
     * @param mapPtr
     * @param miniMapPtr
     */
    init(mapPtr, miniMapPtr) {
        this.canvasMap = mapPtr;
        this.canvasMiniMap = miniMapPtr;

        this.contextMap = this.canvasMap.getContext('2d');
        this.contextMiniMap = this.canvasMap.getContext('2d');
    }

    start() {
        this.previousTime = Date.now();
        this.currentFrameID = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        if (!this.currentFrameID) return;

        cancelAnimationFrame(this.currentFrameID);
    }

    restart() {
        // TODO: update logic.
        this.start();
    }

    loop(time) {
        const dt = time - this.previousTime;
        this.previousTime = time;

        this.update(dt);
        this.draw();

        this.currentFrameID = requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        this.player.obj.update(dt);
        // this.
    }

    draw() {

    }

    #handleResize(width, height) {
        this.width = width;
        this.height = height;
        this.world.map.resize(this.width, this.height);
    }
}

export { Game };