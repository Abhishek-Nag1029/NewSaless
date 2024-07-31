const { createServer } = require('node:http');
const { Server } = require('socket.io');
const express = require("express");
const app = express();
const Admin = require("./models/admin");
const Employee = require('./models/employee');
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: ['https://newsaless-4.onrender.com'],
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log("CLIENT CONNECTED", socket.id);
    socket.on('getAdmin', async (id) => {
        try {
            const admin = await Admin.findById(id);

            if (!admin) {
                io.emit('adminResponse', { error: true, message: 'Admin not found' });
            } else {
                // Send client admin data ⤵
                console.log("############ Get current email ##########");
                console.log(admin.email);
                io.emit('adminResponse', { error: false, data: admin });
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            socket.emit('adminResponse', { error: true, message: 'Internal server error' });
        }
    });

    socket.on('getEmp', async (id) => {
        try {
            const employee = await Employee.findById(id);
            if (!employee) {
                socket.emit('empResponse', { error: true, message: 'Employee not found' });
            } else {
                socket.emit('empResponse', { error: false, data: employee });
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
            socket.emit('empResponse', { error: true, message: 'Internal server error' });
        }
    });


    socket.on('updateEmail', async ({ id, newEmail }) => {
        try {
            console.log("============Update Email code=============")
            const admin = await Admin.findOne({ _id: id });
            console.log(`Current Email:- ${newEmail}`);
            console.log(`Admin email:- ${admin.email}`);
            console.log(`Admin Data Before: ${admin}`);
            console.log("=========================")
            if (!admin) {
                io.emit('updateResponse', { error: true, message: "Admin not found" });
            }
            // else if (admin.email === newEmail) {
            //     io.emit('updateResponse', { error: true, message: "Please enter a new email" });
            //     io.emit('adminResponse', { error: false, data: admin });
            // }
            else {
                admin.email = newEmail;
                await admin.save();
                io.emit('updateResponse', { // This sends the update to all clients, including the sender
                    error: false,
                    message: "Admin Email updated successfully",
                    admin: admin
                });
            }
        } catch (error) {
            console.error("Error during email update of Admin:", error);
            io.emit('updateResponse', { error: true, message: "Internal server error" });
        }
    });

    socket.on("test", () => {
        io.emit("dummy", ["dell", "hp"])
    })

    socket.on('updateEmployeeEmail', async ({ id, newEmail }) => {
        try {
            const employee = await Employee.findById(id);
            if (!employee) {
                socket.emit('updateResponse', { error: true, message: "Employee not found" });
            } else if (employee.email === newEmail) {
                socket.emit('updateResponse', { error: true, message: "New email cannot be the same as the current email." });
            } else {
                employee.email = newEmail;
                await employee.save();
                io.emit('employeeUpdateResponse', {
                    error: false,
                    message: "Employee Email updated successfully",
                    employee: employee
                });
            }
        } catch (error) {
            console.error("Error during email update:", error);
            socket.emit('updateResponse', { error: true, message: "Internal server error" });
        }
    });


    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

module.exports = { app, server, io }