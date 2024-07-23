const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Employee = require("../models/employee");
const razorpay = require("razorpay")
const crypto = require("crypto")
const { v4: uuid } = require("uuid")


router.get('/', async (req, res) => {
  try {
    // Fetch all employees from the MongoDB collection
    const customer = await Customer.find();
    res.json(customer);

  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Main code 
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {


    // Find the employee with the specified ID
    const employee = await Employee.findOne({ _id: id });

    // If employee is found, find their associated customers
    if (employee) {
      const customers = await Customer.find({ referralEmployee: employee.referalID });

      // If customers are found, return them; otherwise, return a custom message
      if (customers.length > 0) {
        res.json(customers);
      } else {
        res.status(401).json({ message: 'No customers found for the specified employee' });
      }
    } else {
      res.status(400).json({ message: 'No customers found for the specified employee' });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { referralEmployee, firstName, lastName, products, email } = req.body;

  // Find the referral employee
  const findReferral = await Employee.findOne({ referalID: referralEmployee });
  if (!findReferral) {
    return res.status(400).json({ message: 'Invalid referral ID' });
  }

  try {

    const newCustomer = await Customer.create(req.body);

    // Retrieve the current sale amount of the referral employee
    let currentSale = findReferral.sale;

    // Check if currentSale is NaN or undefined, and initialize it to 0 if it is
    if (isNaN(currentSale) || currentSale === undefined) {
      currentSale = 0;
    }

    // Calculate the new total sale amount
    const newTotalSale = currentSale + newCustomer.totalAmount;
    console.log(typeof (newCustomer.totalAmount));
    // Update the sale amount of the referral employee with the new total sale amount
    await Employee.updateOne(
      { referalID: referralEmployee },
      { $set: { sale: newTotalSale } }
    );

    res.status(200).json({ message: 'Customer saved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error while registration', error: error.message });
  }
});

router.get('/customer/total-amount-per-month', async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(result);
  } catch (err) {
    console.error('Error fetching total amounts per month:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/employee/total-amount-per-month/:id', async (req, res) => {
  const { id } = req.params
  try {
    const employeeId = await Employee.findOne({ _id: id })
    if (!employeeId) {
      return res.status(401).json({ message: "Employee data not found" })
    }
    const result = await Customer.aggregate([
      {
        $match: { 'referralEmployee': employeeId.referalID }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching total amounts per month for employees:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  Last Month data
router.get('/employee/total-amount-last-month/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employeeId = await Employee.findOne({ _id: id });

    if (!employeeId) {
      return res.status(401).json({ message: "Employee data not found" })
    }

    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    console.log(lastMonth);
    console.log(lastMonthEnd);
    const result = await Customer.aggregate([
      {
        $match: {
          referralEmployee: employeeId.referalID,
          createdAt: {
            $gte: lastMonth,
            $lte: lastMonthEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalAmountLastMonth = result.length > 0 ? result[0].totalAmount : 0;
    console.log("Total amount last month:", totalAmountLastMonth);

    // Update the lastMonthSale field for the employee
    await Employee.updateOne({ id: id }, { lastMonthSale: totalAmountLastMonth });

    res.json({ totalAmountLastMonth });
  } catch (err) {
    console.error('Error fetching total amount for last month:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});







//  Delete all Customers  ⚠⚠ ⚡ ⚠⚠
router.delete("/delete-all", async (req, res) => {
  try {
    const result = await Customer.deleteMany()
    return res.status(200).json({ message: "All Deleted", result })
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong while deleteing all customers", error: error.message })
  }
})


//  Razer Payment :----------------------------------------------------------------

router.get(('/orders'), async (req, res) => {

  // const result = await order.find()
  const result = await Customer.find()

  res.json({ message: "Get Success", result })
})


router.post(('/initiate-order'), async (req, res) => {
  const { totalAmount } = req.body
  const instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
  })
  instance.orders.create({
    amount: req.body.totalAmount * 100,
    currency: "INR",
    receipt: uuid()
  }, (err, order) => {
    if (err) {
      return res.status(500).json({ message: err.message || "unable to proces request" })
    }
    // console.log(order.id);
    console.log(order);
    res.status(200).json({ message: "initiate success", id: order.id })

  })
})

router.post('/place-order', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    firstName,
    lastName,
    phone,
    email,
    products,
    amount,
    referralEmployee,
    totalAmount,
  } = req.body;

  const key = `${razorpay_order_id}|${razorpay_payment_id}`;
  const calculatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(key)
    .digest("hex");

  if (calculatedSignature === razorpay_signature) {
    try {
      // Create a new customer with the given details
      await Customer.create({
        order_id: razorpay_payment_id,
        isPaid: true,
        firstName,
        lastName,
        phone,
        email,
        products,
        totalAmount,
        referralEmployee,
        amount
      });

      const employee = await Employee.findOne({ referalID: referralEmployee });
      if (employee) {
        const updatedTotalAmount = employee.totalSale + totalAmount; // Add the new order's amount to the total
        console.log("######## employee.totalSale ##########");
        console.log(employee.totalSale);
        console.log("###################");
        await Employee.updateOne(
          { referalID: referralEmployee },
          { totalSale: updatedTotalAmount }
        );
      }

      // After updating Employee, now we can proceed to count total customers
      const totalCustomers = await Customer.countDocuments({ referralEmployee: referralEmployee });
      await Employee.updateOne({ referalID: referralEmployee }, { totalCustomers: totalCustomers });

      return res.status(201).json({ message: "Order added successfully", data: true });
    } catch (error) {
      // If an error occurs, respond with an internal server error message
      console.error("Failed to create customer:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the signature does not match, respond with a bad request error
    return res.status(400).json({ message: "Invalid payment signature. Please get in touch with the bank." });
  }
  // Note that the last `res.status(201).json` is removed since it shouldn't be there
});

module.exports = router;
