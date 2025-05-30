import express from 'express';
import get_logger from '../utils/logger.js';
import { UserController } from "../controllers/user.js";
import { PlayerController } from '../controllers/player.js';


const router = express.Router();
const logger = get_logger('GameRouter');


router.get('/user/:id', UserController.get_user);
router.get('/player/:id', PlayerController.get_player);

export { router };