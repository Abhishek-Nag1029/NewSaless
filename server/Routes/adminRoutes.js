const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const admin = require("../models/admin");
const nodemailer = require('nodemailer');
// const { protected } = require('../middelwear/protected.js');
const { validateAdmin } = require("../middelwear/adminProtect.js");
const { validateMasterAdmin } = require("../middelwear/masterProtected.js");
const { io } = require("../socket.js");
// const io = require('../server.js')


const jwtSecret = "mynameissaurabhratnaparkhi";

function authenticateJWT(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

//Get all the Admins
router.get('/fetchadmin', async (req, res) => {
  try {
    // Fetch all employees from the MongoDB collection
    const admin = await Admin.find();
    res.json(admin);

  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get single admin
// router.get('/:id', protected, async (req, res) => {
router.get('/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await Admin.findById(id);
    console.log("admin ",admin);

    if (!admin) {
      return res.status(404).json({ message: 'admin not found' });
    }

    return res.json(admin);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Admin login
router.post("/login", async (req, res) => {
  // const { firstName, lastName, password } = req.body;
  const { email, adminId, password } = req.body;

  try {
    let admin;
    // Search for the employee by email or referalID
    admin = await Admin.findOne({ email })
    console.log(admin);
    if (!admin) {
      // if admin's Email didn't match find by referalID
      admin = await Admin.findOne({ adminId: email })

      if (!admin) {
        return res.status(400).json({ message: 'Email or referalID is incorrect' });
      }
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    

    // Create a JWT
    // const token = jwt.sign({ adminId: admin._id }, process.env.JWT_KEY, {
    //   expiresIn: "1h",
    // });
    const token = jwt.sign({
      userId: admin._id,
      role: admin.userRole,
    }, process.env.JWT_KEY, { expiresIn: '1h' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1hr
    })

    return res.status(200).json({
      message: 'Login successful', admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      }, token
    });

  } catch (error) {

    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });

  }

});

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

//Register Admin Route
router.post("/register", async (req, res) => {
  const { firstName, lastName, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const adminCheck = await Admin.findOne({ email: email })
    if (adminCheck) {
      return res.status(401).json({message:"Email already exist "})
    }

    // Find the highest adminId
    const latestAdmin = await Admin.findOne({}, {}, { sort: { 'adminId': -1 } });
    let newAdminId;
    if (latestAdmin) {
      // Extract the current number from the adminId and increment it
      const currentNumber = parseInt(latestAdmin.adminId.replace('admin', ''));
      newAdminId = `admin${currentNumber + 1}`;
    } else {
      // If no admin exists, start with admin1
      newAdminId = 'admin1';
    }

    const newAdmin = new Admin({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      adminId: newAdminId
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Successfully created admin', newAdmin });

  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json(error);
  }
});

// Password check (without OTP)
router.post('/checkpass-pass/:id', async (req, res) => {
  const { id } = req.params;
  const { currentPassword } = req.body;
  try {
    const result = await Admin.findById(id);

    await Admin.findByIdAndUpdate(result._id);

    console.log(result);

    if (!result) {
      return res.status(401).json({ message: "Admin not found" })
    }

    const hashedPassword = await bcrypt.compare(currentPassword, result.password)
    if (!hashedPassword) {
      return res.status(401).json({ message: "Invalid Password please re-enter" })
    }

    return res.status(200).send({ message: 'Password matched successfully.', admin });

  } catch (error) {
    console.error('Error during OTP operation:', error);
    return res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});

// Password check for Email (with OTP)
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
    const result = await Admin.findById(id);

    await Admin.findByIdAndUpdate(result._id, { OTP: otp, otpCreatedAt: otpCreatedAt });

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
      text: `Your Admin OTP is: ${otp}. Note: This is OTP is valid only for 5 Mins`
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

router.post("/otp/:id", async (req, res) => {
  const { id } = req.params;
  const { OTP } = req.body;
  try {
    const admin = await Admin.findOne({ _id: id, OTP: OTP });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const currentTime = new Date();
    const timeDiff = (currentTime - admin.otpCreatedAt) / 1000

    if (timeDiff > 300) {
      return res.status(410).json({ message: "OTP expired" });
    }

    if (admin.OTP === +OTP) {
      await admin.save();
      return res.status(200).json({
        message: "OTP matched successfully",
        Admin: admin,
      });
    } else {
      return res.status(401).json({ message: "OTP did not match" });
    }
  } catch (error) {
    console.error("Error during OTP update:", error);
    return res.status(500).json({ message: "Internal server error", error: error.toString() });
  }
});

// Update admin
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, password, profileCreationDate, sale, adminId, email } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { firstName, lastName, password: hashedPassword, profileCreationDate, sale, adminId, email },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error("Error during admin update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Update Admin's Email  Specific
// router.put("/updateEmail/:id", async (req, res) => {
//   const { id } = req.params;
//   const { newEmail } = req.body;
//   try {

//     const admin = await Admin.findOne({ _id: id });

//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }
//     // current email should'nt be same with new one
//     if (admin.email === newEmail) {
//       return res.status(404).json({ message: "Please enter a new email" });
//     }
//     admin.email = newEmail;
//     console.log(admin);
//     await admin.save();

//     return res.status(200).json({
//       message: "Admin Email updated successfully",
//       admin: admin,
//     });
//   } catch (error) {
//     console.error("Error during email update of Admin:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });
router.put("/updateEmail/:id", async (req, res) => {
  const { id } = req.params;
  const { newEmail } = req.body;
  try {

    const admin = await Admin.findOne({ _id: id });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // current email should'nt be same with new one
    if (admin.email === newEmail) {
      return res.status(404).json({ message: "Please enter a new email" });
    }
    admin.email = newEmail;
    console.log(admin);
    await admin.save();

    io.emit('updateResponse', { // This sends the update to all clients, including the sender
      error: false,
      message: "Admin Email updated successfully",
      admin: admin
    });

    return res.status(200).json({
      message: "Admin Email updated successfully",
      admin: admin,
    });
  } catch (error) {
    console.error("Error during email update of Admin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


//  Password -----------------------------------------------------------------------------
router.put("/passupdate/:id", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {

    const admin = await Admin.findOne({ _id: id });


    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    console.log(admin);

    // Save the updated admin data
    await admin.save();
    console.log(admin);

    return res.status(200).json({
      message: "Admin updated successfully",
      admin: admin,
    });
  } catch (error) {
    console.error("Error during password update for Admin :", error);
    return res.status(500).json({ message: "Error during password update for Adminr", error });
  }
});

// Delete admin
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res
      .status(200)
      .json({ message: "Admin deleted successfully", admin: deletedAdmin });
  } catch (error) {
    console.error("Error during admin deletion:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
