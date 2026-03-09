import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    loginUser, registerUser, verifyOtp, resendOtp,
    forgotPassword, resetPassword,
} from '../api';

// modes: login | register | verify-otp | forgot-password | reset-password
export default function AuthPage() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', gender: 'male', otp: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const [pendingUserId, setPendingUserId] = useState(null);
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                const data = await loginUser(form.email, form.password);
                login({ token: data.token, refreshToken: data.refreshToken });
                addToast('Welcome back!', 'success');
                navigate('/');
            } else if (mode === 'register') {
                const data = await registerUser(form.name, form.email, form.password, form.mobile, form.gender);
                setPendingUserId(data.userId);
                addToast(data.message || 'OTP sent to your email', 'success');
                setMode('verify-otp');
            } else if (mode === 'verify-otp') {
                const data = await verifyOtp(pendingUserId, form.otp);
                login({ token: data.token, refreshToken: data.refreshToken });
                addToast('Email verified! Welcome!', 'success');
                navigate('/');
            } else if (mode === 'forgot-password') {
                const data = await forgotPassword(form.email);
                setPendingUserId(data.userId);
                addToast(data.message || 'OTP sent if that email exists', 'success');
                setMode('reset-password');
            } else if (mode === 'reset-password') {
                await resetPassword(pendingUserId, form.otp, form.newPassword);
                addToast('Password reset! Please login.', 'success');
                setMode('login');
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const data = await resendOtp(pendingUserId);
            addToast(data.message || 'New OTP sent!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const titles = {
        'login': 'Sign In',
        'register': 'Create Account',
        'verify-otp': 'Verify Email',
        'forgot-password': 'Forgot Password',
        'reset-password': 'Reset Password',
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 mb-4 shadow-lg shadow-violet-500/30">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">TaskFlow</h1>
                    <p className="text-gray-400 mt-1 text-sm">Your SaaS task management hub</p>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Tab toggle — only for login/register */}
                    {(mode === 'login' || mode === 'register') && (
                        <div className="relative flex bg-gray-800/60 rounded-xl p-1 mb-6">
                            <div 
                                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-violet-600 rounded-lg shadow-md shadow-violet-500/30 transition-transform duration-300 ease-out ${
                                    mode === 'register' ? 'translate-x-full' : 'translate-x-0'
                                }`}
                            />
                            {['login', 'register'].map((m) => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors duration-300 capitalize
                                        ${mode === m ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step title for other modes */}
                    {!['login', 'register'].includes(mode) && (
                        <h2 className="text-xl font-bold text-white mb-6 text-center">{titles[mode]}</h2>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name, Mobile, Gender — register only */}
                        {mode === 'register' && (
                            <>
                                <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                                <Field label="Mobile" name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="+1234567890" />
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Gender</label>
                                    <select
                                        name="gender" value={form.gender} onChange={handleChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                        )}

                        {/* Password — login & register */}
                        {(mode === 'login' || mode === 'register') && (
                            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                        )}

                        {/* OTP */}
                        {(mode === 'verify-otp' || mode === 'reset-password') && (
                            <Field label="OTP Code" name="otp" value={form.otp} onChange={handleChange} placeholder="6-digit code" maxLength={6} />
                        )}

                        {/* New Password — reset only */}
                        {mode === 'reset-password' && (
                            <Field label="New Password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="••••••••" />
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full mt-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed
                                text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20
                                hover:shadow-violet-500/40 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : titles[mode]}
                        </button>
                    </form>

                    {/* Resend OTP */}
                    {mode === 'verify-otp' && (
                        <p className="text-center mt-4 text-sm text-gray-400">
                            Didn't get the code?{' '}
                            <button onClick={handleResend} className="text-violet-400 hover:text-violet-300 font-medium">Resend OTP</button>
                        </p>
                    )}

                    {/* Forgot password link */}
                    {mode === 'login' && (
                        <p className="text-center mt-4 text-sm text-gray-400">
                            <button onClick={() => setMode('forgot-password')} className="text-violet-400 hover:text-violet-300 font-medium">
                                Forgot password?
                            </button>
                        </p>
                    )}

                    {/* Back to login */}
                    {!['login', 'register'].includes(mode) && (
                        <p className="text-center mt-4 text-sm text-gray-400">
                            <button onClick={() => setMode('login')} className="text-gray-400 hover:text-gray-200">
                                ← Back to Login
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, maxLength }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                name={name} type={type} value={value} onChange={onChange}
                placeholder={placeholder} maxLength={maxLength}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
        </div>
    );
}
