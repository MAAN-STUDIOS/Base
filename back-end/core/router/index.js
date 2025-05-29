import express from 'express';
import get_logger from '../utils/logger.js';
import { UserController } from "../controllers/user.js";


const router = express.Router();
const logger = get_logger('GameRouter');


router.get('/user/:id', UserController.get_user);

export { router };