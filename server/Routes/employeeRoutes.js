const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const { validateEmployee } = require("../middelwear/empProtect.js")
const { validateAdminView } = require("../middelwear/adminView.js");
// const { protected } = require('../middelwear/protected.js')
const Employee = require("../models/employee.js");
const Customer = require('../models/customer');
const { io } = require("../socket.js");
const employee = require("../models/employee.js");

//-----------------------------------------post--------------------------------------------------------------

// Employee login -------------------------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Search for the employee by email or referalID
  console.log(password);

  try {
    let employee;
    employee = await Employee.findOne({ email })
    if (!employee) {
      // if  employee's Email didn't match find by referalID
      employee = await Employee.findOne({ referalID: email })

      if (!employee) {
        return res.status(400).json({ message: 'Email or referalID is incorrect' });
      }
    }
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }


    // const token = jwt.sign({ userId: employee.id }, process.env.JWT_KEY, { expiresIn: "1h" })
    const token = jwt.sign({
      userId: employee._id,
      role: employee.userRole,
    }, process.env.JWT_KEY, { expiresIn: '1h' });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1hr
    })

    return res.status(200).json({
      message: 'Login successful', employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }, token
    });

  } catch (error) {

    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });

  }
});
//  Logout -----------------------------------------------------------------------------------

router.post('/logout', (req, res) => {
  //  verify the token before logout
  const token = req.cookies.token;
  if (token) {
    // Clearing the JWT cookie
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout successful' });
  } else {
    return res.status(400).json({ message: 'No active session' });
  }
});

// Employee registeration -------------------------------------------------------------------
router.post("/register", async (req, res) => {

  //Getting the data
  const { firstName, lastName, password, profileCreationDate, sale, id, email } = req.body;
  const makeReferal = 'MGNA' + id;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newEmployee = new Employee({ firstName, lastName, password: hashedPassword, profileCreationDate, sale, id, email, referalID: makeReferal });

  //Try and Catch Exception
  try {

    const employee = await Employee.findOne({ email });
    if (employee) {
      return res.status(401).json({ message: "Employee already exists" });
    }

    await newEmployee.save();
    return res.status(201).json({ message: "Employee created successfully" });

  } catch (error) {

    console.error("Error during sign-up:", error);
    return res.status(500).json({ message: "Internal server error" });

  }
});

router.post('/cpass/:id', async (req, res) => {
  const { id } = req.params
  const { currentPassword } = req.body;

  try {
    let employee;
    // Search for the employee by email or referalID
    employee = await Employee.findOne({ _id: id })
    if (!employee) {
      // if  employee's Email didn't match find by referalID
      return res.status(400).json({ message: "Employee not found" })
    }

    // console.log(req.body);
    const passwordMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({ message: 'true', employee });

  } catch (error) {

    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });

  }
});

router.post('/:id', async (req, res) => {
  const { id } = req.params
  // const { currentPassword } = req.body;

  try {
    let employee;
    // Search for the employee by email or referalID
    employee = await Employee.findOne({ _id: id })
    if (!employee) {
      // if  employee's Email didn't match find by referalID
      return res.status(400).json({ message: "Employee not found" })
    }

    // console.log(req.body);
    const passwordMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({ message: 'true', employee });

  } catch (error) {

    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });

  }
});

//Generate EMAIL + OTP---------------------------------------------------------------------

router.post('/checkPass/:id', async (req, res) => {
  const { id } = req.params;
  const { currentPassword } = req.body;

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().substring(0, 6);
  };

  const otp = generateOTP();
  const otpCreatedAt = new Date();

  try {
    const result = await Employee.findById(id);

    await Employee.findByIdAndUpdate(result._id, { OTP: otp, otpCreatedAt: otpCreatedAt });

    // Check if the Employee update was successful
    if (!Employee) {
      return res.status(404).send({ message: 'Employee not found.' });
    }
    const hashedPassword = await bcrypt.compare(currentPassword, result.password)
    if (!hashedPassword) {
      return res.status(401).json({ message: "Invalid Password please re-enter" })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });


    const mailOptions = {
      from: process.env.EMAIL,
      to: "borgaonkar1998@gmail.com",
      subject: 'OTP for Verification',
      text: `Your Employee OTP is: ${otp}. Note: This is OTP is valid only for 5 Mins`
    };

    // Send email with OTP
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error during email sending:', error);
        return res.status(500).send({ message: 'There was an error sending the email.', error: error.message });
      }
      return res.status(200).send({ message: 'OTP sent successfully.', otp });
    });

  } catch (error) {
    console.error('Error during OTP operation:', error);
    return res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});

// router.post('/sendEmail/:id', async (req, res) => {
//   const { id } = req.params;
//   const { oldEmail } = req.body;

//   const generateOTP = () => {
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     return otp.toString().substring(0, 6);
//   };

//   const otp = generateOTP();

