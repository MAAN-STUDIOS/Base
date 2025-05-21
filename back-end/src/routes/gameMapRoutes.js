const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gameMapController = require('../controllers/gameMapController');

// Get map by ID
router.get('/:id', auth, gameMapController.getMap);

// Create new map
router.post('/', auth, gameMapController.createMap);

// Update map
router.patch('/:id', auth, gameMapController.updateMap);

// Delete map
router.delete('/:id', auth, gameMapController.deleteMap);

// Get map rooms
router.get('/:id/rooms', auth, gameMapController.getRooms);

// Get map structures
router.get('/:id/structures', auth, gameMapController.getStructures);

// Get map items
router.get('/:id/items', auth, gameMapController.getItems);

// Update infection percentage
router.patch('/:id/infection', auth, gameMapController.updateInfection);

module.exports = router; 