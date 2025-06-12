import { Game } from '../engine/engine.js';
import get_logger from '../utils/logger.js';
import { io } from "../sockets/index.js";
import db from "../../config/db.js";

const logger = get_logger('GameHandler');

class GameHandler {
    constructor() {
        /**
         *
         * @type {Map<number, Game>}
         */
        this.active_games = new Map(); // game_id -> Game instance
        this.player_to_game = new Map(); // player_id -> game_id
        this.game_id_counter = 1;

        setInterval(() => {
            this.#cleanup_inactive_games();
        }, 5 * 60 * 1000);

        logger.info("GameHandler initialized.");
    }

    async #restore_games() {
        const games = await db.query('SELECT * FROM game WHERE end_time IS NULL');

        games.forEach((game) => {
            const instance = new Game({
                id: game.id,
                name: game.name,
                description: game.description,
                seed: game.seed,
                max_players: game.max_players
            });

            this.active_games.set(game.id, instance);
        });
    }

    init() {
        this.#restore_games().then(() => {
            logger.info("Games successfully restore");
        });

        io.on('connection', socket => {

        });
    }

    async create_game(options = {}) {
        try {
            const {
                name = `Game ${this.game_id_counter}`,
                description = "Humans vs Flood battle",
                seed = Math.floor(Math.random() * 1000000),
                max_players = 8,
                creator_id = null
            } = options;

            logger.info(`Creating new game: ${name} (Seed: ${seed})`);

            const game = new Game({
                name,
                description,
                seed,
                max_players
            });


            await game.init();

            const game_id = game.game_id;
            this.active_games.set(game_id, game);

            this.#setup_game_events(game);

            logger.info(`Game ${game_id} created successfully`);

            return {
                success: true,
                game_id,
                game_info: {
                    name: game.name,
                    description: game.description,
                    seed: game.seed,
                    max_players: game.max_players,
                    current_players: game.players.size,
                    state: game.state
                }
            };
        } catch (error) {
            logger.error("Failed to create game:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async start_game(game_id) {
        try {
            const game = this.active_games.get(game_id);
            if (!game) {
                return { success: false, error: "Game not found" };
            }

            if (game.state !== "starting") {
                return { success: false, error: `Game is already ${game.state}` };
            }

            const started = await game.start();
            if (started) {
                logger.info(`Game ${game_id} started successfully`);
                return { success: true, message: "Game started" };
            } else {
                return { success: false, error: "Failed to start game" };
            }
        } catch (error) {
            logger.error(`Failed to start game ${game_id}:`, error);
            return { success: false, error: error.message };
        }
    }

    async join_game(game_id, socket_id, player_data) {
        try {
            const game = this.active_games.get(game_id);
            if (!game) {
                return { success: false, error: "Game not found" };
            }
            
            const { player_id } = player_data;
            
            if (this.player_to_game.has(player_id)) {
                const current_game_id = this.player_to_game.get(player_id);
                if (current_game_id !== game_id) {
                    await this.leave_game(player_id);
                }
            }

            const result = await game.add_player(socket_id, player_data);

            if (result.success) {
                this.player_to_game.set(player_id, game_id);
                logger.info(`Player ${player_data.username} joined game ${game_id}`);

                return {
                    success: true,
                    player: result.player,
                    game_state: game.get_game_state()
                };
            } else {
                return result;
            }
        } catch (error) {
            logger.error(`Failed to join game ${game_id}:`, error);
            return { success: false, error: error.message };
        }
    }
    
    async report_boss_defeat(game_id, player_id){
        try {
            const game = this.active_games.get(game_id);
            if (!game) {
                return { success: false, error: "Game not found" };
            }

            if (!this.player_to_game.has(player_id)) {
                return { success: false, error: "Player not in any game" };
            }

            const player = game.players.get(player_id);
            if (!player) {
                return { success: false, error: "Player not found in game" };
            }

            const result = await game.report_boss_defeat(player_id);

            if (result && result.success !== undefined) {
                return result;
            } else {
                return { success: true, message: "Boss defeat reported successfully" };
            }
        } catch (error) {
            logger.error(`Failed to report boss defeat in game ${game_id}:`, error);
            return { success: false, error: error.message };
        }
        
    }

    async leave_game(player_id) {
        try {
            const game_id = this.player_to_game.get(player_id);
            if (!game_id) {
                return { success: false, error: "Player not in any game" };
            }

            const game = this.active_games.get(game_id);
            if (game) {
                game.remove_player(player_id);

                // Check if game should be ended (no players left)
                if (game.players.size === 0) {
                    await this.#end_empty_game(game_id);
                }
            }

            this.player_to_game.delete(player_id);
            logger.info(`Player left game ${game_id}`);

            return { success: true };
        } catch (error) {
            logger.error(`Failed to remove player from game:`, error);
            return { success: false, error: error.message };
        }
    }

    get_active_games() {
        const games = [];

        for (const [game_id, game] of this.active_games) {
            games.push({
                game_id,
                name: game.name,
                description: game.description,
                state: game.state,
                current_players: game.players.size,
                max_players: game.max_players,
                can_join: game.state === "starting" && game.players.size < game.max_players
            });
        }

        return games;
    }

    get_game_info(game_id) {
        const game = this.active_games.get(game_id);
        if (!game) {
            logger.info(`Game ${game_id} not found`);
            return { success: false, error: "Game not found" };
        }

        return {
            success: true,
            game_info: {
                game_id,
                name: game.name,
                description: game.description,
                seed: game.seed,
                state: game.state,
                current_players: game.players.size,
                max_players: game.max_players,
                stats: game.stats
            }
        };
    }

    get_game_state(game_id) {
        const game = this.active_games.get(game_id);
        if (!game) {
            return { success: false, error: "Game not found" };
        }

        return {
            success: true,
            game_state: game.get_game_state()
        };
    }

    async get_chunk(game_id, chunk_x, chunk_y) {
        const game = this.active_games.get(game_id);
        if (!game) {
            return { success: false, error: "Game not found" };
        }

        const chunk = await game.get_chunk(chunk_x, chunk_y);
        if (!chunk) {
            return { success: false, error: "Chunk not found" };
        }

        return {
            success: true,
            empty: chunk.empty,
            chunk_data: chunk.data
        };
    }
    
    async get_spawn(game_id, player_type) {
        logger.debug(`Getting spawn for game ${game_id}, player type: ${player_type}`);
        const game = this.active_games.get(game_id);
        if (!game) {
            return { success: false, error: "Game not found" };
        }

        const spawn = await game.get_spawn(player_type);
        console.log("Spawn point:", spawn);
        if (!spawn) {
            return { success: false, error: "Spawn point not found" };
        }

        logger.debug(`Spawn point found at (${spawn.x}, ${spawn.y}) for player type: ${player_type}`);
        return {
            success: true,
            x: spawn.x,
            y: spawn.y,
        };
    }

    get_dungeon(game_id, dungeon_id) {
        const game = this.active_games.get(game_id);
        if (!game) {
            return { success: false, error: "Game not found" };
        }

        const dungeon = game.get_dungeon(dungeon_id);
        if (!dungeon) {
            return { success: false, error: "Dungeon not found" };
        }

        return {
            success: true,
            dungeon_data: dungeon
        };
    }

    async end_game(game_id, reason = "manually_ended") {
        try {
            const game = this.active_games.get(game_id);
            if (!game) {
                return { success: false, error: "Game not found" };
            }

            await game.end_game(reason);

            for (const [player_id, tracked_game_id] of this.player_to_game) {
                if (tracked_game_id === game_id) {
                    this.player_to_game.delete(player_id);
                }
            }

            this.active_games.delete(game_id);
            logger.info(`Game ${game_id} ended: ${reason}`);

            return { success: true, message: "Game ended" };
        } catch (error) {
            logger.error(`Failed to end game ${game_id}:`, error);
            return { success: false, error: error.message };
        }
    }

    get_player_game(player_id) {
        const game_id = this.player_to_game.get(player_id);
        if (!game_id) {
            return { success: false, error: "Player not in any game" };
        }

        const game = this.active_games.get(game_id);
        if (!game) {
            this.player_to_game.delete(player_id);
            return { success: false, error: "Game not found" };
        }

        const player = game.players.get(player_id);
        return {
            success: true,
            game_id,
            player_data: player,
            game_state: game.get_game_state()
        };
    }

    get_server_stats() {
        let total_players = 0;
        let games_by_state = { starting: 0, running: 0, ended: 0 };

        for (const game of this.active_games.values()) {
            total_players += game.players.size;
            games_by_state[game.state] = (games_by_state[game.state] || 0) + 1;
        }

        return {
            total_games: this.active_games.size,
            total_players,
            games_by_state,
            memory_usage: process.memoryUsage()
        };
    }

    #setup_game_events(game) {
        game.on('game_started', (data) => {
            logger.info(`Game ${data.game_id} started`);
        });

        game.on('game_ended', (data) => {
            logger.info(`Game ${data.game_id} ended: ${data.reason}`);

            for (const [player_id, game_id] of this.player_to_game) {
                if (game_id === data.game_id) {
                    this.player_to_game.delete(player_id);
                }
            }

            setTimeout(() => {
                this.active_games.delete(data.game_id);
            }, 30000);
        });
    }

    async #end_empty_game(game_id) {
        const game = this.active_games.get(game_id);
        if (game && game.players.size === 0) {
            logger.info(`Ending empty game ${game_id}`);
            await game.end_game("no_players");
        }
    }

    #cleanup_inactive_games() {
        const now = Date.now();
        const max_idle_time = 30 * 60 * 1000; // 30 minutes

        for (const [game_id, game] of this.active_games) {
            const idle_time = now - game.last_update;

            if (game.state === "ended" ||
                (game.players.size === 0 && idle_time > max_idle_time)) {

                logger.info(`Cleaning up inactive game ${game_id}`);
                this.active_games.delete(game_id);

                // Clean up any orphaned player references
                for (const [player_id, tracked_game_id] of this.player_to_game) {
                    if (tracked_game_id === game_id) {
                        this.player_to_game.delete(player_id);
                    }
                }
            }
        }
    }
}

// Export singleton instance
export const gameHandler = new GameHandler();