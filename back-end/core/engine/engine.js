import db from "../../config/db.js";
import get_logger from "../utils/logger.js";
import { io, sockets } from '../sockets/index.js';

const logger = get_logger("GameEngine");

export class Game {
    constructor(options = {}) {
        this.game_id = options.id || null;
        this.name = options.name || "Untitled Game";
        this.description = options.description || "No description provided.";
        this.seed = options.seed || Math.floor(Math.random() * 1000000);

        this.state = "starting";
        this.start_time = null;
        this.last_update = Date.now();

        /**
         * socketID
         * @type {Map<string, {}>}
         */
        this.players = new Map();
        this.max_players = options.max_players || 8;

        this.stats = {
            fragments_collected: 0,
            total_kills: 0,
            total_deaths: 0
        };

        this.event_callbacks = new Map();

        logger.info(`Game created: ${this.name} (Seed: ${this.seed})`);
    }

    async init() {
        const ranges = {
            d1: {
                x: [-14, -7],
                y: [-5, 5]
            },
            d2: {
                x: [7, 14],
                y: [-5, 5]
            },
            d3: {
                x: [-3, 3],
                y: [-10, 10]
            }
        };

        const randInt = (range) => {
            const n = Math.sin(this.seed) * 10000;
            const random = n - Math.floor(n);

            const min = range[0];
            const max = range[1];
            return Math.floor(random * (max - min + 1)) + min;
        };

        try {
            const result = await db.query(
                "INSERT INTO game (name, description, status, seed, start_time) VALUES (?, ?, ?, ?, now())",
                [this.name, this.description, "starting", this.seed]
            );
            this.game_id = result.insertId;
            const dungeon_1_x = randInt(ranges.d1.x);
            const dungeon_1_y = randInt(ranges.d1.y);
            const dungeon_2_x = randInt(ranges.d2.x);
            const dungeon_2_y = randInt(ranges.d2.y);
            const dungeon_3_x = randInt(ranges.d3.x);
            const dungeon_3_y = randInt(ranges.d3.y);

            await db.query(
                `INSERT
                 INTO game_dungeon (game_id, dungeon_id, offset_x, offset_y)
                 VALUES (?, 1, ?, ?),
                        (?, 2, ?, ?),
                        (?, 3, ?, ?),
                        (?, 4, ?, ?),
                        (?, 5, ?, ?)`,
                [
                    this.game_id, dungeon_1_x, dungeon_1_y,
                    this.game_id, dungeon_2_x, dungeon_2_y,
                    this.game_id, dungeon_3_x, dungeon_3_y,
                    this.game_id, dungeon_1_x - 1, dungeon_1_y - 1,
                    this.game_id, dungeon_2_x - 1, dungeon_2_y - 1
                ]
            );

            logger.info(`Game ${this.game_id} initialized successfully`);

            await this.start();
            return true;
        } catch (error) {
            logger.error("Failed to initialize game:", error);
            throw error;
        }
    }

    async start() {
        if (this.state !== "starting") return false;

        this.state = "running";
        this.start_time = Date.now();

        await db.query(
            "UPDATE game SET status = 'running' WHERE id = ?",
            [this.game_id]
        );

        logger.info(`Game ${this.game_id} started`);
        this.#emit_event("game_started", { game_id: this.game_id });
        return true;
    }

    async add_player(socket_id, player_data) {
        if (this.players.size >= this.max_players) {
            return { success: false, reason: "Game is full" };
        }

        const { player_type, username, player_id } = player_data;

        try {
            const player_result = await db.query(
                "INSERT INTO player_game (player_id, game_id, health, kills, last_position_x, last_position_y) VALUES (?, ?, ?, ?, ?, ?)",
                [player_id, this.game_id, 100, 0, 0, 0]
            ); // TODO: make them spawn in different places

            const player = {
                id: player_id,
                socket_id,
                username,
                player_type,
                player_game_id: player_result.insertId,
                position: { x: 0, y: 0 },
                health: 100,
                max_health: 100,
                is_alive: true,
                current_map: "overworld",

                ...(player_type === "human" && {
                    oxygen: 100,
                    weapons: [1, 2], // TODO: later
                    generators_activated: 0
                }),

                ...(player_type === "flood" && {
                    biomass: 0,
                    evolution: 1,
                    infected: 0
                })
            };

            const status = sockets.joinRoom(socket_id, this.game_id);

            if (!status.success) {
                logger.error(`Failed to join player ${player.id} with socker_id: ${player.socket_id} to a room: ${status.reason}`);
            }

            this.players.set(socket_id, player);
            logger.info(`Player ${username} (${player_type}) joined game ${this.game_id}`);

            return { success: true, player };
        } catch (err) {
            logger.error(`Failed to join player with id: ${player_id} to game ${this.game_id}`);
            return { success: false, reason: err };
        }
    }

