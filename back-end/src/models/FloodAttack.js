const mongoose = require('mongoose');

const floodAttackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    base_damage: {
        type: Number,
        required: true
    },
    range: {
        type: Number,
        required: true
    },
    cooldown: {
        type: Number,
        required: true
    },
    effect_type: {
        type: String
    },
    effect_value: {
        type: Number
    },
    evolution_level_required: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FloodAttack', floodAttackSchema); 