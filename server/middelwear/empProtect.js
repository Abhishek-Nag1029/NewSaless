const jwt = require("jsonwebtoken");

exports.validateEmployee = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access. Please Provide Token" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (decoded.role !== 'Employee') {
            // Token is valid but the role does not match Employee
            return res.status(403).json({ message: "Access Forbidden: Restricted to Employees" });
        }

        // Get the employee ID from the request parameters
        const employeeId = req.params.id; // Use the correct name of the URL parameter
        console.log(decoded.userId);
        // Compare the employee ID from URL params to the userID in the JWT
        if (employeeId.toString() !== decoded.userId.toString()) {
            return res.status(403).json({ message: "Access Forbidden: You can only access your own data" });
        }

        // If this point is reached, the employee is authorized to access the requested data
        req.userRole = decoded.role; // Set user role for next middleware or route handler
        next();
    });
};