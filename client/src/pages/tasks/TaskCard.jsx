import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';

export default function TaskCard({ task, onEdit }) {
    const queryClient = useQueryClient();

    const { mutate: deleteTask } = useMutation({
        mutationFn: () => api.delete(`/tasks/${task._id}`),
        onSuccess: () => {
            toast.success('Task deleted');
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: (status) => api.put(`/tasks/${task._id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
    });

    const nextStatus = {
        'pending': 'in progress',
        'in progress': 'completed',
        'completed': 'pending',
    };

    return (
        <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5
                        hover:border-indigo-500/30 hover:bg-slate-800/80
                        transition-all duration-200 flex flex-col gap-3">

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-medium leading-snug flex-1">{task.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400
                                   hover:bg-indigo-500/10 transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this task?')) deleteTask();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400
                                   hover:bg-red-500/10 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
                <Badge label={task.type} />
                <Badge label={task.priority} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    {task.createdBy && (
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.createdBy?.name || 'You'}
                        </span>
                    )}
                </div>

                {/* Status toggle button */}
                <button
                    onClick={() => updateStatus(nextStatus[task.status])}
                    className="text-xs px-3 py-1 rounded-lg transition-all duration-200
                               bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
                >
                    <Badge label={task.status} />
                </button>
            </div>
        </div>
    );
}