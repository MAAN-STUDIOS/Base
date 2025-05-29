import express from 'express';
import { get_logger } from '#utils';
import { UserController } from "#controllers";


const router = express.Router();
const logger = get_logger('GameRouter');


// router.get('/game/chunk/:x/:y');
router.get('/user/:id', UserController.get_user);
router.post('/game')

export { router };