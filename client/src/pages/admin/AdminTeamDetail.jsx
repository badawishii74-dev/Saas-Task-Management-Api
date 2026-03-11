import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckSquare, Users } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminTeamDetail() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const { data: teamData, isLoading: l1 } = useQuery({
        queryKey: ['admin-team-detail', teamId],
        queryFn: () => api.get(`/admin/teams`).then(r =>
            r.data.teams?.find((t) => t._id === teamId)
        ),
    });

    const { data: tasksData, isLoading: l2 } = useQuery({
        queryKey: ['team-tasks', teamId],
        queryFn: () => api.get(`/admin/teams/${teamId}/tasks`).then(r => r.data),
    });

    const team = teamData;
    const tasks = tasksData?.tasks || [];

    if (l1 || l2) return <Spinner fullPage />;

    // Stats
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;

    return (
        <div className="flex flex-col gap-6">
            {/* Back */}
            <Button
                variant="ghost"
                onClick={() => navigate('/admin/teams')}
                className="w-fit"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
            </Button>

            {/* Team info */}
            <Card className="flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500
                                to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl font-bold">
                        {team?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>
                <div className="flex-1">
                    <h2 className="text-white text-xl font-bold">{team?.name}</h2>
                    {team?.description && (
                        <p className="text-slate-400 text-sm mt-0.5">{team.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <Badge label={team?.type} />
                        <span className="text-slate-400 text-xs">
                            Led by <span className="text-slate-300">{team?.leader?.name}</span>
                        </span>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="flex gap-6 text-center">
                    <div>
                        <p className="text-white text-2xl font-bold">{team?.members?.length}</p>
                        <p className="text-slate-400 text-xs">Members</p>
                    </div>
                    <div>
                        <p className="text-white text-2xl font-bold">{tasks.length}</p>
                        <p className="text-slate-400 text-xs">Tasks</p>
                    </div>
                    <div>
                        <p className="text-green-400 text-2xl font-bold">{completed}</p>
                        <p className="text-slate-400 text-xs">Done</p>
                    </div>
                </div>
            </Card>

            {/* Members */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Members ({team?.members?.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {team?.members?.map((m) => (
                        <div
                            key={m._id}
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl
                                       hover:bg-slate-700/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/users/${m._id}`)}
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500
                                            to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">
                                    {m.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{m.name}</p>
                                <p className="text-slate-400 text-xs">{m.email}</p>
                            </div>
                            {team.leader?._id === m._id && (
                                <span className="ml-auto text-xs text-yellow-400
                                                 bg-yellow-500/10 px-2 py-0.5 rounded-lg">
                                    Leader
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Status summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Pending', value: pending, color: 'from-yellow-500 to-orange-500' },
                    { label: 'In Progress', value: inProgress, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Completed', value: completed, color: 'from-green-500 to-emerald-500' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color}
                                         flex items-center justify-center flex-shrink-0`}>
                            <CheckSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className="text-white text-xl font-bold">{value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tasks table */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Team Tasks ({tasks.length})
                </h3>
                {tasks.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">
                        No tasks for this team yet
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700/50">
                                    <th className="text-left pb-3 font-medium">Title</th>
                                    <th className="text-left pb-3 font-medium">Priority</th>
                                    <th className="text-left pb-3 font-medium">Status</th>
                                    <th className="text-left pb-3 font-medium">Assigned To</th>
                                    <th className="text-left pb-3 font-medium">Created By</th>
                                    <th className="text-left pb-3 font-medium">Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {tasks.map((t) => (
                                    <tr key={t._id}
                                        className="hover:bg-slate-700/20 transition-colors">
                                        <td className="py-3 pr-4">
                                            <p className="text-white font-medium truncate max-w-48">
                                                {t.title}
                                            </p>
                                        </td>
                                        <td className="py-3 pr-4"><Badge label={t.priority} /></td>
                                        <td className="py-3 pr-4"><Badge label={t.status} /></td>
                                        <td className="py-3 pr-4 text-slate-400">
                                            {t.assignedTo?.name || '—'}
                                        </td>
                                        <td className="py-3 pr-4 text-slate-400">
                                            {t.createdBy?.name || '—'}
                                        </td>
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
                )}
            </Card>
        </div>
    );
}