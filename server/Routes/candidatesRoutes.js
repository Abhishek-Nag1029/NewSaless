const express = require("express");
const router = express.Router();
const { protected } = require("../middelwear/protected.js");
const { validateAdminView } = require("../middelwear/adminView.js");
const Candidate = require("../models/candidate");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const upload = require("../middelwear/multer.js");
const Employee = require("../models/employee.js");
const { title } = require("process");
const Admin = require("../models/admin");
const { error } = require("console");
const crypto = require("crypto");
//## Get ---------------------------------------------------------------------------
// All candidates

// main Code

// router.get('/', protected, async (req, res) => {
//   // router.get('/', async (req, res) => {
//   try {
//     const candidates = await Candidate.find({});

//     // Send back the list of candidates
//     res.status(200).json(candidates);
//   } catch (error) {
//     // If an error occurs, send back an error response
//     res.status(500).json({ message: 'Error fetching candidates', error: error });
//   }
// });

router.get("/admin-candidate/:id", validateAdminView, async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Unauthorized acess", error: error.message });
    }
    const candidates = await Candidate.find({});

    // Send back the list of candidates
    res.status(200).json(candidates);
  } catch (error) {
    // If an error occurs, send back an error response
    res
      .status(500)
      .json({ message: "Error fetching candidates", error: error.message });
  }
});

router.get("/:id", validateAdminView, async (req, res) => {
  const { id } = req.params;
  try {
    const candidates = await Candidate.findById(id);

    res.status(200).json(candidates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching candidates", error: error });
  }
});

//## Post ---------------------------------------------------------------------------

// Add New candidates
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      college,
      state,
      branch,
      degree,
      passingYear,
      message,
    } = req.body;

    // Create a hash of the email
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    const saveCandidate = await Candidate.create({
      emailHash: emailHash,
      firstName,
      lastName,
      email,
      phone,
      college,
      state,
      branch,
      degree,
      passingYear,
      message,
    });

    return res.status(200).json({
      message: "Candidate added successfully",
      saveCandidate,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while adding candidate",
      error: error.message,
    });
  }
});

//  All candidates  by status
router.post("/pending", async (req, res) => {
  try {
    const candiate = await Candidate.find({ status: "pending" });
    res
      .status(200)
      .json({ message: "Fetched  pending candidates Success", candiate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching pending candidates", error: error });
  }
});

router.post("/shortlisted", async (req, res) => {
  try {
    const candiate = await Candidate.find({ status: "shortlisted" });
    res
      .status(200)
      .json({ message: "Fetched  Shortlisted candidates Success", candiate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching Shortlisted candidates", error: error });
  }
});

router.post("/discarded", async (req, res) => {
  try {
    const candiate = await Candidate.find({ status: "discarded" });
    res
      .status(200)
      .json({ message: "Fetched  discarded candidates Success", candiate });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching Shortlisted candidates", error: error });
  }
});

//Send email as Helper Function

const sendEmail = async (subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: "borgaonkar1998@gmail.com",
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

//Covert ==> Shortlisted
router.post("/shortlist/:id", async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;

  console.log(candidateId);
  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid request" });
    }

    const candidate = await Candidate.findOne({ _id: candidateId });

    if (!candidate) {
      return res.status(401).json({ message: "Candidate not found" });
    }

    if (candidate.status === "shortlisted") {
      return res.status(400).json({ message: "Candidate already shortlisted" });
    }

    const adminName = admin.firstName + " " + admin.lastName; // Added space between names for readability
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          status: "shortlisted", // Corrected the update object
          adminAction: adminName,
        },
      },
      { new: true }
    );

    const subject = "Candidate Shortlisted";
    const htmlContent = `<h2>Status Update</h2>
                         <p>The candidate <b>${candidate.firstName} ${candidate.lastName}</b>  has been shortlisted by <b>${adminName}</b>.</p>
                         <div>${updatedCandidate}</div>
                         `;
    await sendEmail(subject, htmlContent);
    res.json({ message: "Candidate shortlisted", candidate: updatedCandidate });
  } catch (error) {
    console.error(error);
    res.status(500).json(error); // Send the error as a JSON
  }
});
// Covert ==> Discarded
router.post("/discard/:id", async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;

  console.log(candidateId);
  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid request" });
    }

    const candidate = await Candidate.findOne({ _id: candidateId });

    if (!candidate) {
      return res.status(401).json({ message: "Candidate not found" });
    }

    if (candidate.status === "discarded") {
      return res.status(400).json({ message: "Candidate already discarded" });
    }

    const adminName = admin.firstName + " " + admin.lastName;
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          status: "discarded",
          adminAction: adminName,
        },
      },
      { new: true }
    );

    const subject = "Candidate discarded";
    const htmlContent = `<h2>Status Update</h2>
                         <p>The candidate ${candidate.firstName} ${candidate.lastName}  has been discarded by ${adminName}.</p>
                         <div>${updatedCandidate}</div>
                         `;
    await sendEmail(subject, htmlContent);
    res.json({ message: "Candidate discarded", candidate: updatedCandidate });
  } catch (error) {
    console.error(error);
    res.status(500).json(error); // Send the error as a JSON
  }
});

