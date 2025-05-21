const Item = require('../models/Item');
const User = require('../models/User');

// List items
exports.listItems = async (req, res) => {
    try {
        const { type, rarity, page = 1, limit = 20 } = req.query;
        const query = {};

        if (type) query.type = type;
        if (rarity) query.rarity = rarity;

        const items = await Item.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Item.countDocuments(query);

        res.json({
            items: items.map(item => ({
                id: item._id,
                name: item.name,
                type: item.type,
                rarity: item.rarity,
                stats: item.stats,
                description: item.description
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// Use item
exports.useItem = async (req, res) => {
    try {
        const { userId, itemId, quantity, target } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Item not found'
            });
        }

        // Check if user has the item
        const userItem = user.progress.collectedItems.find(i => i === itemId);
        if (!userItem) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Item not available'
            });
        }

        // Apply item effects
        const effects = {};
        item.effects.forEach(effect => {
            effects[effect.type] = effect.value;
        });

        res.json({
            success: true,
            effects,
            remainingQuantity: quantity - 1
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
};

// Equip item
exports.equipItem = async (req, res) => {
    try {
        const { userId, itemId, slot } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Item not found'
            });
        }

        // Check if user has the item
        const userItem = user.progress.collectedItems.find(i => i === itemId);
        if (!userItem) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Item not available'
            });
        }

        // Update equipped items
        const equippedItems = {
            primary: null,
            secondary: null,
            utility: null
        };

        equippedItems[slot] = {
            id: item._id,
            name: item.name
        };

        res.json({
            success: true,
            equippedItems
        });
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
}; 