const jwt = require("jsonwebtoken");


// Middleware to validate Admin
exports.validateAdmin = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access. Please Provide Token" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            // Handle expired or invalid token with a refresh token, if available...
            return res.status(401).json({ message: "Invalid token" });
        }
        

        if (decoded.role !== 'Admin') {
            // Token is valid but the role does not match Admin
            return res.status(403).json({ message: "Access Forbidden: Restricted to Admins" });
        }

        // If Admin, check if trying to access Admin-specific data
        const adminId = req.params.id; // Use the correct name of the URL parameter
        console.log(decoded.userId);
        // Compare the employee ID from URL params to the userID in the JWT
        if (adminId.toString() !== decoded.userId.toString()) {
            return res.status(403).json({ message: "Access Forbidden: You can only access your own data" });
        }

        req.userRole = decoded.role; // Set user role for next middleware or route handler
        next();
    });
};

// Middleware to validate Employee