// Covert ==> Pending
router.post("/pending/:id", async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;

  console.log(candidateId);
  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid request" });
    }

    const candidate = await Candidate.findOne({ _id: candidateId });

    if (!candidate) {
      return res.status(401).json({ message: "Candidate not found" });
    }

    if (candidate.status === "pending") {
      return res.status(400).json({ message: "Candidate already pending" });
    }

    const adminName = admin.firstName + " " + admin.lastName;
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          status: "pending",
          adminAction: adminName,
        },
      },
      { new: true }
    );

    const subject = "Candidate status Pending";
    const htmlContent = `<h2>Status Update</h2>
                         <p>The candidate ${candidate.firstName} ${candidate.lastName} status has been changed to  pending by ${adminName}.</p>
                         <div>${updatedCandidate}</div>
                         `;
    await sendEmail(subject, htmlContent);
    res.json({ message: "Candidate pending", candidate: updatedCandidate });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// Covert ==> invited
router.post("/invited/:id", async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;

  console.log(candidateId);
  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid request" });
    }

    const candidate = await Candidate.findOne({ _id: candidateId });

    if (!candidate) {
      return res.status(401).json({ message: "Candidate not found" });
    }

    if (candidate.status === "invited") {
      return res.status(400).json({ message: "Candidate already invited" });
    }

    const adminName = admin.firstName + " " + admin.lastName;
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          status: "invited",
          adminAction: adminName,
        },
      },
      { new: true }
    );

    const subject = "Candidate status invited";
    const htmlContent = `<h2>Status Update</h2>
                         <p>The candidate ${candidate.firstName} ${candidate.lastName} status has been changed to  invited by ${adminName}.</p>
                         <div>${updatedCandidate}</div>
                         `;
    await sendEmail(subject, htmlContent);
    res.json({ message: "Candidate invited", candidate: updatedCandidate });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// Covert ==> employee
