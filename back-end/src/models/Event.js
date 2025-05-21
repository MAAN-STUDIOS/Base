const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    type: {
        type: String,
        enum: ['kill', 'log_found', 'zone_entered', 'mission_complete'],
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    metadata: {
        target: String,
        location: {
            chunk: String,
            coordinates: {
                x: Number,
                y: Number
            }
        },
        details: {
            damage: Number,
            weapon: String
        }
    },
    scoreChange: {
        type: Number,
        default: 0
    },
    achievements: [{
        id: String,
        name: String,
        unlockedAt: Date
    }]
}, {
    timestamps: true
});

// Indexes for efficient querying
eventSchema.index({ userId: 1, type: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('Event', eventSchema); 