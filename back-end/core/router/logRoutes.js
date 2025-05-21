import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getUserLogs,
    registerLog
} from '../controllers/logController.js';

const router = express.Router();

// Get user logs
router.get('/:user', auth, getUserLogs);

// Register log discovery
router.post('/', auth, registerLog);

export default router; 