import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    reportEvent
} from '../controllers/eventController.js';

const router = express.Router();

// Report event
router.post('/', auth, reportEvent);

export default router; 