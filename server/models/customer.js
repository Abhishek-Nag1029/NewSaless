const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
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
  phone: {
    type: Number,
    required: true
  },
  products: [
    {
      name: {
        type: String,
        required: true,
        enum: ["Product A", "Product B", "Product C", "Product D"]
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      amount: {
        type: Number,
        required: true,
        default: 10
      }
    }
  ],
  referralEmployee: {
    type: String,
    required: true,
    // ref: "Employee"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// customerSchema.pre('save', function (next) {
//   this.totalAmount = this.products.reduce((acc, product) => acc + product.amount * product.quantity, 0);
//   next();
// });

module.exports = mongoose.model('Customer', customerSchema);