import { gameHandler } from '../handlers/gameHandler.js';
import { verifyToken } from '../middleware/auth.js';
import get_logger from '../utils/logger.js';

const logger = get_logger('GameController');

const authenticateUser = (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).json({ success: false, error: 'Unauthorized - No authorization header provided' });
        return null;
    }

    let token = req.headers.authorization;
    token = token.includes("Bearer") ? token.split(' ')[1] : token;

    if (!token) {
        res.status(401).send({ error: 'Unauthorized - No token provided' });
        return null
    }

    const user = verifyToken(token);

    if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized - Invalid token' });
        return null;
    }

    return user;
};

export class GameController {
    static async createGame(req, res) {
        try {
            const user = authenticateUser(req, res);
            if (!user) return;

            const { name, description, seed, max_players } = req.body;

            if (max_players > 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Max players must be less than 2'
                });
            }
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Game name is required'
                });
            }

            // Additional validation
            if (name.length > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Game name must be less than 100 characters'
                });
            }

            if (max_players && (max_players < 2 || max_players > 20)) {
                return res.status(400).json({
                    success: false,
                    error: 'Max players must be between 2 and 20'
                });
            }

            const result = await gameHandler.create_game({
                name: name.trim(),
                description: description?.trim() || '',
                seed: seed || Math.floor(Math.random() * 1000000),
                max_players: max_players || 8,
                creator_id: user.id
            });

            if (result.success) {
                logger.info(`User ${user.id} created game ${result.game_id}`);

                await gameHandler.start_game(result.game_id);
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error('Failed to create game:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create game'
            });
        }
    }

    // TODO: maybe del later
    static async startGame(req, res) {
        try {
            const user = authenticateUser(req, res);
            if (!user) return;

            const game_id = parseInt(req.params.id);
            if (isNaN(game_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid game ID'
                });
            }

            const result = await gameHandler.start_game(game_id);

            if (result.success) {
                logger.info(`User ${user.username} started game ${game_id}`);
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error('Failed to start game:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to start game'
            });
        }
    }

    static async joinGame(req, res) {
        try {

            const user = authenticateUser(req, res);
            if (!user) return;

            const game_id = parseInt(req.params.id);
            const { player_type, socket_id } = req.body;


            if (isNaN(game_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid game ID'
                });
            }

            if (!player_type || !['human', 'flood'].includes(player_type)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid player type. Must be "human" or "flood"'
                });
            }

            if (!socket_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Socket ID is required'
                });
            }

            const result = await gameHandler.join_game(game_id, socket_id, {
                player_type,
                username: user.username,
                player_id: user.id
            });

            if (result.success) {
                logger.info(`User ${user.id} joined game ${game_id} as ${player_type}`);
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error('Failed to join game:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to join game'
            });
        }
    }


    static async leaveGame(req, res) {
        try {

            const user = authenticateUser(req, res);
            if (!user) return;

            const { socket_id } = req.body;

            if (!socket_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Socket ID is required'
                });
            }

            const result = await gameHandler.leave_game(socket_id);

            if (result.success) {
                logger.info(`User ${user.username} left their game`);
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            logger.error('Failed to leave game:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to leave game'
            });
        }
    }

    // List all active games (PUBLIC)
    static async listGames(req, res) {
        try {
            const games = gameHandler.get_active_games();
            res.status(200).json({
                success: true,
                games,
                total: games.length
            });
        } catch (error) {
            logger.error('Failed to list games:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve games'
            });
        }
    }

    // Get game info(PUBLIC)
    static async getGameInfo(req, res) {
        try {
            const game_id = parseInt(req.params.id);
            if (isNaN(game_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid game ID'
                });
            }

            const result = gameHandler.get_game_info(game_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            logger.error('Failed to get game info:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve game information'
            });
        }
    }

    //Get current game state
    static async getGameState(req, res) {
        try {

            const user = authenticateUser(req, res);
            if (!user) return;

            const game_id = parseInt(req.params.id);
            if (isNaN(game_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid game ID'
                });
            }

            const result = gameHandler.get_game_state(game_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            logger.error('Failed to get game state:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve game state'
            });
        }
    }

    // GET /games/:id/chunks/:x/:y - Get chunk data
    static async getChunk(req, res) {
        const user = authenticateUser(req, res);
        if (!user) return;

        const game_id = parseInt(req.params.id);
        const chunk_x = parseInt(req.params.x);
        const chunk_y = parseInt(req.params.y);

        if (isNaN(game_id) || isNaN(chunk_x) || isNaN(chunk_y)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        let result;
        try {
            result = await gameHandler.get_chunk(game_id, chunk_x, chunk_y);
        } catch (error) {
            logger.error('Failed to get chunk:', error.message);
            res.status(500).json({
                success: false,
                error: `Failed to retrieve chunk data: ${error.message}`
            });
            return;
        }

        if (result.success) {
            if (result.empty) {
                res.status(204).json(result)
            } else {
                res.status(200).json(result);
            }
        } else {
            res.status(404).json(result);
        }
    }
    // GET /games/:id/spawns/:player_type

    static async getSpawn(req, res) {
        //console.log('getSpawn called');
        const user = authenticateUser(req, res);
        if (!user) return;

        const game_id = parseInt(req.params.id);
        const player_type = req.params.player_type;


        if (isNaN(game_id) || !['human', 'flood'].includes(player_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters'
            });
        }

        let result;
        try {
            result = await gameHandler.get_spawn(game_id, player_type);
        } catch (error) {
            logger.error('Failed to get spawn:', error.message);
            res.status(500).json({
                success: false,
                error: `Failed to retrieve spawn data: ${error.message}`
            });
            return;
        }
        //console.log('getSpawn result:', result);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    }

    // GET /api/games/:id/dungeons/:dungeon_id - Get dungeon data
    static async getDungeon(req, res) {
        try {

            const user = authenticateUser(req, res);
            if (!user) return;

            const game_id = parseInt(req.params.id);
            const dungeon_id = parseInt(req.params.dungeon_id);

            if (isNaN(game_id) || isNaN(dungeon_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid parameters'
                });
            }

            const result = gameHandler.get_dungeon(game_id, dungeon_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            logger.error('Failed to get dungeon:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve dungeon data'
            });
        }
    }



    // GET /api/games/player/current - Get player's current game
    static async getCurrentGame(req, res) {
        try {
            const user = authenticateUser(req, res);
            if (!user) return;

            const { socket_id } = req.query;

            if (!socket_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Socket ID is required'
                });
            }

            const result = gameHandler.get_player_game(socket_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            logger.error('Failed to get current game:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve current game'
            });
        }
    }

    // GET /api/games/stats - Get server statistics (admin only)
    static async getServerStats(req, res) {
        try {
            const user = authenticateUser(req, res);
            if (!user) return;

            const stats = gameHandler.get_server_stats();
            res.status(200).json({
                success: true,
                stats,
                requested_by: user.username
            });
        } catch (error) {
            logger.error('Failed to get server stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve server statistics'
            });
        }
    }
}