import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const userId = location.state?.userId;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);

    // Redirect if no userId in state
    if (!userId) {
        navigate('/register');
        return null;
    }

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // numbers only
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        // Auto focus next
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

    const { mutate: verify, isPending } = useMutation({
        mutationFn: () => api.post('/auth/verify-otp', { userId, otp: otp.join('') }),
        onSuccess: (res) => {
            login(res.data.token);
            toast.success('Email verified! Welcome 🎉');
            navigate('/dashboard');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Invalid OTP'),
    });

    const { mutate: resend, isPending: resending } = useMutation({
        mutationFn: () => api.post('/auth/resend-otp', { userId }),
        onSuccess: () => toast.success('New OTP sent to your email'),
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend'),
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
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Verify Email</h1>
                    <p className="text-slate-400 mt-1">Enter the 6-digit code sent to your email</p>
                </div>

                <Card>
                    {/* OTP input boxes */}
                    <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
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

                    <Button
                        onClick={() => verify()}
                        loading={isPending}
                        disabled={otp.join('').length !== 6}
                        className="w-full"
                    >
                        Verify Email
                    </Button>

                    <div className="text-center mt-4">
                        <span className="text-slate-400 text-sm">Didn't receive the code? </span>
                        <button
                            onClick={() => resend()}
                            disabled={resending}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium
                                       transition-colors disabled:opacity-50"
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}