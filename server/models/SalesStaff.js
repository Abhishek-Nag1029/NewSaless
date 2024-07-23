const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const SalesSchema = ({
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
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },
    collegeCity: {
        type: String,
        required: true
    },
    collegeState: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    branch:{
        type: String,
        required: true
    },
    yearOfPassing:{
        type: Number,
        required: true
    }
})


module.exports = mongoose.model('salestaff', SalesSchema);