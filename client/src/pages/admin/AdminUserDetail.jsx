import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckSquare, User } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminUserDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { data: assignedData, isLoading: l1 } = useQuery({
        queryKey: ['user-assigned-tasks', userId],
        queryFn: () => api.get(`/admin/users/${userId}/tasks`).then(r => r.data),
    });

    const { data: createdData, isLoading: l2 } = useQuery({
        queryKey: ['user-created-tasks', userId],
        queryFn: () => api.get(`/admin/users/${userId}/created-tasks`).then(r => r.data),
    });

    const { data: usersData } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(r => r.data),
    });

    const user = usersData?.users?.find((u) => u._id === userId);
    const assignedTasks = assignedData?.tasks || [];
    const createdTasks = createdData?.tasks || [];

    if (l1 || l2) return <Spinner fullPage />;

    const TaskTable = ({ tasks, emptyMsg }) => (
        tasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">{emptyMsg}</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-700/50">
                            <th className="text-left pb-3 font-medium">Title</th>
                            <th className="text-left pb-3 font-medium">Type</th>
                            <th className="text-left pb-3 font-medium">Priority</th>
                            <th className="text-left pb-3 font-medium">Status</th>
                            <th className="text-left pb-3 font-medium">Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {tasks.map((t) => (
                            <tr key={t._id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="py-3 pr-4">
                                    <p className="text-white font-medium truncate max-w-48">
                                        {t.title}
                                    </p>
                                </td>
                                <td className="py-3 pr-4"><Badge label={t.type} /></td>
                                <td className="py-3 pr-4"><Badge label={t.priority} /></td>
                                <td className="py-3 pr-4"><Badge label={t.status} /></td>
                                <td className="py-3 text-slate-400">
                                    {t.dueDate
                                        ? new Date(t.dueDate).toLocaleDateString()
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/admin/users')}
                className="w-fit"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
            </Button>

            {/* User info card */}
            <Card className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500
                                to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>
                <div>
                    <h2 className="text-white text-xl font-bold">{user?.name || 'User'}</h2>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge label={user?.role || 'user'} />
                        <span className={`text-xs px-2 py-0.5 rounded-full
                                          ${user?.isVerified
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'}`}>
                            {user?.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-6 text-center">
                    <div>
                        <p className="text-white text-2xl font-bold">{assignedTasks.length}</p>
                        <p className="text-slate-400 text-xs">Assigned</p>
                    </div>
                    <div>
                        <p className="text-white text-2xl font-bold">{createdTasks.length}</p>
                        <p className="text-slate-400 text-xs">Created</p>
                    </div>
                </div>
            </Card>

            {/* Assigned tasks */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Assigned Tasks
                    <span className="text-slate-500 font-normal text-sm">
                        ({assignedTasks.length})
                    </span>
                </h3>
                <TaskTable tasks={assignedTasks} emptyMsg="No tasks assigned to this user" />
            </Card>

            {/* Created tasks */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Created Tasks
                    <span className="text-slate-500 font-normal text-sm">
                        ({createdTasks.length})
                    </span>
                </h3>
                <TaskTable tasks={createdTasks} emptyMsg="No tasks created by this user" />
            </Card>
        </div>
    );
}