const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['weapon', 'consumable', 'utility', 'armor'],
        required: true
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        required: true
    },
    stats: {
        damage: { type: Number, default: 0 },
        durability: { type: Number, default: 100 },
        health: { type: Number, default: 0 },
        stamina: { type: Number, default: 0 }
    },
    description: {
        type: String,
        required: true
    },
    effects: [{
        type: {
            type: String,
            enum: ['heal', 'damage', 'buff', 'debuff'],
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema); 