const jwt = require("jsonwebtoken");
// Middleware to validate Admin View Only
exports.validateAdminView = (req, res, next) => {
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

        req.userRole = decoded.role; // Set user role for next middleware or route handler
        next();
    });
};

// Middleware to validate Employee
