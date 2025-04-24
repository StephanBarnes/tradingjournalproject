// === /controllers/aiController.js ===
const trainModel = require('../ml/trainModel');
const predictOutcome = require('../ml/predict');
const predictNext7Trades = require('../ml/predictLSTM');

exports.predictNext7 = async (req, res) => {
    try {
        const sequence = await predictNext7Trades();
        res.json({ predictions: sequence });
    } catch (error) {
        console.error('Sequence prediction error:', error);
        res.status(500).json({ message: 'Error predicting sequence' });
    }
};

exports.trainFromMongo = async (req, res) => {
    try {
        await trainModel('mongo');
        res.json({ message: 'Model trained using MongoDB trades ✅' });
    } catch (error) {
        console.error('Training error:', error);
        res.status(500).json({ message: 'Error training model' });
    }
};

exports.trainFromCSV = async (req, res) => {
    try {
        const csvPath = req.file.path;
        await trainModel('csv', csvPath);
        res.json({ message: 'Model trained using CSV file ✅' });
    } catch (error) {
        console.error('CSV training error:', error);
        res.status(500).json({ message: 'Error training from CSV' });
    }
};

exports.predictTrade = async (req, res) => {
    try {
        const { riskToReward } = req.body;
        const probability = await predictOutcome(riskToReward);
        res.json({ probability, outcome: probability >= 0.5 ? 'Win' : 'Loss' });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ message: 'Error making prediction' });
    }
};
