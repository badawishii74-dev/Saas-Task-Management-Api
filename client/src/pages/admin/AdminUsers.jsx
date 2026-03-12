// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Trash2, Pencil, Search } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../../api/axios';
// import Spinner from '../../components/ui/Spinner';
// import Card from '../../components/ui/Card';
// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';
// import Modal from '../../components/ui/Modal';
// import Input from '../../components/ui/Input';
// import { useNavigate } from 'react-router-dom';

// export default function AdminUsers() {
//     const queryClient = useQueryClient();
//     const [search, setSearch] = useState('');
//     const [editUser, setEditUser] = useState(null);
//     const [form, setForm] = useState({ name: '', email: '', role: 'user' });
//     const [viewUser, setViewUser] = useState(null);
//     const navigate = useNavigate();


//     const { data, isLoading } = useQuery({
//         queryKey: ['admin-users'],
//         queryFn: () => api.get('/admin/users').then(r => r.data),
//     });

//     const users = data?.users || [];
//     const filtered = users.filter((u) =>
//         u.name.toLowerCase().includes(search.toLowerCase()) ||
//         u.email.toLowerCase().includes(search.toLowerCase())
//     );

//     const { mutate: updateUser, isPending: updating } = useMutation({
//         mutationFn: (data) => api.put(`/admin/users/${editUser._id}`, data),
//         onSuccess: () => {
//             toast.success('User updated');
//             queryClient.invalidateQueries({ queryKey: ['admin-users'] });
//             setEditUser(null);
//         },
//         onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
//     });

//     const { mutate: deleteUser } = useMutation({
//         mutationFn: (id) => api.delete(`/admin/users/${id}`),
//         onSuccess: () => {
//             toast.success('User deleted');
//             queryClient.invalidateQueries({ queryKey: ['admin-users'] });
//         },
//         onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
//     });

//     const openEdit = (user) => {
//         setEditUser(user);
//         setForm({ name: user.name, email: user.email, role: user.role });
//     };

//     const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
//                          text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`;

//     return (
//         <div className="flex flex-col gap-6">
//             <div>
//                 <h2 className="text-white text-xl font-bold">Manage Users</h2>
//                 <p className="text-slate-400 text-sm mt-0.5">{filtered.length} users</p>
//             </div>

//             {/* Search */}
//             <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//                 <input
//                     type="text"
//                     placeholder="Search by name or email..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border
//                                border-slate-700 text-white placeholder-slate-500
//                                focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//                 />
//             </div>

//             {isLoading ? <Spinner fullPage /> : (
//                 <Card className="p-0 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
//                                     <th className="text-left p-4 font-medium">User</th>
//                                     <th className="text-left p-4 font-medium">Role</th>
//                                     <th className="text-left p-4 font-medium">Verified</th>
//                                     <th className="text-left p-4 font-medium">Joined</th>
//                                     <th className="text-left p-4 font-medium">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-700/30">
//                                 {filtered.map((u) => (
//                                     <tr
//                                         key={u._id}
//                                         onClick={() => navigate(`/admin/users/${u._id}`)}
//                                         className="hover:bg-slate-700/20 transition-colors cursor-pointer"
//                                     >
//                                         <td className="p-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-9 h-9 rounded-full bg-gradient-to-br
//                                                                 from-indigo-500 to-purple-600
//                                                                 flex items-center justify-center flex-shrink-0">
//                                                     <span className="text-white text-sm font-bold">
//                                                         {u.name?.charAt(0).toUpperCase()}
//                                                     </span>
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-white font-medium">{u.name}</p>
//                                                     <p className="text-slate-400 text-xs">{u.email}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="p-4"><Badge label={u.role} /></td>
//                                         <td className="p-4">
//                                             <span className={`text-xs px-2 py-0.5 rounded-full
//                                                               ${u.isVerified
//                                                     ? 'bg-green-500/20 text-green-400'
//                                                     : 'bg-red-500/20 text-red-400'}`}>
//                                                 {u.isVerified ? 'Verified' : 'Unverified'}
//                                             </span>
//                                         </td>
//                                         <td className="p-4 text-slate-400">
//                                             {new Date(u.createdAt).toLocaleDateString()}
//                                         </td>
//                                         <td className="p-4">
//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() => openEdit(u)}
//                                                     className="p-1.5 rounded-lg text-slate-400
//                                                                hover:text-indigo-400 hover:bg-indigo-500/10
//                                                                transition-all "
//                                                 >
//                                                     <Pencil className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => {
//                                                         if (confirm('Delete this user?')) deleteUser(u._id);
//                                                     }}
//                                                     className="p-1.5 rounded-lg text-slate-400
//                                                                hover:text-red-400 hover:bg-red-500/10
//                                                                transition-all"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </Card>
//             )}

//             {/* Edit modal */}
//             <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
//                 <Input
//                     label="Name"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 />
//                 <Input
//                     label="Email"
//                     type="email"
//                     value={form.email}
//                     onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 />
//                 <div className="flex flex-col gap-1.5">
//                     <label className="text-sm font-medium text-slate-300">Role</label>
//                     <select
//                         value={form.role}
//                         onChange={(e) => setForm({ ...form, role: e.target.value })}
//                         className={selectClass}
//                     >
//                         <option value="user">User</option>
//                         <option value="admin">Admin</option>
//                     </select>
//                 </div>
//                 <div className="flex gap-3 pt-2">
//                     <Button variant="secondary" onClick={() => setEditUser(null)} className="flex-1">
//                         Cancel
//                     </Button>
//                     <Button onClick={() => updateUser(form)} loading={updating} className="flex-1">
//                         Save Changes
//                     </Button>
//                 </div>
//             </Modal>
//         </div>
//     );
// }


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

