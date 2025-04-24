const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://admin:password123@127.0.0.1:27017/trading-journal", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: "admin", // Authenticate against the admin database
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
