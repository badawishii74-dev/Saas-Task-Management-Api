const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otpHelper');
const { sendOtpEmail } = require('../services/emailService');

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

    const { otp, otpExpiry } = generateOtp();
    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        mobile: mobile || null,
        gender: gender || null,
        otp,
        otpExpiry,
        isVerified: false,
    });

    await sendOtpEmail({
        to: email,
        subject: 'Verify your email – Task Manager',
        otp,
        type: 'verify',
    });

    res.status(201).json({ message: 'User registered successfully', token });

}


exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ message: 'userId and otp are required' });
        }
        // Find user by ID and select OTP fields
        const user = await User.findById(userId).select('+otp +otpExpiry');


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
        }
        // Mark as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = generateAccessToken(user);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findById(userId).select('+otp +otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }


        // Prevent spamming — must wait until current OTP expires
        if (user.otpExpiry && user.otpExpiry > new Date()) {
            const secondsLeft = Math.ceil((user.otpExpiry - new Date()) / 1000);
            return res.status(429).json({
                message: `Please wait ${secondsLeft} seconds before requesting a new OTP`,
            });
        }
        const { otp, otpExpiry } = generateOtp();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendOtpEmail({
            to: user.email,
            subject: 'Your new OTP – Task Manager',
            otp,
            type: 'verify',
        });

        res.status(200).json({
            success: true,
            message: 'A new OTP has been sent to your email',
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

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

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ message: 'Login successful', token, refreshToken });
}


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpiry');
        // Always return 200 to prevent email enumeration attacks
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, an OTP has been sent',
            });
        }
        // Prevent spamming
        if (user.resetPasswordOtpExpiry && user.resetPasswordOtpExpiry > new Date()) {
            const secondsLeft = Math.ceil((user.resetPasswordOtpExpiry - new Date()) / 1000);
            return res.status(429).json({
                message: `Please wait ${secondsLeft} seconds before requesting a new OTP`,
            });
        }

        const { otp, otpExpiry } = generateOtp();
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = otpExpiry;
        await user.save();

        await sendOtpEmail({
            to: user.email,
            subject: 'Reset your password – Task Manager',
            otp,
            type: 'reset',
        });

        res.status(200).json({
            success: true,
            message: 'If that email exists, an OTP has been sent',
            userId: user._id,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        if (!userId || !otp || !newPassword) {
            return res.status(400).json({ message: 'userId, otp and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(userId)
            .select('+password +resetPasswordOtp +resetPasswordOtpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.resetPasswordOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
        }

        // Update password and clear reset fields
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in.',
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



// creat admin user
exports.createAdmin = async (req, res) => {
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

    // Create new admin user
    const user = await User.create({ name, email, password, role: 'admin' });
    const token = generateAccessToken(user);

    res.status(201).json({ message: 'Admin user created successfully', token });
}


const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '60m' }
    );
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
}
