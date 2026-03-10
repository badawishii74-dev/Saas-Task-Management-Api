import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => api.post('/auth/forgot-password', data),
        onSuccess: (res) => {
            toast.success('OTP sent if that email exists');
            navigate('/reset-password', { state: { userId: res.data.userId } });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
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
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
                    <p className="text-slate-400 mt-1">We'll send an OTP to your email</p>
                </div>

                <Card>
                    <form onSubmit={(e) => { e.preventDefault(); mutate({ email }); }}
                        className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" loading={isPending} className="w-full mt-2">
                            Send OTP
                        </Button>
                    </form>
                    <p className="text-center text-slate-400 text-sm mt-6">
                        Remember your password?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}