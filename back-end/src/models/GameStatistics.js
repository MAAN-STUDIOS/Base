const mongoose = require('mongoose');

const gameStatisticsSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    game_date: {
        type: Date,
        default: Date.now
    },
    game_duration_seconds: {
        type: Number,
        required: true
    },
    final_evolution_level: {
        type: Number,
        required: true
    },
    final_army_size: {
        type: Number,
        default: 0
    },
    humans_infected: {
        type: Number,
        default: 0
    },
    scientists_infected: {
        type: Number,
        default: 0
    },
    soldiers_infected: {
        type: Number,
        default: 0
    },
    engineers_infected: {
        type: Number,
        default: 0
    },
    biomass_collected: {
        type: Number,
        default: 0
    },
    distance_traveled: {
        type: Number,
        default: 0
    },
    fragments_found: {
        type: Number,
        default: 0
    },
    attacks_used: {
        type: Number,
        default: 0
    },
    clones_created: {
        type: Number,
        default: 0
    },
    deaths: {
        type: Number,
        default: 0
    },
    mission_completed: {
        type: Boolean,
        default: false
    },
    cure_destroyed: {
        type: Boolean,
        default: false
    },
    difficulty_level: {
        type: String,
        default: 'NORMAL'
    },
    completion_percentage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GameStatistics', gameStatisticsSchema); 