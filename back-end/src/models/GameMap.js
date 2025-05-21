const mongoose = require('mongoose');

const gameMapSchema = new mongoose.Schema({
    seed: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        default: 1
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    generated_at: {
        type: Date,
        default: Date.now
    },
    is_completed: {
        type: Boolean,
        default: false
    },
    infection_percentage: {
        type: Number,
        default: 0
    },
    rooms: [{
        room_type: {
            type: String,
            required: true
        },
        x_pos: {
            type: Number,
            required: true
        },
        y_pos: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        access_requirements: {
            type: String
        },
        structures: [{
            type: {
                type: String,
                required: true
            },
            is_blocking: {
                type: Boolean,
                default: true
            },
            position_x: {
                type: Number,
                required: true
            },
            position_y: {
                type: Number,
                required: true
            }
        }],
        items: [{
            item_type: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            description: String,
            is_collectable: {
                type: Boolean,
                default: true
            },
            is_usable: {
                type: Boolean,
                default: true
            },
            effect_value: {
                type: Number,
                default: 0
            },
            position_x: {
                type: Number,
                required: true
            },
            position_y: {
                type: Number,
                required: true
            }
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('GameMap', gameMapSchema); 