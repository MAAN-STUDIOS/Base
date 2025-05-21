const mongoose = require('mongoose');

const knowledgeFragmentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    importance: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        required: true
    },
    is_collected: {
        type: Boolean,
        default: false
    },
    flood_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flood'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('KnowledgeFragment', knowledgeFragmentSchema); 