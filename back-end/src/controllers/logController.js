const Log = require('../models/Log');
const User = require('../models/User');

// Get user logs
exports.getUserLogs = async (req, res) => {
    try {
        const userId = req.params.user;
        const logs = await Log.find({
            'discoveredBy.userId': userId
        });

        const categories = {
            story: 0,
            lore: 0,
            research: 0
        };

        logs.forEach(log => {
            categories[log.type]++;
        });

        res.json({
            logs: logs.map(log => ({
                id: log._id,
                title: log.title,
                content: log.content,
                type: log.type,
                discoveredAt: log.discoveredBy.find(d => d.userId.toString() === userId).discoveredAt,
                location: log.location
            })),
            progress: {
                total: 100,
                discovered: logs.length,
                categories
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Register log discovery
exports.registerLog = async (req, res) => {
    try {
        const { userId, sessionId, logId, discoveryTime, location } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const log = await Log.findById(logId);
        if (!log) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Log not found'
            });
        }

        // Check if user already discovered this log
        const alreadyDiscovered = log.discoveredBy.some(
            d => d.userId.toString() === userId
        );

        if (alreadyDiscovered) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Log already discovered'
            });
        }

        // Add user to discoveredBy array
        log.discoveredBy.push({
            userId,
            discoveredAt: discoveryTime || new Date()
        });

        await log.save();

        // Update user stats
        user.stats.logsCollected++;
        await user.save();

        res.status(201).json({
            id: log._id,
            discoveredAt: discoveryTime || new Date(),
            experienceGained: log.experienceValue
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
}; 