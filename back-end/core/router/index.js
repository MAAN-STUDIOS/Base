import express from 'express';
import get_logger from '../utils/logger.js';

import { UserController } from "../controllers/user.js";
import { ConfigController } from '../controllers/config.js';
import { PlayerController } from '../controllers/player.js';
import { AuthController } from '../controllers/auth.js';
import { GameController } from '../controllers/game.js';
import { ViewDungeon } from '../controllers/viewDungeon.js';

const router = express.Router();
const logger = get_logger('GameRouter');

// ================================
// AUTH ROUTES
// ================================
router.get('/user/:id', UserController.get_user);
router.get('/config/:id', ConfigController.get_config);
router.get('/player/:id', PlayerController.get_player);
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/verify', AuthController.verifyToken);
router.post('/auth/refresh', AuthController.refreshAccessToken);

// ================================
// USER ROUTES
// ================================
router.get('/user/:id', UserController.get_user);

// ================================
// GAME MANAGEMENT ROUTES
// ================================
router.post('/games', GameController.createGame);             // Create new game
router.get('/games', GameController.listGames);               // List all active games
router.get('/games/:id', GameController.getGameInfo);         // Get specific game info
router.post('/games/:id/start', GameController.startGame);    // Start a game

// ================================
// PLAYER GAME ROUTES
// ================================

router.post('/games/:id/join', GameController.joinGame);      // Join a game
router.post('/games/leave', GameController.leaveGame);        // Leave current game
router.get('/games/player/current', GameController.getCurrentGame); // Get player's current game

// ================================
// GAME STATE & MAP DATA ROUTES
// ================================

router.get('/games/:id/state', GameController.getGameState);  // Get current game state


router.get('/games/:id/chunks/:x/:y', GameController.getChunk); // Get chunk data
router.get('/games/:id/dungeons/:dungeon_id', GameController.getDungeon); // Get dungeon data

// ================================
// DUNGEON NAVIGATION ROUTES
// ================================

router.post('/games/dungeons/:dungeon_id/enter', GameController.enterDungeon); // Enter dungeon
router.post('/games/dungeons/exit', GameController.exitDungeon);               // Exit dungeon

// ================================
// ADMIN/MONITORING ROUTES
// ================================

router.get('/games/stats', GameController.getServerStats);    // Server statistics

// ================================
// MAP CHUNK ROUTES (Alternative structure)
// ================================
// Alternative: If you want map routes separate from games
// router.get('/map/chunk/:game_id/:x/:y', GameController.getChunk);
// router.get('/map/dungeon/:game_id/:dungeon_id', GameController.getDungeon);

logger.info('Game router initialized with all endpoints');

router.get('/api/view/dungeon', ViewDungeon.get_viewDungeon);

export { router };