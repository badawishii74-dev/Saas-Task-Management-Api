import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', mobile: '', gender: ''
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => api.post('/auth/register', data),
        onSuccess: (res) => {
            toast.success('OTP sent to your email!');
            navigate('/verify-otp', { state: { userId: res.data.userId } });
        },
        onError: (err) => {
            const data = err.response?.data;
            if (data?.userId) {
                // Unverified account exists
                toast.error(data.message);
                navigate('/verify-otp', { state: { userId: data.userId } });
                return;
            }
            toast.error(data?.message || 'Registration failed');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(form);
    };

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
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create account</h1>
                    <p className="text-slate-400 mt-1">Join Task Manager today</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <Input
                            label="Mobile (optional)"
                            placeholder="01012345678"
                            value={form.mobile}
                            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300">Gender (optional)</label>
                            <select
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                                           text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                                           transition-all duration-200"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <Button type="submit" loading={isPending} className="w-full mt-2">
                            Create Account
                        </Button>
                    </form>
                    <p className="text-center text-slate-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}