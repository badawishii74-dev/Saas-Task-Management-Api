import { useQuery } from '@tanstack/react-query';
import { Users, CheckSquare, Users2, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ActivityFeed from '../activity/ActivityFeed';



const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <Card className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                         flex-shrink-0 ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
        </div>
    </Card>
);

export default function AdminDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => api.get('/admin/dashboard').then(r => r.data),
    });

    if (isLoading) return <Spinner fullPage />;

    const { stats, tasksStatus, latestUsers, latestTasks } = data || {};

    return (
        <div className="flex flex-col gap-6">

            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r
                            from-rose-500 to-pink-600 p-6 shadow-lg shadow-rose-500/20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <div className="relative">
                    <h2 className="text-white text-2xl font-bold">Admin Dashboard</h2>
                    <p className="text-rose-100 mt-1">Full system overview</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.totalUsers}
                    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                />
                <StatCard
                    icon={CheckSquare}
                    label="Total Tasks"
                    value={stats?.totalTasks}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={Users2}
                    label="Total Teams"
                    value={stats?.totalTeams}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Tasks by status */}
                <Card>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        Tasks by Status
                    </h3>
                    <div className="flex flex-col gap-3">
                        {tasksStatus?.map((s) => (
                            <div key={s._id} className="flex items-center justify-between
                                                         p-3 bg-slate-700/30 rounded-xl">
                                <Badge label={s._id} />
                                <span className="text-white font-bold">{s.count}</span>
                            </div>
                        ))}
                        {!tasksStatus?.length && (
                            <p className="text-slate-500 text-sm text-center py-4">No data</p>
                        )}
                    </div>
                </Card>

                {/* Latest users */}
                <Card>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        Latest Users
                    </h3>
                    <div className="flex flex-col gap-3">
                        {latestUsers?.map((u) => (
                            <div key={u._id} className="flex items-center gap-3 p-3
                                                         bg-slate-700/30 rounded-xl">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                                from-indigo-500 to-purple-600 flex items-center
                                                justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">
                                        {u.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-white text-sm font-medium truncate">
                                        {u.name}
                                    </p>
                                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                                </div>
                                <Badge label={u.role} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Latest tasks */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Latest Tasks
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-700/50">
                                <th className="text-left pb-3 font-medium">Title</th>
                                <th className="text-left pb-3 font-medium">Type</th>
                                <th className="text-left pb-3 font-medium">Status</th>
                                <th className="text-left pb-3 font-medium">Created By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {latestTasks?.map((t) => (
                                <tr key={t._id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="py-3 pr-4 text-white font-medium">{t.title}</td>
                                    <td className="py-3 pr-4"><Badge label={t.type} /></td>
                                    <td className="py-3 pr-4"><Badge label={t.status} /></td>
                                    <td className="py-3 text-slate-400">{t.createdBy?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <ActivityFeed type="task"  limit={10} />
            </Card>
        </div>
    );
}