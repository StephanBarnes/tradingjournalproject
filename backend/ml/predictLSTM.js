const tf = require('@tensorflow/tfjs-node');
const Trade = require('../models/Trade');

const SEQUENCE_LENGTH = 5;

function preprocessRecentTrades(trades) {
    return trades.map(t => [
        parseFloat(t.riskToReward),
        t.winLoss === 'Win' ? 1 : 0
    ]);
}

async function predictNext7Trades() {
    const model = await tf.loadLayersModel('file://ml/lstm-model/model.json');
    const allTrades = await Trade.find({}).sort({ date: 1 });

    if (allTrades.length < SEQUENCE_LENGTH) throw new Error("Not enough trades.");

    const results = [];
    let history = preprocessRecentTrades(allTrades).slice(-SEQUENCE_LENGTH);

    for (let i = 0; i < 7; i++) {
        const inputTensor = tf.tensor3d([history]);
        const prediction = await model.predict(inputTensor).array();
        const winProb = prediction[0][0];
        results.push({ tradeNumber: i + 1, prediction: winProb });

        // Append mock next trade with predicted outcome (simulate "streaks")
        history.push([1.5, winProb >= 0.5 ? 1 : 0]); // Assume avg RR of 1.5
        history = history.slice(1);
    }

    return results;
}

module.exports = predictNext7Trades;
