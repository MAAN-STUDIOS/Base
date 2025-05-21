const Event = require('../models/Event');
const User = require('../models/User');
const Session = require('../models/Session');

// Get rankings
exports.getRankings = async (req, res) => {
    try {
        const { type = 'global', category = 'score', limit = 10, offset = 0 } = req.query;

        let query = {};
        if (type === 'session') {
            query.sessionId = req.query.sessionId;
        }

        const events = await Event.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$userId',
                    score: { $sum: '$scoreChange' },
                    kills: { $sum: { $cond: [{ $eq: ['$type', 'kill'] }, 1, 0] } },
                    deaths: { $sum: { $cond: [{ $eq: ['$type', 'death'] }, 1, 0] } },
                    missionsCompleted: { $sum: { $cond: [{ $eq: ['$type', 'mission_complete'] }, 1, 0] } }
                }
            },
            { $sort: { [category]: -1 } },
            { $skip: parseInt(offset) },
            { $limit: parseInt(limit) }
        ]);

        const rankings = await Promise.all(events.map(async (event, index) => {
            const user = await User.findById(event._id);
            return {
                position: index + 1,
                userId: event._id,
                username: user.username,
                score: event.score,
                stats: {
                    kills: event.kills,
                    deaths: event.deaths,
                    missionsCompleted: event.missionsCompleted
                }
            };
        }));

        const total = await Event.distinct('userId', query).length;

        res.json({
            rankings,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Report event
exports.reportEvent = async (req, res) => {
    try {
        const { userId, sessionId, type, timestamp, metadata } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Session not found'
            });
        }

        // Calculate score change based on event type
        let scoreChange = 0;
        switch (type) {
            case 'kill':
                scoreChange = 100;
                user.stats.kills++;
                break;
            case 'log_found':
                scoreChange = 50;
                user.stats.logsCollected++;
                break;
            case 'zone_entered':
                scoreChange = 25;
                break;
            case 'mission_complete':
                scoreChange = 500;
                user.stats.missionsCompleted++;
                break;
        }

        // Check for achievements
        const achievements = [];
        if (user.stats.kills >= 100) {
            achievements.push({
                id: 'killer_100',
                name: 'Mass Killer',
                unlockedAt: new Date()
            });
        }

        const event = new Event({
            userId,
            sessionId,
            type,
            timestamp: timestamp || new Date(),
            metadata,
            scoreChange,
            achievements
        });

        await event.save();
        await user.save();

        res.status(201).json({
            id: event._id,
            processedAt: event.createdAt,
            scoreChange,
            achievements
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
}; 