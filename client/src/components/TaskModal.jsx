import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTeams, fetchTeamMembers } from '../api';
import CommentsPanel from './CommentsPanel';

const PRIORITY_COLORS = {
    low: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    high: 'text-red-400 bg-red-400/10',
};

export default function TaskModal({ task, onClose, onSubmit }) {
    const { user } = useAuth();
    const isEdit = !!task;
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        type: 'personal',
        dueDate: '',
        teamId: '',
        assignedTo: '',
    });
    const [tab, setTab] = useState('details'); // 'details' | 'comments'
    const [loading, setLoading] = useState(false);

    // Team Assignment Data
    const [ledTeams, setLedTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    useEffect(() => {
        // Fetch teams the user leads
        const loadTeams = async () => {
            try {
                const data = await fetchTeams();
                const allTeams = data.teams ?? data;
                // Keep only teams where user is the leader
                const myLedTeams = allTeams.filter(t =>
                    (t.leader?._id || t.leader) === user?.id
                );
                setLedTeams(myLedTeams);
            } catch (err) { console.error('Failed to load teams', err); }
            finally { setLoadingTeams(false); }
        };
        loadTeams();
    }, [user]);

    useEffect(() => {
        // Load members when a team is selected
        if (form.teamId) {
            const loadMembers = async () => {
                try {
                    const data = await fetchTeamMembers(form.teamId);
                    console.log(data);
                    setTeamMembers(data.members ?? data);
                } catch (err) { console.error('Failed to load members', err); }
            };
            loadMembers();
        } else {
            setTeamMembers([]);
        }
    }, [form.teamId]);


    useEffect(() => {
        if (task) {
            setForm({
                title: task.title ?? '',
                description: task.description ?? '',
                status: task.status ?? 'pending',
                priority: task.priority ?? 'medium',
                type: task.type ?? 'personal',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                teamId: task.teamId?._id ?? task.teamId ?? '',
                assignedTo: task.assignedTo?._id ?? task.assignedTo ?? '',
            });
        } else if (ledTeams.length > 0 && form.type === 'team' && !form.teamId) {
            // Default to first led team when switching to 'team' mode
            setForm(prev => ({ ...prev, teamId: ledTeams[0]._id }));
        }
    }, [task, ledTeams, form.type]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            title: form.title,
            description: form.description,
            status: form.status,
            priority: form.priority,
            type: form.type,
            ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            ...(form.type === 'team' && form.teamId ? { teamId: form.teamId } : {}),
            ...(form.type === 'team' && form.assignedTo ? { assignedTo: form.assignedTo } : {}),
        };
        try {
            await onSubmit(payload);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const priorityColor = PRIORITY_COLORS[form.priority] ?? '';

    // Format due date display
    const isOverdue = form.dueDate && new Date(form.dueDate) < new Date();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs (edit mode only) */}
                {isEdit && (
                    <div className="flex border-b border-gray-800">
                        {['details', 'comments'].map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors
                                    ${tab === t ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-500 hover:text-gray-300'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {tab === 'comments' && isEdit ? (
                        <CommentsPanel taskId={task._id} />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="label">Title</label>
                                <input name="title" value={form.title} onChange={handleChange} required placeholder="Task title"
                                    className="input" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="label">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                                    placeholder="Optional description…" className="input resize-none" />
                            </div>

                            {/* Priority + Due Date row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Priority</label>
                                    <select name="priority" value={form.priority} onChange={handleChange} className={`input ${priorityColor}`}>
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🔴 High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Due Date</label>
                                    <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange}
                                        className={`input ${isOverdue ? 'border-red-500/60 text-red-400' : ''}`} />
                                </div>
                            </div>

                            {/* Type - Only allow Team if user leads at least one team */}
                            <div>
                                <label className="label">Task Type</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" value="personal" checked={form.type === 'personal'} onChange={handleChange}
                                            className="accent-violet-500" />
                                        <span className="text-sm text-gray-300">Personal</span>
                                    </label>

                                    {!loadingTeams && ledTeams.length > 0 && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="type" value="team" checked={form.type === 'team'} onChange={handleChange}
                                                className="accent-violet-500" />
                                            <span className="text-sm text-gray-300">Team (I manage)</span>
                                        </label>
                                    )}
                                    {!loadingTeams && ledTeams.length === 0 && (
                                        <span className="text-xs text-gray-500 italic mt-0.5 ml-2">(Create a team to manage team tasks)</span>
                                    )}
                                </div>
                            </div>

                            {/* Team Assignment Fields */}
                            {form.type === 'team' && (
                                <div className="grid grid-cols-2 gap-3 animate-fade-in p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                    <div>
                                        <label className="label">Select Team</label>
                                        <select name="teamId" value={form.teamId} onChange={handleChange} className="input" >
                                            <option value="" disabled>Choose a team...</option>
                                            {ledTeams.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Assign To Member</label>
                                        <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
                                            <option value="">Unassigned</option>
                                            {teamMembers.map(m => (
                                                <option key={m._id} value={m._id}>
                                                    {m.name || m.email} {m._id === user?.id ? '(Me)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Status (edit only) */}
                            {isEdit && (
                                <div>
                                    <label className="label">Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="input">
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold
                                        transition-all shadow-lg shadow-violet-500/20">
                                    {loading ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
