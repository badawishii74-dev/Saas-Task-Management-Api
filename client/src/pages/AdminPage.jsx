import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import {
    fetchDashboardStats, fetchAllUsers, fetchAllTeamsAdmin,
    updateUserInfo, updateTaskAdmin, updateTeamAdmin,
    deleteUserAdmin, deleteTaskAdmin, deleteTeamAdmin,
    fetchPersonalTasksAdmin, fetchAllTeamTasksAdmin,
} from '../api';

const TABS = ['Overview', 'Users', 'Teams', 'Tasks'];

export default function AdminPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [tab, setTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (tab === 'Overview') {
                    const data = await fetchDashboardStats();
                    setStats(data);
                } else if (tab === 'Users') {
                    const data = await fetchAllUsers();
                    setUsers(data.users ?? data);
                } else if (tab === 'Teams') {
                    const data = await fetchAllTeamsAdmin();
                    setTeams(data.teams ?? data);
                } else if (tab === 'Tasks') {
                    const [personal, team] = await Promise.all([
                        fetchPersonalTasksAdmin(),
                        fetchAllTeamTasksAdmin(),
                    ]);
                    setTasks([...(personal.tasks ?? personal), ...(team.tasks ?? team)]);
                }
            } catch (err) { addToast(err.message, 'error'); }
            finally { setLoading(false); }
        };
        load();
    }, [tab]);

    const deleteUser = async (id) => {
        try { await deleteUserAdmin(id); setUsers((p) => p.filter((u) => u._id !== id)); addToast('User deleted', 'success'); }
        catch (err) { addToast(err.message, 'error'); }
    };
    const deleteTeam = async (id) => {
        try { await deleteTeamAdmin(id); setTeams((p) => p.filter((t) => t._id !== id)); addToast('Team deleted', 'success'); }
        catch (err) { addToast(err.message, 'error'); }
    };
    const deleteTask = async (id) => {
        try { await deleteTaskAdmin(id); setTasks((p) => p.filter((t) => t._id !== id)); addToast('Task deleted', 'success'); }
        catch (err) { addToast(err.message, 'error'); }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

                {/* Tab bar */}
                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6 w-fit">
                    {TABS.map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
                                ${tab === t ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? <Spinner /> : (
                    <>
                        {/* ── OVERVIEW ── */}
                        {tab === 'Overview' && stats && (
                            <div className="space-y-6">
                                {/* Stat cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <StatCard label="Total Users" value={stats.stats?.totalUsers ?? 0} icon="👤" color="violet" />
                                    <StatCard label="Total Tasks" value={stats.stats?.totalTasks ?? 0} icon="✅" color="indigo" />
                                    <StatCard label="Total Teams" value={stats.stats?.totalTeams ?? 0} icon="👥" color="purple" />
                                </div>

                                {/* Task status breakdown */}
                                {stats.tasksStatus && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tasks By Status</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {stats.tasksStatus.map((s) => (
                                                <div key={s._id} className="px-4 py-2 rounded-xl bg-gray-800/60 flex items-center gap-2">
                                                    <span className="text-sm text-gray-300 capitalize">{s._id}</span>
                                                    <span className="text-lg font-bold text-white">{s.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Latest users */}
                                {stats.latestUsers?.length > 0 && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Latest Users</h3>
                                        <div className="space-y-2">
                                            {stats.latestUsers.map((u) => (
                                                <div key={u._id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {u.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-white">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                    <span className="ml-auto text-xs text-gray-600 capitalize">{u.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── USERS ── */}
                        {tab === 'Users' && (
                            <AdminTable
                                headers={['Name', 'Email', 'Role', 'Verified', 'Actions']}
                                rows={users}
                                renderRow={(u) => (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-200">{u.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                                                ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-400' : 'bg-gray-800 text-gray-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{u.isVerified ? '✅' : '❌'}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => deleteUser(u._id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                                        </td>
                                    </>
                                )}
                            />
                        )}

                        {/* ── TEAMS ── */}
                        {tab === 'Teams' && (
                            <AdminTable
                                headers={['Name', 'Type', 'Members', 'Actions']}
                                rows={teams}
                                renderRow={(t) => (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-200">{t.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 capitalize">{t.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{t.members?.length ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => deleteTeam(t._id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                                        </td>
                                    </>
                                )}
                            />
                        )}

                        {/* ── TASKS ── */}
                        {tab === 'Tasks' && (
                            <AdminTable
                                headers={['Title', 'Status', 'Priority', 'Type', 'Actions']}
                                rows={tasks}
                                renderRow={(t) => (
                                    <>
                                        <td className="px-4 py-3 text-sm text-gray-200 max-w-xs truncate">{t.title}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={t.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <PriorityBadge priority={t.priority} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400 capitalize">{t.type}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => deleteTask(t._id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                                        </td>
                                    </>
                                )}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = { violet: 'from-violet-500/20', indigo: 'from-indigo-500/20', purple: 'from-purple-500/20' };
    return (
        <div className={`bg-gradient-to-br ${colors[color] ?? ''} to-transparent bg-gray-900 border border-gray-800 rounded-2xl p-5`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400 mt-1">{label}</div>
        </div>
    );
}

function AdminTable({ headers, rows, renderRow }) {
    if (!rows.length) return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p className="text-sm">No data found</p>
        </div>
    );
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            {headers.map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row._id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                                {renderRow(row)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const colors = {
        pending: 'bg-gray-800 text-gray-400',
        'in progress': 'bg-blue-500/20 text-blue-400',
        completed: 'bg-green-500/20 text-green-400',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors[status] ?? 'bg-gray-800 text-gray-400'}`}>
            {status}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const colors = {
        low: 'bg-green-500/20 text-green-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors[priority] ?? 'bg-gray-800 text-gray-400'}`}>
            {priority ?? '—'}
        </span>
    );
}

function Spinner() {
    return (
        <div className="flex justify-center items-center h-48">
            <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    );
}
