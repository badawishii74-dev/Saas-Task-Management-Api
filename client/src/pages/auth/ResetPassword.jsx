import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LockKeyhole } from 'lucide-react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const inputs = useRef([]);

    if (!userId) {
        navigate('/forgot-password');
        return null;
    }

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputs.current[5]?.focus();
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: () => api.post('/auth/reset-password', {
            userId,
            otp: otp.join(''),
            newPassword,
        }),
        onSuccess: () => {
            toast.success('Password reset successfully!');
            navigate('/login');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
    });

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                                    bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
                        <LockKeyhole className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                    <p className="text-slate-400 mt-1">Enter the OTP and your new password</p>
                </div>

                <Card>
                    {/* OTP boxes */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-300 block mb-3">
                            Enter OTP
                        </label>
                        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl
                                               bg-slate-700 border border-slate-600 text-white
                                               focus:outline-none focus:ring-2 focus:ring-indigo-500
                                               focus:border-transparent transition-all duration-200"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Button
                            onClick={() => mutate()}
                            loading={isPending}
                            disabled={otp.join('').length !== 6 || newPassword.length < 6}
                            className="w-full"
                        >
                            Reset Password
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}