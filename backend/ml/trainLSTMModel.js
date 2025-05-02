const tf = require('@tensorflow/tfjs-node');
const Trade = require('../models/Trade');

const SEQUENCE_LENGTH = 5;

function preprocessSequences(trades) {
    const xs = [];
    const ys = [];

    for (let i = 0; i <= trades.length - SEQUENCE_LENGTH - 1; i++) {
        const sequence = trades.slice(i, i + SEQUENCE_LENGTH).map(t => [
            parseFloat(t.riskToReward),
            t.winLoss === 'Win' ? 1 : 0
        ]);
        const label = trades[i + SEQUENCE_LENGTH].winLoss === 'Win' ? 1 : 0;

        xs.push(sequence);
        ys.push(label);
    }

    return {
        xs: tf.tensor3d(xs),
        ys: tf.tensor2d(ys, [ys.length, 1])
    };
}

async function trainModel() {
    const trades = await Trade.find({}).sort({ date: 1 });

    if (trades.length < SEQUENCE_LENGTH + 1) {
        throw new Error("Not enough trades to train LSTM.");
    }

    const { xs, ys } = preprocessSequences(trades);

    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 50,
        inputShape: [SEQUENCE_LENGTH, 2],
        activation: 'tanh'
    }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] });

    console.log("📊 Training LSTM...");
    await model.fit(xs, ys, {
        epochs: 30,
        batchSize: 4,
        validationSplit: 0.1,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}, Accuracy = ${logs.acc?.toFixed(2)}`);
            }
        }
    });

    await model.save('file://ml/lstm-model'); // Creates model.json and weights.bin
    console.log('✅ LSTM Model trained and saved.');
}

module.exports = trainModel;
