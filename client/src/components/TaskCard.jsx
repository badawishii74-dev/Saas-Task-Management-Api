import { useState } from 'react';

const STATUS_NEXT = {
    pending: 'in progress',
    'in progress': 'completed',
    completed: 'pending',
};
const STATUS_LABELS = {
    pending: { label: 'Pending', classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    'in progress': { label: 'In Progress', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    completed: { label: 'Completed', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const cfg = STATUS_LABELS[task.status] ?? STATUS_LABELS.pending;

    const handleStatusCycle = async () => {
        setStatusLoading(true);
        await onStatusChange(task._id, STATUS_NEXT[task.status]);
        setStatusLoading(false);
    };

    const handleDelete = () => {
        if (confirmDelete) {
            onDelete(task._id);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="group bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3
                    hover:border-gray-700 hover:shadow-xl hover:shadow-black/20 transition-all duration-200 animate-fade-in">
            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-100 leading-snug flex-1 text-sm">{task.title}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                        title="Edit"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`p-1.5 rounded-lg transition-all ${confirmDelete
                                ? 'bg-red-500/20 text-red-400'
                                : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                        title={confirmDelete ? 'Click again to confirm' : 'Delete'}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-1">
                <button
                    onClick={handleStatusCycle}
                    disabled={statusLoading}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80 ${cfg.classes}`}
                    title="Click to advance status"
                >
                    {statusLoading ? '...' : cfg.label}
                </button>
                <span className="text-xs text-gray-600">{formatDate(task.createdAt)}</span>
            </div>
        </div>
    );
}
