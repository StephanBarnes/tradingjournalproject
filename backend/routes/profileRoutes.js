// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Setup multer for profile image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// GET: Fetch profile info
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// POST: Upload profile picture
router.post('/picture', protect, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.profilePicture = req.file.filename;
        await user.save();
        res.json({ message: 'Profile picture updated!', filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed' });
    }
});

// POST: Toggle 2FA
router.post('/twofa', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.twoFactorEnabled = !user.twoFactorEnabled;
        await user.save();
        res.json({ message: `2FA is now ${user.twoFactorEnabled ? 'enabled' : 'disabled'}` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update 2FA setting' });
    }
});

module.exports = router;
