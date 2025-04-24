// === /routes/aiRoutes.js ===
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const aiController = require('../controllers/aiController');
const { trainFromMongo, trainFromCSV, predictTrade, predictNext7 } = require('../controllers/aiController');


router.get('/predict/sequence', predictNext7);

// Train endpoints
router.post('/train/mongo', aiController.trainFromMongo);
router.post('/train/csv', upload.single('file'), aiController.trainFromCSV);

// Predict endpoint
router.post('/predict', aiController.predictTrade);

module.exports = router;