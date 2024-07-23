const jwt = require("jsonwebtoken");

exports.protected = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized Access. Please Provide Token"
        });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            const refreshToken = req.cookies.refreshToken;
            // Handle token expiration or invalidation by using the refresh token...
        } else {
            console.log("Token verified");

            // Here's where you've verified the token is correct.
            // Now you want to ensure that the user can only access their own data.

            let requestedUserId = req.params.userId || req.body.userId || req.query.userId;

            if (!requestedUserId) {
                // If no specific user ID is requested, simply continue (e.g. for non-user specific routes)
                return next();
            }

            requestedUserId = requestedUserId.toString();
            const userIdFromToken = decoded.userId.toString();

            if (decoded.role === 'Admin') {
                // If it's an admin, allow them to access any user's data
                // You might want to perform additional checks to ensure it's only authorized data
                
                // You can also add the role to the request if you need it later
                req.userRole = decoded.role;

                // Optionally, if you don't want admins to use Employee-specific endpoints:
                // if (requestedUserId !== userIdFromToken) {
                //   return res.status(403).json({ message: "Access Forbidden: Admins should not use Employee endpoints" });
                // }

                return next();
            } else if (decoded.role === 'Employee' && requestedUserId === userIdFromToken) {
                // If it's an employee, ensure that they're only trying to access their own data
                req.userRole = decoded.role;
                return next();
            } else {
                // If none of the above criteria are met, access is forbidden
                return res.status(403).json({ message: "Access Forbidden: You can only access your own data" });
            }
        }
    });
};