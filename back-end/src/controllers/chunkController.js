const Chunk = require('../models/Chunk');
const crypto = require('crypto');

// Send chunk
exports.sendChunk = async (req, res) => {
    try {
        const { sessionId, coordinates, data, version } = req.body;

        // Generate hash for chunk data
        const hash = crypto.createHash('sha256').update(data).digest('hex');

        const chunk = new Chunk({
            sessionId,
            coordinates,
            data,
            version,
            hash
        });

        await chunk.save();

        res.status(201).json({
            id: chunk._id,
            coordinates: chunk.coordinates,
            hash: chunk.hash,
            timestamp: chunk.createdAt
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({
                error: 'Conflict',
                message: 'Chunk already exists'
            });
        } else {
            res.status(400).json({
                error: 'Bad Request',
                message: error.message
            });
        }
    }
};

// Get chunk by coordinates
exports.getChunk = async (req, res) => {
    try {
        const [x, y] = req.params.coord.split('');
        const sessionId = req.query.sessionId;

        if (!sessionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Session ID is required'
            });
        }

        const chunk = await Chunk.findOne({
            sessionId,
            'coordinates.x': parseInt(x),
            'coordinates.y': parseInt(y)
        });

        if (!chunk) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Chunk not found'
            });
        }

        res.json({
            coordinates: chunk.coordinates,
            data: chunk.data,
            version: chunk.version,
            lastModified: chunk.updatedAt
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}; 