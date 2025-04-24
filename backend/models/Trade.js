const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        symbol: { type: String, required: true },
        date: { type: Date, default: Date.now },
        time: { type: String, required: true },
        riskToReward: { type: Number, required: true },
        maxRiskToReward: { type: Number, required: false },
        chartURL: { type: String, required: true },
        winLoss: { type: String, enum: ['Win', 'Loss'], required: true },
        notes: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Trade', tradeSchema);
