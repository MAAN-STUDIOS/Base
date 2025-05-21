const Session = require('../models/Session');
const User = require('../models/User');
const crypto = require('crypto');

// Create new session
exports.createSession = async (req, res) => {
    try {
        const { userId, gameMode, difficulty, maxPlayers, isPrivate, seed } = req.body;

        // Check if user is already in an active session
        const existingSession = await Session.findOne({
            'players.id': userId,
            status: { $in: ['waiting', 'in_progress'] }
        });

        if (existingSession) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User already in active session'
            });
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        // Generate seed if not provided
        const sessionSeed = seed || crypto.randomBytes(16).toString('hex');

        const session = new Session({
            gameMode,
            difficulty,
            maxPlayers,
            isPrivate,
            seed: sessionSeed,
            players: [{
                id: userId,
                username: user.username
            }]
        });

        await session.save();

        res.status(201).json({
            id: session._id,
            gameMode: session.gameMode,
            difficulty: session.difficulty,
            maxPlayers: session.maxPlayers,
            isPrivate: session.isPrivate,
            seed: session.seed,
            createdAt: session.createdAt,
            status: session.status,
            players: session.players
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Get session by ID
exports.getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('players.id', 'username');

        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Session not found'
            });
        }

        res.json({
            id: session._id,
            gameMode: session.gameMode,
            difficulty: session.difficulty,
            maxPlayers: session.maxPlayers,
            isPrivate: session.isPrivate,
            seed: session.seed,
            createdAt: session.createdAt,
            status: session.status,
            players: session.players,
            gameState: session.gameState
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Get world seed
exports.getWorldSeed = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Session not found'
            });
        }

        res.json({
            seed: session.seed,
            version: '1.0.0',
            parameters: {
                difficulty: session.difficulty,
                size: 'medium',
                biomeDistribution: {
                    industrial: 0.4,
                    research: 0.3,
                    living: 0.3
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}; 