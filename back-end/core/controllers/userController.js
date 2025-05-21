import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { get_logger } from '#utils';

const logger = get_logger("USER_CONTROLLER");

// Create new user
export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return user data and token
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            preferences: user.preferences,
            token
        });
    } catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error creating user'
        });
    }
};

// Get user by ID
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.json({
            id: user._id,
            username: user.username,
            stats: user.stats,
            progress: user.progress,
            preferences: user.preferences
        });
    } catch (error) {
        logger.error(`Error getting user: ${error.message}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error retrieving user'
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { stats, progress, preferences } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (stats) await user.updateStats(stats);
        if (progress) await user.updateProgress(progress);
        if (preferences) await user.updatePreferences(preferences);

        res.json({
            id: user._id,
            updatedAt: user.updatedAt,
            stats: user.stats,
            progress: user.progress,
            preferences: user.preferences
        });
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error updating user'
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error deleting user'
        });
    }
}; 