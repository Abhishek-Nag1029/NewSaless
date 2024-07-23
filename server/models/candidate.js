const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    passingYear: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ['pending', 'shortlisted', 'discarded', 'invited', 'employee'],
        default: 'pending'
    },
    resume: {
        type: String,
    },
    emailHash: {
        type: String,
        unique: true
    },
    adminAction: {
        type: String,
        default: null
    },
    bankName: {
        type: String,

    },
    accountNumber: {
        type: String,

    },
    payeeName: {
        type: String,

    },
    ifscCode: {
        type: String,

    },



}, { timestamps: true });

const Candidate = mongoose.model('candidates', candidateSchema);

module.exports = Candidate;