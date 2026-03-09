import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask, fetchOverdueTasks, filterTasks } from '../api';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';

const FILTER_KEYS = ['status', 'priority', 'overdue'];

export default function Dashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Active filters
    const [activeStatus, setActiveStatus] = useState('');
    const [activePriority, setActivePriority] = useState('');
    const [showOverdue, setShowOverdue] = useState(false);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            let data;
            if (showOverdue) {
                data = await fetchOverdueTasks();
            } else if (activeStatus || activePriority) {
                const params = {};
                if (activeStatus) params.status = activeStatus;
                if (activePriority) params.priority = activePriority;
                data = await filterTasks(params);
            } else {
                data = await fetchTasks();
            }
            setTasks(data.tasks ?? data);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast, activeStatus, activePriority, showOverdue]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    const handleCreate = async (fields) => {
        try {
            const data = await createTask(fields);
            setTasks((prev) => [data.task ?? data, ...prev]);
            addToast('Task created!', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleUpdate = async (fields) => {
        try {
            const data = await updateTask(editingTask._id, fields);
            setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? (data.task ?? data) : t)));
            addToast('Task updated!', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const data = await updateTaskStatus(id, status);
            setTasks((prev) => prev.map((t) => (t._id === id ? (data.task ?? data) : t)));
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            addToast('Task deleted!', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const openCreate = () => { setEditingTask(null); setModalOpen(true); };
    const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

    const clearFilters = () => { setActiveStatus(''); setActivePriority(''); setShowOverdue(false); };

    const statusFilters = ['pending', 'in progress', 'completed'];
    const priorityFilters = ['low', 'medium', 'high'];
    const hasFilters = activeStatus || activePriority || showOverdue;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} onNewTask={openCreate} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <StatsBar tasks={tasks} />

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Filter:</span>

                    {/* Status filters */}
                    {statusFilters.map((s) => (
                        <FilterChip key={s} label={s} active={activeStatus === s}
                            onClick={() => { setShowOverdue(false); setActiveStatus(activeStatus === s ? '' : s); }} />
                    ))}

                    <div className="w-px h-5 bg-gray-800 mx-1" />

                    {/* Priority filters */}
                    {priorityFilters.map((p) => (
                        <FilterChip key={p} label={`${p} priority`} active={activePriority === p}
                            onClick={() => { setShowOverdue(false); setActivePriority(activePriority === p ? '' : p); }}
                            color={p === 'high' ? 'red' : p === 'medium' ? 'yellow' : 'green'} />
                    ))}

                    <div className="w-px h-5 bg-gray-800 mx-1" />

                    {/* Overdue */}
                    <FilterChip label="⏰ Overdue" active={showOverdue}
                        onClick={() => { clearFilters(); setShowOverdue(!showOverdue); }}
                        color="orange" />

                    {hasFilters && (
                        <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-300 ml-1 underline">
                            Clear
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <svg className="animate-spin w-10 h-10 text-violet-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p className="text-gray-400 text-sm">Loading tasks…</p>
                        </div>
                    </div>
                ) : (
                    <KanbanBoard tasks={tasks} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                )}
            </main>

            {modalOpen && (
                <TaskModal
                    task={editingTask}
                    onClose={() => setModalOpen(false)}
                    onSubmit={editingTask ? handleUpdate : handleCreate}
                />
            )}
        </div>
    );
}

function FilterChip({ label, active, onClick, color }) {
    const base = 'px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all cursor-pointer select-none';
    const colorMap = {
        red: active ? 'bg-red-500/20 border-red-500/60 text-red-300' : 'border-gray-700 text-gray-400 hover:border-red-500/40',
        yellow: active ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300' : 'border-gray-700 text-gray-400 hover:border-yellow-500/40',
        green: active ? 'bg-green-500/20 border-green-500/60 text-green-300' : 'border-gray-700 text-gray-400 hover:border-green-500/40',
        orange: active ? 'bg-orange-500/20 border-orange-500/60 text-orange-300' : 'border-gray-700 text-gray-400 hover:border-orange-500/40',
        default: active ? 'bg-violet-600/20 border-violet-500/60 text-violet-300' : 'border-gray-700 text-gray-400 hover:border-violet-500/40',
    };
    return <button onClick={onClick} className={`${base} ${colorMap[color] ?? colorMap.default}`}>{label}</button>;
}
