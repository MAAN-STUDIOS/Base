import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    createUser,
    getUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Create new user
router.post('/', createUser);

// Get user by ID
router.get('/:id', auth, getUser);

// Update user
router.patch('/:id', auth, updateUser);

// Delete user
router.delete('/:id', auth, deleteUser);

export default router; 