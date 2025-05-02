const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const csv = require('csv-parser');
const Trade = require('../models/Trade');

function preprocessTrades(data) {
    const xs = [], ys = [];

    data.forEach(trade => {
        const rr = parseFloat(trade.riskToReward);
        if (!isNaN(rr) && (trade.winLoss === 'Win' || trade.winLoss === 'Loss')) {
            xs.push([rr]);
            ys.push(trade.winLoss === 'Win' ? 1 : 0);
        }
    });

    return {
        xs: tf.tensor2d(xs),
        ys: tf.tensor2d(ys, [ys.length, 1])
    };
}

/**
 * Trains a TensorFlow model using either MongoDB data or an uploaded CSV.
 * @param {'mongo'|'csv'} dataSource
 * @param {string} [csvPath]
 */
async function trainModel(dataSource = 'mongo', csvPath = '') {
    let trades = [];

    if (dataSource === 'mongo') {
        trades = await Trade.find({});
    } else if (dataSource === 'csv') {
        trades = await new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }

    const { xs, ys } = preprocessTrades(trades);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 8, inputShape: [1], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] });

    console.log(`🔍 Starting training on ${dataSource === 'mongo' ? 'MongoDB' : 'CSV'} data...`);
    await model.fit(xs, ys, { epochs: 20, batchSize: 8, verbose: 1 });

    // Save model artifacts to the correct path
    await model.save('file://ml/lstm-model');
    console.log('✅ Model trained and saved at /backend/ml/lstm-model');
}

module.exports = trainModel;
