import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getRankings
} from '../controllers/rankingController.js';

const router = express.Router();

// Get rankings
router.get('/', auth, getRankings);

export default router; 