const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    coordinates: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        }
    },
    data: {
        type: String, // base64 encoded chunk data
        required: true
    },
    version: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient chunk lookup
chunkSchema.index({ sessionId: 1, 'coordinates.x': 1, 'coordinates.y': 1 }, { unique: true });

module.exports = mongoose.model('Chunk', chunkSchema); 