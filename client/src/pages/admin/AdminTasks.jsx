import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const STATUS_FILTERS = ['all', 'pending', 'in progress', 'completed'];

export default function AdminTasks() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-tasks'],
        queryFn: () => api.get('/admin/tasks').then(r => r.data),
    });

    const tasks = data?.tasks || [];
    const filtered = tasks.filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === 'all' || t.status === status;
        return matchSearch && matchStatus;
    });

    const { mutate: deleteTask } = useMutation({
        mutationFn: (id) => api.delete(`/admin/tasks/${id}`),
        onSuccess: () => {
            toast.success('Task deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    const filterBtnClass = (active) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
         ${active
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-white text-xl font-bold">All Tasks</h2>
                <p className="text-slate-400 text-sm mt-0.5">{filtered.length} tasks</p>
            </div>

            {/* Search + filter */}
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
                <div className="flex gap-2 flex-wrap">
                    {STATUS_FILTERS.map((s) => (
                        <button key={s} onClick={() => setStatus(s)} className={filterBtnClass(status === s)}>
                            {s}
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
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filtered.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4">
                                            <p className="text-white font-medium truncate max-w-40">{t.title}</p>
                                        </td>
                                        <td className="p-4"><Badge label={t.type} /></td>
                                        <td className="p-4"><Badge label={t.priority} /></td>
                                        <td className="p-4"><Badge label={t.status} /></td>
                                        <td className="p-4 text-slate-400">{t.assignedTo?.name || '—'}</td>
                                        <td className="p-4 text-slate-400">{t.team?.name || '—'}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this task?')) deleteTask(t._id);
                                                }}
                                                className="p-1.5 rounded-lg text-slate-400
                                                           hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}