const express = require("express");
const mongoose = require("mongoose");
const routes = require("./Routes/route.js");
const employeeRoutes = require("./Routes/employeeRoutes.js");
const adminRoutes = require('./Routes/adminRoutes.js');
const customerRoutes = require('./Routes/customerRoutes.js');
const salesStaffRoutes = require('./Routes/salesStaffRoutes.js');
const candidatesRoutes = require('./Routes/candidatesRoutes.js');
const masterAdmin = require('./Routes/masterAdmin.js')
const cookieParser = require("cookie-parser")
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors')
require("dotenv").config();
const Admin = require("./models/admin.js");
const Employee = require("./models/employee.js");
const { app, server } = require("./socket.js");


// const app = express();
const mongoString = process.env.DATABASE_URL;

// const server = createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3001',
//     credentials: true
//   }
// })


// app.use(cors({
//   origin:  'http://localhost:3001', 
//   // origin:  'http://localhost:5173',
//   credentials: true
// }));


const corsOptions = {
  origin: ['https://newsaless-4.onrender.com'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

// app.listen(3000, () => {
//   console.log(`Server Started at ${3000}`);
// });

//  Socekt Connection 
server.listen(3000, () => {
  console.log(`Server Started at ${3000}`);
});


//Database Connection
mongoose.connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});
//add

database.once("connected", () => {
  console.log("Database Connected");
});

//Routes Connections
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/master-admin', masterAdmin);
app.use('/api/customer', customerRoutes);
app.use('/api/salestaff', salesStaffRoutes);
app.use('/api/candidate', candidatesRoutes);

//  SOCKET start 👇





// module.exports = io 