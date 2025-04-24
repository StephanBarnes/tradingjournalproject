const express = require('express');
const { addTrade, getTrades } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a Trade
router.post('/', protect, addTrade);

// Get All Trades
router.get('/', protect, getTrades);

module.exports = router;
