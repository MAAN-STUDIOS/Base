const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['story', 'lore', 'research'],
        required: true
    },
    location: {
        chunk: {
            type: String,
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
        }
    },
    discoveredBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        discoveredAt: {
            type: Date,
            default: Date.now
        }
    }],
    experienceValue: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema); 