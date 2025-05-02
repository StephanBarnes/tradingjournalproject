const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const userRoutes = require('./routes/userRoutes');
const tradeRoutes = require('./routes/tradeRoutes'); // Import trade routes
const aiRoutes = require('./routes/aiRoutes'); // AI endpoints
const profileRoutes = require('./routes/profileRoutes');



dotenv.config();

// Log environment variables to verify
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

const app = express();


// Middleware
app.use(express.json());

// Improved CORS settings
app.use(cors({
    origin: "http://127.0.0.1:5500", // Allow frontend requests from this origin
    credentials: true, // Allow credentials like cookies or auth headers
    methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization" // Allowed headers
}));

// Database Connection
mongoose
    .connect(process.env.MONGO_URI, {
        authSource: 'admin',
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
        console.error('❌ Database connection error:', err.message);
        process.exit(1); // Exit process on database failure
    });

// Routes
app.use('/api/ai', aiRoutes); // AI routes
app.use('/api/users', userRoutes);
app.use('/api/trades', tradeRoutes); // Add trade routes
app.use('/api/profile', profileRoutes);
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Health check route for frontend retry after training
app.get('/api/ping', (req, res) => res.send('pong'));


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Server listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
