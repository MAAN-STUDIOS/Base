const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create new user
exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION
        });

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            preferences: user.preferences,
            token
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({
                error: 'Conflict',
                message: 'Username or email already exists'
            });
        } else {
            res.status(400).json({
                error: 'Bad Request',
                message: error.message
            });
        }
    }
};

// Get user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
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
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['stats', 'progress', 'preferences'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid updates'
        });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        updates.forEach(update => {
            user[update] = req.body[update];
        });

        await user.save();

        res.json({
            id: user._id,
            updatedAt: user.updatedAt,
            stats: user.stats,
            progress: user.progress,
            preferences: user.preferences
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
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
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}; 