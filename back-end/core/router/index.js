import express from 'express';
import get_logger from '../utils/logger.js';
import { UserController } from "../controllers/user.js";
import {GameController}from "../controllers/game.js";
import {AuthController} from "../controllers/auth.js";


const router = express.Router();
const logger = get_logger('GameRouter');


router.get('/user/:id', UserController.get_user);
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/verify', AuthController.verifyToken);
router.post('/auth/refresh', AuthController.refreshAccessToken);
router.get('/game/start/:name/:description/:seed', GameController.startGame)


export { router };