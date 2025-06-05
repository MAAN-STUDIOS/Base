import express from 'express';
import get_logger from '../utils/logger.js';

import { UserController } from "../controllers/user.js";
import { AdminController } from '../controllers/admin.js';
import { StatsController } from '../controllers/stats.js';
import { ConfigController } from '../controllers/config.js';
import { PlayerController } from '../controllers/player.js';
import { AuthController } from '../controllers/auth.js';
import { GameController } from '../controllers/game.js';
import { ViewDungeon } from '../controllers/viewDungeon.js';
import { ViewNode } from '../controllers/viewNode.js';
import { ViewLayout } from '../controllers/viewLayout.js';
import { viewChunk } from '../controllers/viewChunk.js';
import { HumanGame } from '../controllers/viewHumanGame.js';
import { FloodGame } from '../controllers/viewFloodGame.js';
import { ViewGameController } from '../controllers/viewGame.js';

const router = express.Router();
const logger = get_logger('GameRouter');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         name:
 *           type: string
 *           description: User display name
 *     AuthRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           minimum: 6
 *           description: User password
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User display name
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           minimum: 6
 *           description: User password
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         user:
 *           $ref: '#/components/schemas/User'
 *     Game:
 *       type: object
 *       properties:
 *         game_id:
 *           type: integer
 *           description: Game unique identifier
 *         name:
 *           type: string
 *           description: Game name
 *         description:
 *           type: string
 *           description: Game description
 *         seed:
 *           type: integer
 *           description: Random seed for map generation
 *         state:
 *           type: string
 *           enum: [starting, running, ended]
 *           description: Current game state
 *         current_players:
 *           type: integer
 *           description: Number of current players
 *         max_players:
 *           type: integer
 *           description: Maximum allowed players
 *         can_join:
 *           type: boolean
 *           description: Whether the game accepts new players
 *     CreateGameRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Game name
 *         description:
 *           type: string
 *           description: Game description
 *         seed:
 *           type: integer
 *           description: Random seed for map generation
 *         max_players:
 *           type: integer
 *           minimum: 2
 *           maximum: 20
 *           description: Maximum number of players
 *     JoinGameRequest:
 *       type: object
 *       required:
 *         - player_type
 *         - socket_id
 *       properties:
 *         player_type:
 *           type: string
 *           enum: [human, flood]
 *           description: Type of player
 *         socket_id:
 *           type: string
 *           description: Socket connection identifier
 *     SocketRequest:
 *       type: object
 *       required:
 *         - socket_id
 *       properties:
 *         socket_id:
 *           type: string
 *           description: Socket connection identifier
 *     Player:
 *       type: object
 *       properties:
 *         socket_id:
 *           type: string
 *           description: Socket connection identifier
 *         username:
 *           type: string
 *           description: Player username
 *         player_type:
 *           type: string
 *           enum: [human, flood]
 *           description: Player type
 *         position:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *             y:
 *               type: number
 *         health:
 *           type: integer
 *           description: Current health points
 *         is_alive:
 *           type: boolean
 *           description: Whether player is alive
 *         current_map:
 *           type: string
 *           description: Current map location
 *     GameState:
 *       type: object
 *       properties:
 *         game_id:
 *           type: integer
 *         state:
 *           type: string
 *           enum: [starting, running, ended]
 *         players:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Player'
 *         stats:
 *           type: object
 *           properties:
 *             fragments_collected:
 *               type: integer
 *             total_kills:
 *               type: integer
 *             total_deaths:
 *               type: integer
 *         overworld_size:
 *           type: integer
 *         dungeon_count:
 *           type: integer
 *     Chunk:
 *       type: object
 *       properties:
 *         chunk_x:
 *           type: integer
 *         chunk_y:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             type: integer
 *           description: Chunk tile data as flat array
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 */

// ================================
// AUTH ROUTES
// ================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/login', AuthController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User registration
 *     description: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/register', AuthController.register);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify JWT token
 *     description: Verify the validity of a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/verify', AuthController.verifyToken);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: New token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *       400:
 *         description: Refresh token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/refresh', AuthController.refreshAccessToken);