//   try {
//     const result = await Employee.findOne({ id });
//     await Employee.findByIdAndUpdate(result._id, { OTP: otp });

//     // Check if the Employee update was successful
//     if (!Employee) {
//       return res.status(404).send({ message: 'Employee not found.' });
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD
//       }
//     });


//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: oldEmail,
//       subject: 'OTP for Verification',
//       text: `Your OTP is: ${otp}`
//     };

//     // Send email with OTP
//     transporter.sendMail(mailOptions, (error) => {
//       if (error) {
//         console.error('Error during email sending:', error);
//         return res.status(500).send({ message: 'There was an error sending the email.', error: error.message });
//       }
//       return res.status(200).send({ message: 'OTP sent successfully.', otp });
//     });

//   } catch (error) {
//     console.error('Error during OTP operation:', error);
//     return res.status(500).send({ message: 'Internal server error', error: error.message });
//   }
// });

//-----------------------------------------GET----------------------------------------------

//Get all the employees---------------------------------------------------------------------
// Backend pagination code ⤵
router.get('/fetchemployees', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Determine sort field and order
  const sortField = req.query.sortField || 'id'; // Default sort by 'id'
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default is ascending

  // Ensure valid sort field is provided
  const allowedSortFields = ['_id', 'totalSale']; // Specify allowed fields to sort by
  const sortOptions = allowedSortFields.includes(sortField)
    ? { [sortField]: sortOrder }
    : { _id: sortOrder }; // Default sorting by '_id' if invalid sortField is provided

  try {
    const employees = await Employee.find()
      .sort(sortOptions)
      .limit(limit)
      .skip(skip);

    const count = await Employee.countDocuments();

    const totalPages = Math.ceil(count / limit);

    res.json({
      totalPages,
      currentPage: page,
      pageSize: limit,
      totalItems: count,
      employees
    });
  } catch (error) {
    console.error('Error fetching employee data:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

//  Main code without pagination
router.get('/totalemp', async (req, res) => {
  try {
    // Fetch all employees from the MongoDB collection
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch a specific employee by ID ------------------------------------------------
// router.get('/:id', protected, async (req, res) => {
router.get('/:id', validateEmployee, async (req, res) => {

  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Employee fetch :- (  Admin View Only ) 
router.get('/adminview/:id', validateAdminView, async (req, res) => {

  const { id } = req.params;

  try {
    const employee = await Employee.findOne({ _id: id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/employee/total-customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the provided employee ID exists
    const employee = await Employee.findOne({ _id: id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate total number of customers for the employee
    const totalCustomers = await Customer.countDocuments({ referralEmployee: employee.referalID });

    // Update the employee document with the total customer count
    await Employee.updateOne({ _id: id }, { totalCustomers: totalCustomers });

    res.json({ employeeId: id, totalCustomers });
  } catch (error) {
    console.error('Error fetching total customers for employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//-----------------------------------------PUT----------------------------------------------

// Update Email
router.put("/updateEmail/:id", async (req, res) => {
  const { id } = req.params;
  const { newEmail } = req.body;
  try {

    const employee = await Employee.findOne({ _id: id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.email === newEmail) {
      return res.status(404).json({ message: "Please enter a new Email" });
    }
    employee.email = newEmail;
    console.log(employee);
    await employee.save();
    io.emit('employeeUpdateResponse', {
      error: false,
      message: "Employee Email updated successfully",
      employee: employee
    });


    return res.status(200).json({
      message: "Employee Email updated successfully",
      employee: employee,
    });
  } catch (error) {
    console.error("Error during email update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// OTP ------------------------------------------------------------------------------------
router.post("/otp/:id", async (req, res) => {
  const { id } = req.params;
  const { OTP } = req.body;
  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const currentTime = new Date();
    const timeDiff = (currentTime - employee.otpCreatedAt) / 1000

    if (timeDiff > 300) {
      return res.status(410).json({ message: "OTP expired" });
    }

    // Update the  employee
    if (employee.OTP === +OTP) {
      console.log(employee);
      await employee.save();
      return res.status(200).json({

        message: "OTP matched successfully",
        employee: employee,
      });
    } else {
      // Incorrect OTP
      return res.status(401).json({ message: "OTP did not match" });
    }
  } catch (error) {
    console.error("Error during OTP update:", error);
    return res.status(500).json({ message: "Internal server error", employee, error: error.message });
  }
});

//  Password -----------------------------------------------------------------------------
router.put("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {

    const employee = await Employee.findOne({ _id: id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    console.log(employee);

    // Save the updated employee data
    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: employee,
    });
  } catch (error) {
    console.error("Error during total sale update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//-----------------------------------------DELETE--------------------------------------------------------------

// Delete employee
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res
      .status(200)
      .json({
        message: "Employee deleted successfully",
        employee: deletedEmployee,
      });
  } catch (error) {
    console.error("Error during employee deletion:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
