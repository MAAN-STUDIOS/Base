const GameMap = require('../models/GameMap');

// Get map by ID
exports.getMap = async (req, res) => {
    try {
        const map = await GameMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        res.json(map);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Create new map
exports.createMap = async (req, res) => {
    try {
        const map = new GameMap(req.body);
        await map.save();

        res.status(201).json(map);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Update map
exports.updateMap = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'theme',
        'difficulty',
        'width',
        'height',
        'is_completed',
        'infection_percentage'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid updates'
        });
    }

    try {
        const map = await GameMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        updates.forEach(update => {
            map[update] = req.body[update];
        });

        await map.save();
        res.json(map);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Delete map
exports.deleteMap = async (req, res) => {
    try {
        const map = await GameMap.findByIdAndDelete(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
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

// Get map rooms
exports.getRooms = async (req, res) => {
    try {
        const map = await GameMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        res.json(map.rooms);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Get map structures
exports.getStructures = async (req, res) => {
    try {
        const map = await GameMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        const structures = map.rooms.reduce((acc, room) => {
            return acc.concat(room.structures.map(structure => ({
                ...structure.toObject(),
                room_id: room._id,
                room_type: room.room_type
            })));
        }, []);

        res.json(structures);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Get map items
exports.getItems = async (req, res) => {
    try {
        const map = await GameMap.findById(req.params.id);
        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        const items = map.rooms.reduce((acc, room) => {
            return acc.concat(room.items.map(item => ({
                ...item.toObject(),
                room_id: room._id,
                room_type: room.room_type
            })));
        }, []);

        res.json(items);
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Update infection percentage
exports.updateInfection = async (req, res) => {
    try {
        const { infection_percentage } = req.body;
        const map = await GameMap.findById(req.params.id);

        if (!map) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Map not found'
            });
        }

        map.infection_percentage = infection_percentage;
        await map.save();

        res.json(map);
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
}; 