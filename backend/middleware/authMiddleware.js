const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log("User not found in the database!");
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('User authenticated:', user);
        req.user = user;

        next();
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
