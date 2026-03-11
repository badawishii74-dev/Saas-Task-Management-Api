import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const STATUS_FILTERS = ['all', 'pending', 'in progress', 'completed'];
const TYPE_FILTERS = ['all', 'personal', 'team'];

export default function AdminTasks() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [typeFilter, setType] = useState('all');
    const [editTask, setEditTask] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', status: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tasks'],
        queryFn: () => api.get('/admin/tasks').then(r => r.data),
    });

    const tasks = data?.tasks || [];
    const filtered = tasks.filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === 'all' || t.status === status;
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const { mutate: updateTask, isPending: updating } = useMutation({
        mutationFn: (data) => api.put(`/admin/tasks/${editTask._id}`, data),
        onSuccess: () => {
            toast.success('Task updated');
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
            setEditTask(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    const { mutate: deleteTask } = useMutation({
        mutationFn: (id) => api.delete(`/admin/tasks/${id}`),
        onSuccess: () => {
            toast.success('Task deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    const openEdit = (task) => {
        setEditTask(task);
        setForm({
            name: task.title || '',
            description: task.description || '',
            status: task.status || 'pending',
        });
    };

    const filterBtnClass = (active) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
         ${active
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                         text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition-all duration-200`;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-white text-xl font-bold">All Tasks</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    {filtered.length} of {tasks.length} tasks
                </p>
            </div>

            {/* Search + filters */}
            <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-700 border
                                   border-slate-600 text-white placeholder-slate-500
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-xs w-12">Status</span>
                    {STATUS_FILTERS.map((s) => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={filterBtnClass(status === s)}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-xs w-12">Type</span>
                    {TYPE_FILTERS.map((t) => (
                        <button key={t} onClick={() => setType(t)}
                            className={filterBtnClass(typeFilter === t)}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? <Spinner fullPage /> : (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
                                    <th className="text-left p-4 font-medium">Title</th>
                                    <th className="text-left p-4 font-medium">Type</th>
                                    <th className="text-left p-4 font-medium">Priority</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Assigned To</th>
                                    <th className="text-left p-4 font-medium">Team</th>
                                    <th className="text-left p-4 font-medium">Due</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500">
                                            No tasks found
                                        </td>
                                    </tr>
                                ) : filtered.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4">
                                            <p className="text-white font-medium truncate max-w-40">
                                                {t.title}
                                            </p>
                                            {t.description && (
                                                <p className="text-slate-500 text-xs truncate max-w-40">
                                                    {t.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4"><Badge label={t.type} /></td>
                                        <td className="p-4"><Badge label={t.priority} /></td>
                                        <td className="p-4"><Badge label={t.status} /></td>
                                        <td className="p-4 text-slate-400">
                                            {t.assignedTo?.name || '—'}
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {t.team?.name || '—'}
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {t.dueDate
                                                ? new Date(t.dueDate).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(t)}
                                                    className="p-1.5 rounded-lg text-slate-400
                                                               hover:text-indigo-400 hover:bg-indigo-500/10
                                                               transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this task?')) deleteTask(t._id);
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
            <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
                <Input
                    label="Title"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`${selectClass} resize-none`}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className={selectClass}
                    >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setEditTask(null)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => updateTask(form)}
                        loading={updating}
                        className="flex-1"
                    >
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </div>
    );
}