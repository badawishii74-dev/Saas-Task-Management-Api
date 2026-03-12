import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });

const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (res) => {
        // Pass both token and refreshToken
        login(res.data.token, res.data.refreshToken);
        navigate('/dashboard');
    },
    onError: (err) => {
        const msg = err.response?.data?.message;
        if (err.response?.status === 403) {
            navigate('/verify-otp', {
                state: { userId: err.response.data.userId }
            });
        } else {
            toast.error(msg || 'Login failed');
        }
    },
});

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(form);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                                    bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-slate-400 mt-1">Sign in to your account</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" loading={isPending} className="w-full mt-2">
                            Sign In
                        </Button>
                    </form>
                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}