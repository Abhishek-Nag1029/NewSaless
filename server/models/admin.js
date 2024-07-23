const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sale: {
        type: Number,
        default: 0
    },
    adminId: {
        type: String,
        required: true
    },
    OTP: {
        type: Number
    },
    otpCreatedAt: {
        type: Date,
        default: null
    },
    userRole: {
        type: String,
        default: 'Admin'
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema); 