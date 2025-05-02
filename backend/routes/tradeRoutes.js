const express = require('express');
const { addTrade, getTrades, deleteTrade, updateTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a Trade
router.post('/', protect, addTrade);

// Get All Trades
router.get('/', protect, getTrades);

// Update a Trade by ID
router.put('/:id', protect, updateTrade);

// Delete a Trade by ID
router.delete('/:id', protect, deleteTrade);

module.exports = router;
