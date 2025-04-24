// ml/trainLSTMModel.js
require('dotenv').config();
const mongoose = require('mongoose');
const tf = require('@tensorflow/tfjs-node');
const Trade = require('../models/Trade');

const SEQUENCE_LENGTH = 5;

function formatDataForSequence(trades) {
    const sequences = [];
    const labels = [];

    for (let i = 0; i < trades.length - SEQUENCE_LENGTH; i++) {
        const sequence = trades.slice(i, i + SEQUENCE_LENGTH).map(t =>
            [parseFloat(t.riskToReward), t.winLoss === 'Win' ? 1 : 0]
        );
        const label = trades[i + SEQUENCE_LENGTH].winLoss === 'Win' ? 1 : 0;

        sequences.push(sequence);
        labels.push(label);
    }

    return {
        xs: tf.tensor3d(sequences),
        ys: tf.tensor2d(labels, [labels.length, 1])
    };
}

async function trainLSTMModel() {
    console.log("🧠 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");

    const trades = await Trade.find({}).sort({ date: 1 }); // Chronological order
    if (trades.length <= SEQUENCE_LENGTH) {
        throw new Error("Not enough trades to train sequence model.");
    }

    const { xs, ys } = formatDataForSequence(trades);

    const model = tf.sequential();
    model.add(tf.layers.lstm({ units: 32, inputShape: [SEQUENCE_LENGTH, 2] }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] });

    await model.fit(xs, ys, { epochs: 25, batchSize: 8, verbose: 1 });
    await model.save('file://ml/lstm-model');

    console.log("✅ LSTM model trained and saved at /ml/lstm-model");

    mongoose.connection.close();
}

// Run directly: node ml/trainLSTMModel.js
if (require.main === module) {
    trainLSTMModel().catch(err => {
        console.error("❌ Training failed:", err);
        mongoose.connection.close();
    });
}
