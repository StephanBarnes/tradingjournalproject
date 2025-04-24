const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },  // store filename or image URL
    registeredAt: { type: Date, default: Date.now },
    twoFactorEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
