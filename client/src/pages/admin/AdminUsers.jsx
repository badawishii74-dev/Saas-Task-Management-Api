import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'user' });
    const navigate = useNavigate();


    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(r => r.data),
    });

    const users = data?.users || [];
    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const { mutate: updateUser, isPending: updating } = useMutation({
        mutationFn: (data) => api.put(`/admin/users/${editUser._id}`, data),
        onSuccess: () => {
            toast.success('User updated');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setEditUser(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    const { mutate: deleteUser } = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ name: user.name, email: user.email, role: user.role });
    };

    const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                         text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-white text-xl font-bold">Manage Users</h2>
                <p className="text-slate-400 text-sm mt-0.5">{filtered.length} users</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border
                               border-slate-700 text-white placeholder-slate-500
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>

            {isLoading ? <Spinner fullPage /> : (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
                                    <th className="text-left p-4 font-medium">User</th>
                                    <th className="text-left p-4 font-medium">Role</th>
                                    <th className="text-left p-4 font-medium">Verified</th>
                                    <th className="text-left p-4 font-medium">Joined</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filtered.map((u) => (
                                    <tr
                                        key={u._id}
                                        onClick={() => navigate(`/admin/users/${u._id}`)}
                                        className="hover:bg-slate-700/20 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                                                from-indigo-500 to-purple-600
                                                                flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-sm font-bold">
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{u.name}</p>
                                                    <p className="text-slate-400 text-xs">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><Badge label={u.role} /></td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full
                                                              ${u.isVerified
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'}`}>
                                                {u.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="p-1.5 rounded-lg text-slate-400
                                                               hover:text-indigo-400 hover:bg-indigo-500/10
                                                               transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this user?')) deleteUser(u._id);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400
                                                               hover:text-red-400 hover:bg-red-500/10
                                                               transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Edit modal */}
            <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
                <Input
                    label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Role</label>
                    <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className={selectClass}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setEditUser(null)} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={() => updateUser(form)} loading={updating} className="flex-1">
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </div>
    );
}