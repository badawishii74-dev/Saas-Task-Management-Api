const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtpEmail = async ({ to, subject, otp, type }) => {
    const isReset = type === 'reset';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;
                    border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">
                ${isReset ? '🔒 Reset Your Password' : '✅ Verify Your Email'}
            </h2>
            <p style="color: #555; font-size: 15px;">
                ${isReset
            ? 'You requested to reset your password. Use the OTP below:'
            : 'Thanks for registering! Please verify your email using the OTP below:'}
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                             color: #4F46E5; background: #EEF2FF; padding: 12px 24px;
                             border-radius: 8px;">
                    ${otp}
                </span>
            </div>
            <p style="color: #888; font-size: 13px;">
                This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    `;

    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to,
        subject,
        html,
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
    }
};