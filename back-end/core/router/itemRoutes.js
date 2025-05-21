import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    listItems,
    useItem,
    equipItem
} from '../controllers/itemController.js';

const router = express.Router();

// List items
router.get('/', auth, listItems);

// Use item
router.post('/use', auth, useItem);

// Equip item
router.patch('/equip', auth, equipItem);

export default router; 