const tfPredict = require('@tensorflow/tfjs-node');

/**
 * Loads the trained model and predicts outcome given a risk:reward
 * @param {number|string} riskToReward
 * @returns {Promise<number>} 
 */
async function predictOutcome(riskToReward) {
    const model = await tfPredict.loadLayersModel('file://ml/model/model.json');
    const input = tfPredict.tensor2d([[parseFloat(riskToReward)]]);
    const prediction = model.predict(input);
    const result = (await prediction.array())[0][0];
    return result;
}

module.exports = predictOutcome;

