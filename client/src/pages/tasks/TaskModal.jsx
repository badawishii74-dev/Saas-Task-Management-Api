import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TaskComments from './TaskComments';

export default function TaskModal({ open, onClose, task }) {
    const queryClient = useQueryClient();
    const isEdit = !!task;

    const [form, setForm] = useState({
        title: '', description: '', type: 'personal',
        priority: 'medium', dueDate: '', teamId: '', assignedTo: '',
    });

    // Populate form when editing
    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description: task.description || '',
                type: task.type || 'personal',
                priority: task.priority || 'medium',
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toISOString().split('T')[0]
                    : '',
                teamId: task.team?._id || '',
                assignedTo: task.assignedTo?._id || '',
            });
        } else {
            setForm({
                title: '', description: '', type: 'personal',
                priority: 'medium', dueDate: '', teamId: '', assignedTo: '',
            });
        }
    }, [task, open]);

    // Fetch teams for dropdown
    const { data: teams } = useQuery({
        queryKey: ['my-teams'],
        queryFn: () => api.get('/teams').then(r => r.data),
        enabled: open,
    });

    // Fetch team members when a team is selected
    const { data: membersData } = useQuery({
        queryKey: ['team-members', form.teamId],
        queryFn: () => api.get(`/teams/${form.teamId}/members`).then(r => r.data),
        enabled: !!form.teamId && form.type === 'team',
    });

    const members = membersData?.members || [];

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => isEdit
            ? api.put(`/tasks/${task._id}`, data)
            : api.post('/tasks', data),
        onSuccess: () => {
            toast.success(isEdit ? 'Task updated!' : 'Task created!');
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
    });

    const handleSubmit = () => {
        if (!form.title) return toast.error('Title is required');
        if (form.type === 'team' && !form.teamId) return toast.error('Please select a team');
        mutate(form);
    };

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                         text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition-all duration-200`;

    return (
        <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'}>
            <Input
                label="Title"
                placeholder="Task title"
                value={form.title}
                onChange={set('title')}
            />
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                    rows={3}
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={set('description')}
                    className={`${selectClass} resize-none`}
                />
            </div>

            {/* Type + Priority row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Type</label>
                    <select value={form.type} onChange={set('type')} className={selectClass}>
                        <option value="personal">Personal</option>
                        <option value="team">Team</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Priority</label>
                    <select value={form.priority} onChange={set('priority')} className={selectClass}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            {/* Due date */}
            <Input
                label="Due Date (optional)"
                type="date"
                value={form.dueDate}
                onChange={set('dueDate')}
            />

            {/* Team selector — only if type is team */}
            {form.type === 'team' && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Team</label>
                        <select value={form.teamId} onChange={set('teamId')} className={selectClass}>
                            <option value="">Select a team</option>
                            {(teams || []).map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {form.teamId && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300">Assign To</label>
                            <select value={form.assignedTo} onChange={set('assignedTo')} className={selectClass}>
                                <option value="">Select a member</option>
                                {members.map((m) => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} loading={isPending} className="flex-1">
                    {isEdit ? 'Save Changes' : 'Create Task'}
                </Button>
            </div>

            {isEdit && (
                <div className="border-t border-slate-700/50 pt-4 mt-2">
                    <TaskComments taskId={task._id} />
                </div>
            )}
        </Modal>
    );
}