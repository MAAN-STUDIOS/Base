const Flood = require('../models/Flood');
const FloodAttack = require('../models/FloodAttack');
const FloodEvolution = require('../models/FloodEvolution');
const User = require('../models/User');

// Get flood by ID
exports.getFlood = async (req, res) => {
    try {
        const flood = await Flood.findById(req.params.id)
            .populate('player_id', 'username')
            .populate('session_id', 'session_code');

        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        res.json(flood);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Create new flood
exports.createFlood = async (req, res) => {
    try {
        const { player_id, session_id } = req.body;

        // Check if player exists
        const player = await User.findById(player_id);
        if (!player) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Player not found'
            });
        }

        // Check if player already has a flood in this session
        const existingFlood = await Flood.findOne({
            player_id,
            session_id
        });

        if (existingFlood) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Player already has a flood in this session'
            });
        }

        const flood = new Flood(req.body);
        await flood.save();

        res.status(201).json(flood);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Update flood
exports.updateFlood = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'evolution_level',
        'current_biomass',
        'max_biomass',
        'health',
        'clones_active',
        'clone_cooldown_end',
        'fragments_collected',
        'active_attacks',
        'sprint_cooldown'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid updates'
        });
    }

    try {
        const flood = await Flood.findById(req.params.id);
        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        updates.forEach(update => {
            flood[update] = req.body[update];
        });

        await flood.save();
        res.json(flood);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Delete flood
exports.deleteFlood = async (req, res) => {
    try {
        const flood = await Flood.findByIdAndDelete(req.params.id);
        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Get flood attacks
exports.getFloodAttacks = async (req, res) => {
    try {
        const flood = await Flood.findById(req.params.id);
        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        const attacks = await FloodAttack.find({
            evolution_level_required: { $lte: flood.evolution_level }
        });

        res.json(attacks);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Get flood evolution
exports.getFloodEvolution = async (req, res) => {
    try {
        const flood = await Flood.findById(req.params.id);
        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        const evolution = await FloodEvolution.findOne({
            level: flood.evolution_level
        });

        res.json(evolution);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Update flood position
exports.updatePosition = async (req, res) => {
    try {
        const { position_x, position_y } = req.body;
        const flood = await Flood.findById(req.params.id);

        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        flood.position_x = position_x;
        flood.position_y = position_y;
        await flood.save();

        res.json(flood);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Create flood clone
exports.createClone = async (req, res) => {
    try {
        const flood = await Flood.findById(req.params.id);
        if (!flood) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Flood not found'
            });
        }

        // Check if clone cooldown has expired
        if (flood.clone_cooldown_end && flood.clone_cooldown_end > new Date()) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Clone cooldown not expired'
            });
        }

        // Check if max clones reached
        if (flood.clones_active >= 3) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Maximum number of clones reached'
            });
        }

        flood.clones_active += 1;
        flood.clone_cooldown_end = new Date(Date.now() + 300000); // 5 minutes cooldown
        await flood.save();

        res.json(flood);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
}; 