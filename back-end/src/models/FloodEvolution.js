const mongoose = require('mongoose');

const floodEvolutionSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true
    },
    damage_multiplier: {
        type: Number,
        required: true
    },
    health_bonus: {
        type: Number,
        required: true
    },
    biomass_capacity: {
        type: Number,
        required: true
    },
    visual_changes: {
        type: String
    },
    unlock_description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FloodEvolution', floodEvolutionSchema); 