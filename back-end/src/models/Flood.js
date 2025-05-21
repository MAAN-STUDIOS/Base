const mongoose = require('mongoose');

const floodSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    evolution_level: {
        type: Number,
        default: 1
    },
    current_biomass: {
        type: Number,
        default: 0
    },
    max_biomass: {
        type: Number,
        default: 10
    },
    health: {
        type: Number,
        default: 100
    },
    position_x: {
        type: Number,
        default: 0
    },
    position_y: {
        type: Number,
        default: 0
    },
    clones_active: {
        type: Number,
        default: 0
    },
    clone_cooldown_end: {
        type: Date
    },
    fragments_collected: {
        type: Number,
        default: 0
    },
    active_attacks: {
        type: String,
        default: '1'
    },
    sprint_cooldown: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Flood', floodSchema); 