// ── Mini task summary shown inside user detail modal ───────────────────────
function UserTasksSummary({ userId }) {
    const { data: assigned } = useQuery({
        queryKey: ['user-assigned-tasks', userId],
        queryFn: () => api.get(`/admin/users/${userId}/tasks`).then(r => r.data),
        enabled: !!userId,
    });

    const { data: created } = useQuery({
        queryKey: ['user-created-tasks', userId],
        queryFn: () => api.get(`/admin/users/${userId}/created-tasks`).then(r => r.data),
        enabled: !!userId,
    });

    const assignedTasks = assigned?.tasks || [];
    const createdTasks = created?.tasks || [];
    const completed = assignedTasks.filter(t => t.status === 'completed').length;
    const inProgress = assignedTasks.filter(t => t.status === 'in progress').length;
    const pending = assignedTasks.filter(t => t.status === 'pending').length;

    return (
        <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Task Summary
            </p>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Assigned', value: assignedTasks.length, color: 'text-indigo-400' },
                    { label: 'Created', value: createdTasks.length, color: 'text-purple-400' },
                    { label: 'Done', value: completed, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 bg-slate-700/30 rounded-xl text-center">
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                    </div>
                ))}
            </div>
            {assignedTasks.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1">
                    <span className="text-xs px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400">
                        {pending} pending
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                        {inProgress} in progress
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400">
                        {completed} completed
                    </span>
                </div>
            )}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminUsers() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [viewUser, setViewUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'user' });

    // ── Fetch all users ───────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(r => r.data),
    });

    const users = data?.users || [];
    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // ── Update user ───────────────────────────────────────────────────────
    const { mutate: updateUser, isPending: updating } = useMutation({
        mutationFn: (data) => api.put(`/admin/users/${editUser._id}`, data),
        onSuccess: () => {
            toast.success('User updated');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setEditUser(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    // ── Delete user ───────────────────────────────────────────────────────
    const { mutate: deleteUser } = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setViewUser(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    // ── Helpers ───────────────────────────────────────────────────────────
    const openEdit = (user) => {
        setEditUser(user);
        setForm({ name: user.name, email: user.email, role: user.role });
    };

    const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                         text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition-all duration-200`;

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h2 className="text-white text-xl font-bold">Manage Users</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    {filtered.length} of {users.length} users
                </p>
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

            {/* Table */}
            {isLoading ? <Spinner fullPage /> : (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700/50
                                               bg-slate-800/50">
                                    <th className="text-left p-4 font-medium">User</th>
                                    <th className="text-left p-4 font-medium">Role</th>
                                    <th className="text-left p-4 font-medium">Verified</th>
                                    <th className="text-left p-4 font-medium">Joined</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}
                                            className="p-8 text-center text-slate-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : filtered.map((u) => (
                                    <tr
                                        key={u._id}
                                        onClick={() => setViewUser(u)}
                                        className="hover:bg-slate-700/20 transition-colors
                                                   cursor-pointer"
                                    >
                                        {/* User info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full
                                                                bg-gradient-to-br from-indigo-500
                                                                to-purple-600 flex items-center
                                                                justify-center flex-shrink-0">
                                                    <span className="text-white text-sm font-bold">
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-slate-400 text-xs">
                                                        {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="p-4">
                                            <Badge label={u.role} />
                                        </td>

                                        {/* Verified */}
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full
                                                              ${u.isVerified
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'}`}>
                                                {u.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="p-4 text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEdit(u);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400
                                                               hover:text-indigo-400
                                                               hover:bg-indigo-500/10 transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this user?'))
                                                            deleteUser(u._id);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400
                                                               hover:text-red-400
                                                               hover:bg-red-500/10 transition-all"
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

            {/* ── View User Modal ─────────────────────────────────────── */}
            <Modal
                open={!!viewUser}
                onClose={() => setViewUser(null)}
                title="User Details"
            >
                {viewUser && (
                    <div className="flex flex-col gap-4">

                        {/* Profile banner */}
                        <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br
                                            from-indigo-500 to-purple-600 flex items-center
                                            justify-center flex-shrink-0">
                                <span className="text-white text-xl font-bold">
                                    {viewUser.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">
                                    {viewUser.name}
                                </p>
                                <p className="text-slate-400 text-sm">{viewUser.email}</p>
                                {viewUser.mobile && (
                                    <p className="text-slate-400 text-sm">{viewUser.mobile}</p>
                                )}
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Role</p>
                                <Badge label={viewUser.role} />
                            </div>
                            <div className="p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Status</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full
                                                  ${viewUser.isVerified
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'}`}>
                                    {viewUser.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Gender</p>
                                <p className="text-white text-sm capitalize">
                                    {viewUser.gender || '—'}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-slate-400 text-xs mb-1">Joined</p>
                                <p className="text-white text-sm">
                                    {new Date(viewUser.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Task summary */}
                        <UserTasksSummary userId={viewUser._id} />

                        {/* Footer actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setViewUser(null);
                                    openEdit(viewUser);
                                }}
                                className="flex-1"
                            >
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (confirm('Delete this user?'))
                                        deleteUser(viewUser._id);
                                }}
                                className="flex-1"
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Edit User Modal ─────────────────────────────────────── */}
            <Modal
                open={!!editUser}
                onClose={() => setEditUser(null)}
                title="Edit User"
            >
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
                    <Button
                        variant="secondary"
                        onClick={() => setEditUser(null)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!form.name) return toast.error('Name is required');
                            if (!form.email) return toast.error('Email is required');
                            updateUser(form);
                        }}
                        loading={updating}
                        className="flex-1"
                    >
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </div>
    );
} []