import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../api';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';

export default function Dashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all');

    const loadTasks = useCallback(async () => {
        try {
            const data = await fetchTasks();
            setTasks(data.tasks);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleCreate = async ({ title, description }) => {
        try {
            const data = await createTask(title, description);
            setTasks((prev) => [data.task, ...prev]);
            addToast('Task created!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleUpdate = async ({ title, description, status }) => {
        try {
            const data = await updateTask(editingTask._id, { title, description, status });
            setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data.task : t)));
            addToast('Task updated!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const data = await updateTaskStatus(id, status);
            setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
            addToast('Status updated!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            addToast('Task deleted!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const openCreate = () => { setEditingTask(null); setModalOpen(true); };
    const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

    const filteredTasks =
        filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} onNewTask={openCreate} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <StatsBar tasks={tasks} filter={filter} setFilter={setFilter} />

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <svg className="animate-spin w-10 h-10 text-violet-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p className="text-gray-400 text-sm">Loading your tasks...</p>
                        </div>
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={filteredTasks}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                    />
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
