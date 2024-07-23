const express = require("express");
const router = express.Router();
const SalesStaff = require("../models/SalesStaff");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, phoneNumber, collegeName, collegeCity, collegeState, degree, branch, yearOfPassing, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const salesStaff = await SalesStaff.findOne({ email });
    
    if (salesStaff) {
      return res.status(409).json({ message: "Sales staff already exists" });
    }

    const newSalesStaff = new SalesStaff({
      firstName,
      lastName,
      email,
      phoneNumber,
      collegeName,
      collegeCity,
      collegeState,
      degree,
      branch,
      yearOfPassing,
      password: hashedPassword
    });

    await newSalesStaff.save();
    return res.status(201).json({ message: "Sales staff created successfully" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