router.post("/employee/:id", async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;
  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid request" });
    }
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate did not found" });
    }

    if (candidate.status === "employee") {
      return res.status(400).json({ message: "Candidate is already employee" });
    }

    const adminName = admin.firstName + " " + admin.lastName;
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          status: "employee",
          adminAction: adminName,
        },
      },
      { new: true }
    );

    const subject = "Candidate Employee";
    const htmlContent = `<h2>Status Update</h2>
                         <p>The candidate ${candidate.firstName} ${candidate.lastName} status has been changed to  employee by ${adminName}.</p>
                         <div>${updatedCandidate}</div>
                         `;
    await sendEmail(subject, htmlContent);

    // Candidate status updated and now creating an Employee  👇

    // The Candidate would need a password and referral ID for registration ⤵
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "@_";
    const allChars = uppercase + numbers + specialChars;

    let password = "";
    let referralID = "";

    // Construct password with mandatory characters
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Construct referral ID with mandatory characters
    referralID += uppercase[Math.floor(Math.random() * uppercase.length)];
    referralID += numbers[Math.floor(Math.random() * numbers.length)];
    referralID += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest of the characters and shuffle
    while (password.length < 6) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    while (referralID.length < 6) {
      referralID += allChars[Math.floor(Math.random() * allChars.length)];
    }
    referralID = referralID
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    const employee = await Employee.findOne({ email: updatedCandidate.email });
    if (employee) {
      return res.status(401).json({ message: "Employee already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createEmployeeAction = await Employee.create({
      firstName: updatedCandidate.firstName,
      lastName: updatedCandidate.lastName,
      email: updatedCandidate.email,
      password: hashedPassword,
      referalID: referralID,
      id: candidateId,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: updatedCandidate.email,
      subject: `Welcome to Bolt IO`,
      html: `
        <h2>Congratulations ${updatedCandidate.firstName} ${updatedCandidate.lastName} </h2>
        <p>We are please to have you onboarded as our sales Employee !! </p>
        <p>Here are your login credentials</p>
        <p>Email : ${updatedCandidate.email}</p>
        <p>Password : ${password}</p>
        <p>referralID : ${referralID}</p>

        `,
    };

    // Send the email
    const emailResponse = await transporter.sendMail(mailOptions);

    res.json({ employee: createEmployeeAction, candidate: updatedCandidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Send mail to all shortlisted candidates
router.post("/sendemail", async (req, res) => {
  const candidates = await Candidate.find({ status: "shortlisted" });

  if (!candidates.length) {
    return res
      .status(400)
      .json({ message: "No Candidates found for sending emails" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Helper function to create individual emails with a unique submission link
  const sendEmailWithUniqueLink = async (candidate) => {
    const emailHash = candidate.emailHash; // Assume this field is already populated in your Candidate document
    const submissionLink = `https://newsaless-4.onrender.com/submission/${emailHash}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: candidate.email, // Send to the individual candidate's email
      subject: `Welcome to Bolt IO`,
      html: `<p>Please use the link below to submit your resume:</p><p>${submissionLink}</p>`, // Insert the unique link
    };

    // Send email
    return transporter.sendMail(mailOptions);
  };

  // Send emails with unique links
  const sendEmailPromises = candidates.map((candidate) =>
    sendEmailWithUniqueLink(candidate)
  );

  Promise.all(sendEmailPromises)
    .then(() => {
      return res.status(200).json({ message: "All emails sent successfully." });
    })
    .catch((error) => {
      console.error("Error during email sending:", error);
      return res.status(500).json({
        message: "There was an error sending some emails.",
        error: error.message,
      });
    });
});

router.post("/sendemail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const candidate = await Candidate.findOne({ _id: id }); // Use findOne to get a single document
    // Check if the candidate exists
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the candidate was already shortlisted
    if (candidate.status === "invited") {
      return res.status(400).json({ message: "Candidate already shortlisted" });
    }

    // Configure the transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: candidate.email, // Send to the individual candidate's email
      subject: `Welcome to Bolt IO`,
      html: `
        <p>Please use the link below to submit your resume:</p>
        <p><a href="https://newsaless-4.onrender.com/submission/${candidate.emailHash}">Resume Submission Link</a></p>
        `, // Insert the unique link
    };

    // Send the email
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", emailResponse);

    // Update candidate status to 'shortlisted' after sending the email
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      { status: "invited" },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Email sent successfully", updatedCandidate });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({
      message: "Something went wrong with the request",
      error: error.message,
    });
  }
});

// Single candidate shortlisted mail
router.post("/submission/:emailHash", async (req, res) => {
  const { emailHash } = req.params;
  const { email, resumeLink } = req.body;

  try {
    const candidate = await Candidate.findOne({ emailHash });

    if (!candidate) {
      res
        .status(404)
        .json({ message: "No candidate found with this identifier." });
      return;
    }

    if (candidate.email !== email) {
      res
        .status(400)
        .json({ message: "The provided email does not match our records." });
      return;
    }

    candidate.resume = resumeLink;
    await candidate.save();

    res.status(200).json({ message: "Resume submitted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your submission.",
      error: error.message,
    });
  }
});

// Candidate internship
router.post("/check/referral-code", async (req, res) => {
  const { referalID } = req.body;
  try {
    const checkRefId = await Employee.findOne({ referalID: referalID });
    if (!checkRefId) {
      return res
        .status(401)
        .json({ message: "referalID not found", error: error.message });
    }
    return res.status(200).json(checkRefId);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// router.post('/add/bank-details', async (req, res) => {
//   const { email, bankName, accountNumber, payeeName, ifscCode } = req.body;

//   try {
//     if (!email || !bankName || !accountNumber || !payeeName || !ifscCode) {
//       return res.status(400).json({ message: "Please enter all fields" });
//     }

//     const candidate = await Candidate.findOne({ email: email });
//     if (!candidate) {
//       return res.status(404).json({ message: "Email not found" });
//     }

//     if (candidate.bankName || candidate.accountNumber || candidate.payeeName || candidate.ifscCode) {
//       return res.status(409).json({ message: "Bank details have already been submitted. Please contact your HR." });
//     }

//     const hashedBankName = await bcrypt.hash(bankName, 10);
//     const hashedAccountNumber = await bcrypt.hash(accountNumber, 10);

//     const hashedIfscCode = await bcrypt.hash(ifscCode, 10);

//     console.log(hashedBankName,
//       hashedAccountNumber,
//       hashedIfscCode);

//     const update = {
//       bankName: hashedBankName,
//       accountNumber: hashedAccountNumber,
//       payeeName,
//       ifscCode: hashedIfscCode
//     };
//     const result = await Candidate.findByIdAndUpdate(candidate._id, update, { new: true });

//     if (result) {
//       // Setup nodemailer transport inside the if block to avoid unnecessary setup for failure cases
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL,
//           pass: process.env.EMAIL_PASSWORD
//         }
//       });

//       const emailText = `Dear ${result.firstName} ${result.lastName},\n\n` +
//         `Your bank details have been updated successfully:\n\n` +
//         `Bank Name: ${result.bankName}\n` +
//         `Account Number: ${result.accountNumber}\n` +
//         `Payee Name: ${result.payeeName}\n` +
//         `IFSC Code: ${result.ifscCode}\n\n` +
//         `Regards,\n` +
//         `The Team`;

//       // Define the mail options
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: result.email, // Corrected this to result.email
//         subject: 'Bank Details Updated',
//         text: emailText
//       };

//       // Send an email notification to the candidate
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error during email sending:', error);
//           return res.status(500).json({ message: 'There was an error sending the email.', error: error.message });
//         } else {
//           // Email sent successfully, now we send response back to client
//           return res.status(200).json({ message: 'Bank details updated and mail sent successfully', result });
//         }
//       });
//     } else {
//       // If update operation didn't return a result.
//       return res.status(404).json({ message: "Update failed, candidate not found." });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "Something went wrong", error: error.message });
//   }
// });

const encryptText = (text) => {
  const cipher = crypto.createCipher("aes-256-ctr", process.env.HASH_SECRET);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

router.post("/add/bank-details", async (req, res) => {
  const { email, bankName, accountNumber, payeeName, ifscCode } = req.body;

  // Encrypt the bank details
  const encryptedBankName = encryptText(bankName);
  const encryptedAccountNumber = encryptText(accountNumber);
  const encryptedIfscCode = encryptText(ifscCode);

  try {
    if (
      !email ||
      !encryptedBankName ||
      !encryptedAccountNumber ||
      !payeeName ||
      !encryptedIfscCode
    ) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (
      candidate.bankName ||
      candidate.accountNumber ||
      candidate.payeeName ||
      candidate.ifscCode
    ) {
      return res.status(409).json({
        message:
          "Bank details have already been submitted. Please contact your HR.",
      });
    }

    const update = {
      bankName: encryptedBankName,
      accountNumber: encryptedAccountNumber,
      payeeName,
      ifscCode: encryptedIfscCode,
    };

    const result = await Candidate.findByIdAndUpdate(candidate._id, update, {
      new: true,
    });

    if (result) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Email text should NOT contain sensitive bank details, even in encrypted form
      const emailText =
        `Dear ${result.firstName} ${result.lastName},\n\n` +
        `Your bank details have been updated successfully.\n\n` +
        `Regards,\n` +
        `The HR Team`;

      const mailOptions = {
        from: process.env.EMAIL,
        to: result.email,
        subject: "Bank Details Updated",
        text: emailText,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error during email sending:", error);
          return res.status(500).json({
            message: "There was an error sending the email.",
            error: error.message,
          });
        }
        // Email has been sent, respond to the client
        return res.status(200).json({
          message: "Bank details updated and email sent successfully",
          result,
        });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Update failed, candidate not found." });
    }
  } catch (error) {
    console.error("Error during bank details update:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

module.exports = router;
