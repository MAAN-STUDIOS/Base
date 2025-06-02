import express from 'express';
import get_logger from '../utils/logger.js';

import { UserController } from "../controllers/user.js";
import { PlayerController } from '../controllers/player.js';
import { AuthController } from '../controllers/auth.js';
import { GameController } from '../controllers/game.js';

//import { GameController } from '../controllers/game';


const router = express.Router();
const logger = get_logger('GameRouter');


router.get('/user/:id', UserController.get_user);
router.get('/player/:id', PlayerController.get_player);
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/verify', AuthController.verifyToken);
router.post('/auth/refresh', AuthController.refreshAccessToken);
router.get('/game/start/:name/:description/:seed', GameController.startGame)

export { router };