    remove_player(socket_id) {
        const player = this.players.get(socket_id);
        if (player) {
            this.players.delete(socket_id);

            io.sockets.get(socket_id).leave(this.game_id);
            logger.info(`Player ${player.username} left game ${this.game_id}`);
        }
    }

    async end_game(reason) {
        if (this.state === "ended") return;

        this.state = "ended";

        await db.query(
            "UPDATE game SET status = ?, end_time = now() WHERE id = ?",
            [this.state, this.game_id]
        );

        for (const [_, player] of this.players) {
            await this.#save_player_final_stats(player);
        }

        this.#emit_event("game_ended", { reason, stats: this.stats });
        logger.info(`Game ${this.game_id} ended: ${reason}`);
    }

    async #save_player_final_stats(player) {
        await db.query(
            "UPDATE player_game SET health = ?, last_position_x = ?, last_position_y = ? WHERE id = ?",
            [player.health, player.position.x, player.position.y, player.player_game_id]
        );

        if (player.player_type === "flood") {
            await db.query(
                "INSERT INTO flood_game (player_game_id, biomass, infected) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE biomass = ?, infected = ?",
                [player.player_game_id, player.biomass, player.infected, player.biomass, player.infected]
            );
        } else if (player.player_type === "human") {
            await db.query(
                "INSERT INTO human_game (oxygen, weapon_1, weapon_2, generators_activated) VALUES (?, ?, ?, ?)",
                [player.oxygen, player.weapons[0], player.weapons[1], player.generators_activated]
            );
        }
    }

    on(event_type, callback) {
        if (!this.event_callbacks.has(event_type)) {
            this.event_callbacks.set(event_type, new Set());
        }
        this.event_callbacks.get(event_type).add(callback);
    }

    #emit_event(event_type, data) {
        if (this.event_callbacks.has(event_type)) {
            for (const callback of this.event_callbacks.get(event_type)) {
                try {
                    callback({ ...data, game_id: this.game_id });
                } catch (error) {
                    logger.error(`Error in event callback for ${event_type}:`, error);
                }
            }
        }
    }

    async get_chunk(chunk_x, chunk_y) {
        let chunk_data;
        try {
            chunk_data = await db.query(
                `SELECT data
                 FROM view_chunk
                 WHERE game_id = ?
                   AND chunk_x = ?
                   AND chunk_y = ?`,
                [this.game_id, chunk_x, chunk_y]
            );

            if (!chunk_data || chunk_data.length === 0) {
                return {empty: true};
            }
        } catch (err) {
            logger.error(`Error while getting chunk: ${err}`);
            return null;
        }

        try {
            /**
             * @NOTE: Its necessary to remove travelling \r or \n
             * cause of the way they were insert in db,
             *
             * @WARING: Don't remove 10, radix is not the default always!!
             */
            return {
                data: chunk_data[0].data.split(",").map(t => parseInt(t.toString().replace(/\\n|\\r/g, ""), 10))
            };
        } catch (err) {
            logger.error(`Error while creating chunk: ${err}`);
        }

        return null;

    } 
    async get_spawn(player_type){
        try {
            let spawn_data;
            if (player_type === "human") {
                spawn_data = await db.query(
                    `SELECT offset_x, offset_y
                     FROM game_dungeon WHERE game_id = ? AND dungeon_id = 4`,
                    [this.game_id]
                );
            } else {
                spawn_data = await db.query(
                    `SELECT offset_x, offset_y
                     FROM game_dungeon WHERE game_id = ? AND dungeon_id = 5`,
                    [this.game_id]
                );
            }
            //console.log(spawn_data);
            if (spawn_data && spawn_data.length > 0) {
                return {
                    x: spawn_data[0].offset_x * 3200 + 1600,
                    y: spawn_data[0].offset_y * 3200 + 1600
                };
            }
            console.log(spawn_data);
            return null;

        } catch (err) {
            logger.error(`Error while getting spawn for player type ${player_type}:`, err);
            return null;
        }
    }

    get_dungeon(dungeon_id) {
        return null;
    }

    get_game_state() {
        return {
            game_id: this.game_id,
            state: this.state,
            players: Array.from(this.players.values()),
            stats: this.stats,
            overworld_size: 7,
            dungeon_count: 3
        };
    }

    player_enter_dungeon(socket_id, dungeon_id) {
        const player = this.players.get(socket_id);
        if (player) {
            player.current_map = `dungeon_${dungeon_id}`;
            player.position = { x: 0, y: 0 };

            logger.info(`Player ${player.username} entered dungeon ${dungeon_id}`);
            return true;
        }
        return false;
    }

    player_exit_dungeon(socket_id) {
        const player = this.players.get(socket_id);
        if (player && player.current_map.startsWith("dungeon_")) {
            player.current_map = "overworld";
            player.position = { x: 0, y: 0 };

            logger.info(`Player ${player.username} returned to overworld`);
            return true;
        }
        return false;
    }
}