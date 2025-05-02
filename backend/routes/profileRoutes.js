const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// GET user profile
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

// Toggle 2FA
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

// Update password
router.post('/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error('Password update error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete account
router.delete('/', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete account" });
    }
});


module.exports = router;
