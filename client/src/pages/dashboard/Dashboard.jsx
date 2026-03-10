import { useQuery } from '@tanstack/react-query';
import {
    CheckSquare, Users, Clock, TrendingUp,
    AlertCircle, Activity
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, gradient, sub }) => (
    <Card className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                         flex-shrink-0 ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
            {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
        </div>
    </Card>
);

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color }) => {
    const pct = max ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 capitalize">{label}</span>
                <span className="text-slate-400">{value} <span className="text-slate-600">/ {max}</span></span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { user } = useAuth();

    // My tasks
    const { data: tasksData, isLoading: loadingTasks } = useQuery({
        queryKey: ['my-tasks'],
        queryFn: () => api.get('/tasks').then(r => r.data),
    });

    // My teams
    const { data: teamsData, isLoading: loadingTeams } = useQuery({
        queryKey: ['my-teams'],
        queryFn: () => api.get('/teams').then(r => r.data),
    });

    // Overdue tasks
    const { data: overdueData } = useQuery({
        queryKey: ['overdue-tasks'],
        queryFn: () => api.get('/tasks/overdue').then(r => r.data),
    });

    const tasks = tasksData?.tasks || [];
    const teams = teamsData || [];
    const overdue = overdueData?.tasks || [];

    // Compute status breakdown
    const statusCount = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    const total = tasks.length;
    const completed = statusCount['completed'] || 0;
    const inProgress = statusCount['in progress'] || 0;
    const pending = statusCount['pending'] || 0;

    if (loadingTasks || loadingTeams) return <Spinner fullPage />;

    return (
        <div className="flex flex-col gap-6">

            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r
                            from-indigo-500 to-purple-600 p-6 shadow-lg shadow-indigo-500/20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <div className="relative">
                    <h2 className="text-white text-2xl font-bold">
                        Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                    </h2>
                    <p className="text-indigo-100 mt-1">
                        You have <span className="font-bold text-white">{pending}</span> pending
                        and <span className="font-bold text-white">{inProgress}</span> in-progress tasks
                    </p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={CheckSquare}
                    label="Total Tasks"
                    value={total}
                    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    sub="assigned to you"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Completed"
                    value={completed}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                    sub={total ? `${Math.round((completed / total) * 100)}% completion rate` : ''}
                />
                <StatCard
                    icon={Clock}
                    label="In Progress"
                    value={inProgress}
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Overdue"
                    value={overdue.length}
                    gradient="bg-gradient-to-br from-red-500 to-rose-600"
                    sub={overdue.length > 0 ? 'needs attention' : 'all on track'}
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Task progress */}
                <Card className="xl:col-span-2">
                    <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        Task Progress
                    </h3>
                    <div className="flex flex-col gap-4">
                        <ProgressBar label="completed" value={completed} max={total} color="bg-green-500" />
                        <ProgressBar label="in progress" value={inProgress} max={total} color="bg-blue-500" />
                        <ProgressBar label="pending" value={pending} max={total} color="bg-yellow-500" />
                    </div>

                    {total === 0 && (
                        <p className="text-slate-500 text-sm text-center py-6">
                            No tasks assigned yet
                        </p>
                    )}
                </Card>

                {/* Teams */}
                <Card>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        My Teams
                    </h3>
                    <div className="flex flex-col gap-3">
                        {teams.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-6">
                                Not in any teams yet
                            </p>
                        ) : (
                            teams.slice(0, 5).map((team) => (
                                <div key={team._id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30
                                                hover:bg-slate-700/50 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br
                                                    from-purple-500 to-indigo-600 flex items-center
                                                    justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">
                                            {team.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-white text-sm font-medium truncate">
                                            {team.name}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            {team.members?.length} members
                                        </p>
                                    </div>
                                    <Badge label={team.type} />
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent tasks */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Recent Tasks
                </h3>
                {tasks.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No tasks yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700/50">
                                    <th className="text-left pb-3 font-medium">Task</th>
                                    <th className="text-left pb-3 font-medium">Type</th>
                                    <th className="text-left pb-3 font-medium">Priority</th>
                                    <th className="text-left pb-3 font-medium">Status</th>
                                    <th className="text-left pb-3 font-medium">Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {tasks.slice(0, 8).map((task) => (
                                    <tr key={task._id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="py-3 pr-4">
                                            <p className="text-white font-medium truncate max-w-48">
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-slate-500 text-xs truncate max-w-48">
                                                    {task.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4"><Badge label={task.type} /></td>
                                        <td className="py-3 pr-4"><Badge label={task.priority} /></td>
                                        <td className="py-3 pr-4"><Badge label={task.status} /></td>
                                        <td className="py-3 text-slate-400">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Overdue alert */}
            {overdue.length > 0 && (
                <Card className="border-red-500/20 bg-red-500/5">
                    <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Overdue Tasks ({overdue.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {overdue.map((task) => (
                            <div key={task._id}
                                className="flex items-center justify-between p-3
                                            bg-red-500/10 rounded-xl">
                                <span className="text-white text-sm">{task.title}</span>
                                <span className="text-red-400 text-xs">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

// Helper
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
}