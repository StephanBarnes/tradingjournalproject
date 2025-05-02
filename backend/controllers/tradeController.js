const Trade = require('../models/Trade');

// Add a trade
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
            user: req.user._id,
            symbol,
            date,
            time,
            riskToReward,
            maxRiskToReward: maxRiskToReward || null,
            chartURL,
            winLoss,
            notes: notes || "",
        });

        const savedTrade = await trade.save();
        console.log("✅ Trade Successfully Added:", savedTrade);
        res.status(201).json(savedTrade);
    } catch (error) {
        console.error("❌ Error adding trade:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all trades for a user
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

// DELETE a trade
const deleteTrade = async (req, res) => {
    try {
        console.log("🗑 Deleting trade ID:", req.params.id);

        if (!req.user || !req.user._id) {
            console.error("❌ User ID missing in request.");
            return res.status(401).json({ message: "User authentication failed." });
        }

        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            console.log("⚠️ Trade not found.");
            return res.status(404).json({ message: "Trade not found" });
        }

        // Check if the trade belongs to the current user
        if (trade.user.toString() !== req.user._id.toString()) {
            console.log("❌ Unauthorized attempt to delete trade.");
            return res.status(403).json({ message: "Not authorized to delete this trade" });
        }

        await trade.deleteOne();

        console.log("✅ Trade deleted successfully");
        res.json({ success: true, message: "Trade deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting trade:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Update a Trade
const updateTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ message: "Trade not found" });
        }

        // Check if the trade belongs to the current user
        if (trade.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this trade" });
        }

        // Update fields
        trade.symbol = req.body.symbol || trade.symbol;
        trade.date = req.body.date || trade.date;
        trade.time = req.body.time || trade.time;
        trade.riskToReward = req.body.riskToReward || trade.riskToReward;
        trade.chartURL = req.body.chartURL || trade.chartURL;
        trade.winLoss = req.body.winLoss || trade.winLoss;

        const updatedTrade = await trade.save();

        res.json(updatedTrade);
    } catch (error) {
        console.error("Error updating trade:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { addTrade, getTrades, deleteTrade, updateTrade };
