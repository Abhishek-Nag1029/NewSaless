const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  id: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  sale: {
    type: Number,
    default: 0
  },
  referalID: {
    type: String,
  },
  OTP: {
    type: Number,
    default: null
  },
  otpCreatedAt: {
    type: Date,
    default: null,
  },
  lastMonthSale: {
    type: Number,
    default: 0
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
  totalSale: {
    type: Number,
    default: 0
  },
  userRole: {
    type: String,
    default: 'Employee'
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
