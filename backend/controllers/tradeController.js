const Trade = require('../models/Trade');

// Add a Trade
const addTrade = async (req, res) => {
    try {
        console.log("🔹 Incoming Trade Data:", req.body);
        console.log("🔹 User Object from Middleware:", req.user); // Debugging user object from token middleware

        if (!req.user || !req.user._id) {
            console.error("❌ User ID missing in request.");
            return res.status(401).json({ message: "User authentication failed." });
        }

        const { symbol, date, time, riskToReward, maxRiskToReward, chartURL, winLoss, notes } = req.body;

        if (!symbol || !date || !time || !riskToReward || !chartURL || !winLoss) {
            console.log("⚠️ Missing required fields!");
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const trade = new Trade({
            user: req.user._id,  // Ensure the correct field is used from token middleware
            symbol,
            date,
            time,
            riskToReward,
            maxRiskToReward: maxRiskToReward || null, // Optional field
            chartURL,
            winLoss,
            notes: notes || "", // Default empty string if no notes provided
        });

        const savedTrade = await trade.save();
        console.log("✅ Trade Successfully Added:", savedTrade);
        res.status(201).json(savedTrade);
    } catch (error) {
        console.error("❌ Error adding trade:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get All Trades for a User
const getTrades = async (req, res) => {
    try {
        console.log("📤 Fetching trades for User ID:", req.user._id);

        if (!req.user || !req.user._id) {
            console.error("❌ User ID missing in request.");
            return res.status(401).json({ message: "User authentication failed." });
        }

        const trades = await Trade.find({ user: req.user._id });

        if (!trades.length) {
            console.log("⚠️ No trades found for user.");
        } else {
            console.log(`✅ Trades Retrieved: ${trades.length}`);
        }

        res.status(200).json(trades);
    } catch (error) {
        console.error("❌ Error fetching trades:", error.message);
        res.status(500).json({ message: "Error fetching trades", error: error.message });
    }
};

module.exports = { addTrade, getTrades };
