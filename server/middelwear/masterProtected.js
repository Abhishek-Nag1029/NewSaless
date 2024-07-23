const jwt = require("jsonwebtoken");

// Middleware to validate Master-Admin
exports.validateMasterAdmin = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access. Please Provide Token" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            // Handle expired or invalid token with a refresh token, if available...
            return res.status(401).json({ message: "Invalid token" });
        }
        

        if (decoded.role !== 'MasterAdmin') {
            // Token is valid but the role does not match Admin
            return res.status(403).json({ message: "Access Forbidden: Restricted to MasterAdmins Only" });
        }

        req.userRole = decoded.role; // Set user role for next middleware or route handler
        next();
    });
};

