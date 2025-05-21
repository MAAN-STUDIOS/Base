const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    session_code: {
        type: String,
        required: true,
        unique: true
    },
    is_private: {
        type: Boolean,
        default: false
    },
    seed: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true,
        default: 1
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    last_active: {
        type: Date,
        default: Date.now
    },
    max_players: {
        type: Number,
        required: true,
        default: 4
    },
    current_players: {
        type: Number,
        required: true,
        default: 1
    },
    game_state: {
        type: String,
        enum: ['LOBBY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'LOBBY'
    },
    players: [{
        player_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: String,
        flood_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Flood'
        },
        ready: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema); 