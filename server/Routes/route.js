//Adding the required libraries
const express = require("express");
const app = express();
const customerSchema = require("../models/customer");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer"); // Import Nodemailer
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Generate JWT token
function generateToken(payload, secret, expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}


// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//     user: "saurabhratnaparkhi11@gmail.com",
//     pass: "1asaurabh",
//   },
// });

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {
//   // send mail with defined transport object
//   const info = await transporter.sendMail({
//     from: 'saurabhratnaparkhi11@gmail.com', // sender address
//     to: "190030036.alum23@iitdh.ac.in", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });

//   console.log("Message sent: %s", info.messageId);
// }

// main().catch(console.error);

//Post Method
router.post("/post", (req, res) => {
  const data = new customerSchema({
    name: req.body.name,
    password: req.body.password,
    totalSale: req.body.totalSale,
    joiningDate: req.body.joiningDate,
  });

  try {
    const dataToSave = data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/delete/:id", (req, res) => {
  customerSchema
    .findOneAndRemove({
      _id: req.params.id,
    })
    .then((customerSchema) => res.send(`Account Deleted`))
    .catch((err) => res.json(err));
});

router.put("/update/:id",(req, res) => {
    customerSchema.findOneAndUpdate(req.params.id, req.body.totalSale)
    .then((customerSchema) => res.send(`Account Updated Success`))
    .catch((err) => res.json(err));
});

// Route to record sales and send email notifications
router.post("/record-sale", async (req, res) => {
  const { adminId, saleAmount } = req.body;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const subject = "New Sale Notification";
    const message = `A new sale of $${saleAmount} has occurred. Contact the customer for further details.`;

    sendEmailNotification(subject, message);

    return res.status(200).json({ message: "Sale recorded successfully" });
  } catch (error) {
    console.error("Error during sale recording:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


//Get all Method
router.get("/getAll", (req, res) => {
  res.send("Get All API");
});

//Get by ID Method
router.get("/getOne/:id", (req, res) => {
  res.send(req.params.id);
});

module.exports = router;
