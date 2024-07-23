const Express = require('express')
const masterAdmin = require('../models/masterAdmin')
const router = Express.Router()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const Candidate = require('../models/candidate');
const crypto = require('crypto');

router.post('/add-master-admin', async (req, res) => {
    const { email, password } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const mAdmin = await masterAdmin.create({ email, password: hashedPassword })
        return res.status(200).json(mAdmin)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})


router.get('/', async (req, res) => {
    try {
        const adminMaster = await masterAdmin.find()
        return res.status(200).json(adminMaster)
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error })
    }
})

// router.post('/acess', async (req, res) => {
//     const { password } = req.body
//     try {
//         // const passwordMatch = await bcrypt.compare(password, masterAdmin.password);
//         const result = await masterAdmin.findOne({ password: password })


//         const token = jwt.sign({
//             role: result.userRole,
//         }, process.env.JWT_KEY, { expiresIn: '1h' });

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: true,
//             sameSite: 'Strict',
//             maxAge: 60 * 60 * 1000 // 1hr
//         })

//         return res.status(200).json({
//             message: 'Login successful', result, token
//         });


//         // return res.status(200).json({ message: "Welcome Master-Admin", result })
//     } catch (error) {
//         return res.status(500).json({ message: "Somethingwent wrong", error: error.message })
//     }
// })


router.post('/access', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Assuming you have only one admin document in your masterAdmin collection
        const admin = await masterAdmin.findOne({ email: email });
        if (!admin) {
            return res.status(400).json({ message: 'Email is incorrect' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.json({ message: "Login successfull", admin })


    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});


// router.get("/candidate-data", async (req, res) => {
//     try {
//         const candidatesWithBankDetails = await Candidate.find({
//             bankName: { $exists: true, $ne: "" },
//             accountNumber: { $exists: true, $ne: null },
//             payeeName: { $exists: true, $ne: "" },
//             ifscCode: { $exists: true, $ne: "" }
//         }).select('email firstName lastName bankName accountNumber payeeName ifscCode _id'); // Selects only the specified fields

//         // const compareAccountName = await bcrypt.compare(candidatesWithBankDetails.accountNumber,xyz)

//         res.json(candidatesWithBankDetails);

//     } catch (err) {
//         res.status(500).send(err);
//     }
// })


const decryptText = (encryptedText) => {
    const decipher = crypto.createDecipher('aes-256-ctr', process.env.HASH_SECRET);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

router.get("/candidate-data", async (req, res) => {
    try {
        const candidatesWithBankDetails = await Candidate.find({
            bankName: { $exists: true, $ne: "" },
            accountNumber: { $exists: true, $ne: null },
            payeeName: { $exists: true, $ne: "" },
            ifscCode: { $exists: true, $ne: "" }
        }).select('email firstName lastName bankName accountNumber payeeName ifscCode _id'); // Selects only the specified fields

        // Decrypt bank details for each candidate
        const decryptedCandidates = candidatesWithBankDetails.map(candidate => ({
            email: candidate.email,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            bankName: decryptText(candidate.bankName),
            accountNumber: decryptText(candidate.accountNumber),
            payeeName: (candidate.payeeName),
            ifscCode: decryptText(candidate.ifscCode),
            _id: candidate._id
        }));

        res.json(decryptedCandidates);

    } catch (err) {
        console.error('Error retrieving and decrypting candidate bank details:', err);
        res.status(500).send({ message: "Failed to retrieve candidate data", error: err.message });
    }
});


const encryptText = (text) => {
    const strText = String(text);
    const cipher = crypto.createCipher('aes-256-ctr', process.env.HASH_SECRET);
    let encrypted = cipher.update(strText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };
router.put("/candidate/update/:id", async (req, res) => {
    const { id } = req.params;
    const { bankName, accountNumber, payeeName, ifscCode } = req.body;
  
    const encryptedBankName = encryptText(bankName);
    const encryptedAccountNumber = encryptText(accountNumber);
    const encryptedIfscCode = encryptText(ifscCode);
  
    try {
      const updatedCandidate = await Candidate.findByIdAndUpdate(
        id,
        {
          $set: {
            bankName: encryptedBankName,
            accountNumber: encryptedAccountNumber,
            payeeName,
            ifscCode: encryptedIfscCode
          }
        },
        { new: true } 
      );
  
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
  
      // Set up transporter and send email without including sensitive details
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: updatedCandidate.email,
        subject: 'Bank Details Updated',
        text: `Dear ${updatedCandidate.firstName},\n\n` +
            `Your bank details have been updated successfully.\n\n` +
            `If you did not make this request, please contact our support immediately.\n\n` +
            `Best Regards,\nYour Team`
      };
  
      transporter.sendMail(mailOptions, error => {
        if (error) {
          console.error('Error during email sending:', error);
          return res.status(500).json({ message: 'Error sending email', error: error.message });
        }
        res.json({ message: "Candidate's bank details updated successfully and email sent." });
      });
  
    } catch (err) {
      console.error('Error during candidate update:', err);
      res.status(500).json({ message: "Error updating candidate's bank details", error: err.message });
    }
  });

module.exports = router;