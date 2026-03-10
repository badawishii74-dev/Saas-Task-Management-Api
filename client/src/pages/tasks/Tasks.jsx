import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import api from '../../api/axios';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const STATUS_FILTERS = ['all', 'pending', 'in progress', 'completed'];
const PRIORITY_FILTERS = ['all', 'low', 'medium', 'high'];

export default function Tasks() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: () => api.get('/tasks').then(r => r.data),
    });

    const tasks = data?.tasks || [];

    // Client-side filtering
    const filtered = tasks.filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === 'all' || t.status === status;
        const matchPriority = priority === 'all' || t.priority === priority;
        return matchSearch && matchStatus && matchPriority;
    });

    const openCreate = () => { setEditingTask(null); setModalOpen(true); };
    const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditingTask(null); };

    const filterBtnClass = (active) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
         ${active
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white text-xl font-bold">My Tasks</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {filtered.length} of {tasks.length} tasks
                    </p>
                </div>
                <Button onClick={openCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Task
                </Button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-700 border
                                   border-slate-600 text-white placeholder-slate-500
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                                   transition-all text-sm"
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={filterBtnClass(status === s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Priority filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    {PRIORITY_FILTERS.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={filterBtnClass(priority === p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task grid */}
            {isLoading ? (
                <Spinner fullPage />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center
                                    justify-center mb-4">
                        <Plus className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-medium">No tasks found</p>
                    <p className="text-sm mt-1">
                        {search || status !== 'all' || priority !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first task to get started'}
                    </p>
                    {!search && status === 'all' && priority === 'all' && (
                        <Button onClick={openCreate} className="mt-4">
                            <Plus className="w-4 h-4 mr-2" /> Create Task
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((task) => (
                        <TaskCard key={task._id} task={task} onEdit={openEdit} />
                    ))}
                </div>
            )}

            {/* Create / Edit modal */}
            <TaskModal
                open={modalOpen}
                onClose={closeModal}
                task={editingTask}
            />
        </div>
    );
}