// ================================
// USER ROUTES
// ================================

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve user information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user/:id', UserController.get_user);

/**
 * @swagger
 * /admin/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin information
 *     description: Retrieve admin information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin/:id', AdminController.get_Admin);

/**
 * @swagger
 * /stats/{id}:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get player statistics
 *     description: Retrieve player statistics by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats/:id', StatsController.get_Stats);

/**
 * @swagger
 * /config/{id}:
 *   get:
 *     tags:
 *       - Configuration
 *     summary: Get configuration
 *     description: Retrieve configuration by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Configuration ID
 *     responses:
 *       200:
 *         description: Configuration data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/config/:id', ConfigController.get_config);

/**
 * @swagger
 * /player/{id}:
 *   get:
 *     tags:
 *       - Players
 *     summary: Get player information
 *     description: Retrieve player information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/player/:id', PlayerController.get_player);

// ================================
// GAME MANAGEMENT ROUTES
// ================================

/**
 * @swagger
 * /games:
 *   post:
 *     tags:
 *       - Game Management
 *     summary: Create a new game
 *     description: Create a new multiplayer game session
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGameRequest'
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game_id:
 *                   type: integer
 *                 game_info:
 *                   $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     tags:
 *       - Game Management
 *     summary: List all active games
 *     description: Get a list of all currently active games
 *     responses:
 *       200:
 *         description: List of active games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games', GameController.createGame);
router.get('/games', GameController.listGames);

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     tags:
 *       - Game Management
 *     summary: Get specific game information
 *     description: Retrieve detailed information about a specific game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game_info:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/:id', GameController.getGameInfo);

/**
 * @swagger
 * /games/{id}/start:
 *   post:
 *     tags:
 *       - Game Management
 *     summary: Start a game
 *     description: Start a game that is currently in starting state
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Game cannot be started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games/:id/start', GameController.startGame);

// ================================
// PLAYER GAME ROUTES
// ================================

/**
 * @swagger
 * /games/{id}/join:
 *   post:
 *     tags:
 *       - Player Actions
 *     summary: Join a game
 *     description: Join a specific game as either human or flood player
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinGameRequest'
 *     responses:
 *       200:
 *         description: Successfully joined game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 player:
 *                   $ref: '#/components/schemas/Player'
 *                 game_state:
 *                   $ref: '#/components/schemas/GameState'
 *       400:
 *         description: Cannot join game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games/:id/join', GameController.joinGame);

/**
 * @swagger
 * /games/leave:
 *   post:
 *     tags:
 *       - Player Actions
 *     summary: Leave current game
 *     description: Leave the currently joined game
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocketRequest'
 *     responses:
 *       200:
 *         description: Successfully left game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Not in any game or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games/leave', GameController.leaveGame);

/**
 * @swagger
 * /games/player/current:
 *   get:
 *     tags:
 *       - Player Actions
 *     summary: Get current game
 *     description: Get information about the player's current game
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: socket_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Socket connection ID
 *     responses:
 *       200:
 *         description: Current game information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game_id:
 *                   type: integer
 *                 player_data:
 *                   $ref: '#/components/schemas/Player'
 *                 game_state:
 *                   $ref: '#/components/schemas/GameState'
 *       400:
 *         description: Socket ID required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Player not in any game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/player/current', GameController.getCurrentGame);

// ================================
// GAME STATE & MAP DATA ROUTES
// ================================

/**
 * @swagger
 * /games/{id}/state:
 *   get:
 *     tags:
 *       - Game State
 *     summary: Get current game state
 *     description: Retrieve the current state of a specific game
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Current game state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game_state:
 *                   $ref: '#/components/schemas/GameState'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/:id/state', GameController.getGameState);

/**
 * @swagger
 * /games/{id}/chunks/{x}/{y}:
 *   get:
 *     tags:
 *       - Map Data
 *     summary: Get chunk data
 *     description: Retrieve chunk data for specific coordinates in a game
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *       - in: path
 *         name: x
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chunk X coordinate
 *       - in: path
 *         name: y
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chunk Y coordinate
 *     responses:
 *       200:
 *         description: Chunk data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chunk_data:
 *                   $ref: '#/components/schemas/Chunk'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game or chunk not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/:id/chunks/:x/:y', GameController.getChunk);

/**
 * @swagger
 * /games/{id}/dungeons/{dungeon_id}:
 *   get:
 *     tags:
 *       - Map Data
 *     summary: Get dungeon data
 *     description: Retrieve dungeon data for a specific dungeon in a game
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *       - in: path
 *         name: dungeon_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dungeon ID
 *     responses:
 *       200:
 *         description: Dungeon data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dungeon_data:
 *                   type: object
 *                   description: Dungeon layout and information
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game or dungeon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/:id/dungeons/:dungeon_id', GameController.getDungeon);

// ================================
// DUNGEON NAVIGATION ROUTES
// ================================

/**
 * @swagger
 * /games/dungeons/{dungeon_id}/enter:
 *   post:
 *     tags:
 *       - Dungeon Navigation
 *     summary: Enter a dungeon
 *     description: Enter a specific dungeon in the current game
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dungeon_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         description: Dungeon ID (1-3)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocketRequest'
 *     responses:
 *       200:
 *         description: Successfully entered dungeon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid parameters or cannot enter dungeon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games/dungeons/:dungeon_id/enter', GameController.enterDungeon);

/**
 * @swagger
 * /games/dungeons/exit:
 *   post:
 *     tags:
 *       - Dungeon Navigation
 *     summary: Exit current dungeon
 *     description: Exit the currently entered dungeon and return to overworld
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocketRequest'
 *     responses:
 *       200:
 *         description: Successfully exited dungeon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Not in a dungeon or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/games/dungeons/exit', GameController.exitDungeon);

// ================================
// ADMIN/MONITORING ROUTES
// ================================

/**
 * @swagger
 * /games/stats:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Get server statistics
 *     description: Retrieve server performance and game statistics (admin access)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Server statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_games:
 *                       type: integer
 *                     total_players:
 *                       type: integer
 *                     games_by_state:
 *                       type: object
 *                       properties:
 *                         starting:
 *                           type: integer
 *                         running:
 *                           type: integer
 *                         ended:
 *                           type: integer
 *                     memory_usage:
 *                       type: object
 *                 requested_by:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/games/stats', GameController.getServerStats);

// ================================
// VIEWS (Database Views)
// ================================

/**
 * @swagger
 * /api/view/game:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get game view data
 *     description: Retrieve data from the game database view
 *     responses:
 *       200:
 *         description: Game view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/game', ViewGameController.get_viewGame);

/**
 * @swagger
 * /api/view/flood_view_game:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get flood player game view
 *     description: Retrieve flood player specific game data
 *     responses:
 *       200:
 *         description: Flood game view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/flood_view_game', FloodGame.get_viewFloodGame);

/**
 * @swagger
 * /api/view/human_view_game:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get human player game view
 *     description: Retrieve human player specific game data
 *     responses:
 *       200:
 *         description: Human game view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/human_view_game', HumanGame.get_viewHumanGame);

/**
 * @swagger
 * /api/view/chunk:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get chunk view data
 *     description: Retrieve chunk data from database view
 *     responses:
 *       200:
 *         description: Chunk view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/chunk', viewChunk.get_viewChunk);

/**
 * @swagger
 * /api/view/layout:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get layout view data
 *     description: Retrieve layout data from database view
 *     responses:
 *       200:
 *         description: Layout view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/layout', ViewLayout.get_viewLayout);

/**
 * @swagger
 * /api/view/node:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get node view data
 *     description: Retrieve node data from database view
 *     responses:
 *       200:
 *         description: Node view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/node', ViewNode.get_viewNode);

/**
 * @swagger
 * /api/view/dungeon:
 *   get:
 *     tags:
 *       - Database Views
 *     summary: Get dungeon view data
 *     description: Retrieve dungeon data from database view
 *     responses:
 *       200:
 *         description: Dungeon view data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/view/dungeon', ViewDungeon.get_viewDungeon);

logger.info('Game router initialized with all endpoints');

export { router };