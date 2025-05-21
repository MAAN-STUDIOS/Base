const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const floodController = require('../controllers/floodController');

// Get flood by ID
router.get('/:id', auth, floodController.getFlood);

// Create new flood
router.post('/', auth, floodController.createFlood);

// Update flood
router.patch('/:id', auth, floodController.updateFlood);

// Delete flood
router.delete('/:id', auth, floodController.deleteFlood);

// Get flood attacks
router.get('/:id/attacks', auth, floodController.getFloodAttacks);

// Get flood evolution
router.get('/:id/evolution', auth, floodController.getFloodEvolution);

// Update flood position
router.patch('/:id/position', auth, floodController.updatePosition);

// Create flood clone
router.post('/:id/clone', auth, floodController.createClone);

module.exports = router; 