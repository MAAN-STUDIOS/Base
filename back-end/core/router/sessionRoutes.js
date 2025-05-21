import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    createSession,
    getSession,
    getWorldSeed
} from '../controllers/sessionController.js';

const router = express.Router();

// Create new session
router.post('/', auth, createSession);

// Get session by ID
router.get('/:id', auth, getSession);

// Get world seed
router.get('/:id/seed', auth, getWorldSeed);

export default router; 