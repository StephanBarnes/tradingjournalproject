const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const userRoutes = require('./routes/userRoutes');
const tradeRoutes = require('./routes/tradeRoutes'); // Import trade routes
const aiRoutes = require('./routes/aiRoutes'); // ✅ AI endpoints
const profileRoutes = require('./routes/profileRoutes'); // adjust path if needed



dotenv.config();

// Log environment variables to verify
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

const app = express();


// Middleware
app.use(express.json());

// ✅ Improved CORS settings
app.use(cors({
    origin: "http://127.0.0.1:5500", // Allow frontend requests from this origin
    credentials: true, // Allow credentials like cookies or auth headers
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization" // Allowed headers
}));

// Database Connection
mongoose
    .connect(process.env.MONGO_URI, {
        authSource: 'admin', // if authentication is enabled
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
        console.error('❌ Database connection error:', err.message);
        process.exit(1); // Exit process on database failure
    });

// Routes
app.use('/api/ai', aiRoutes); // ✅ AI routes (training + predictions)
app.use('/api/users', userRoutes);
app.use('/api/trades', tradeRoutes); // Add trade routes
app.use('/api/profile', profileRoutes);
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Server listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
