const crypto = require('crypto');

/**
 * Generate a 6-digit OTP and its expiry time (5 minutes from now)
 */
exports.generateOtp = () => {
    // Cryptographically secure random 6-digit number
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    return { otp, otpExpiry };
};