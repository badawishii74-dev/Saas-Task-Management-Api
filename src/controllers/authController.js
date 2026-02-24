const User = require('../models/User');
const bcrypt = require('bcryptjs');

// register user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate user input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}



// login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validate user input
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}