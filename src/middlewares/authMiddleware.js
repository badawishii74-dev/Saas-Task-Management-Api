const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check if the token is provided in the Authorization header
    if(req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token is provided, return an error
    if(!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify the token
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object
    req.user = await User.findById(decoded.id).select('-password');
    next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
}
