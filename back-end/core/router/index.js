import express from 'express';
import { get_logger } from '#utils';

import {UserController, AuthController, GameController } from '#controllers';
//import { GameController } from '../controllers/game';


const router = express.Router();
const logger = get_logger('GameRouter');


// router.get('/game/chunk/:x/:y');
router.get('/user/:id', UserController.get_user);
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/verify', AuthController.verifyToken);
router.post('/auth/refresh', AuthController.refreshAccessToken);
router.get('/game/start/:name/:description/:seed', GameController.startGame)


export { router };