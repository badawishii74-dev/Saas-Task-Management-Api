import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { fetchTeams, createTeam, requestToJoin, handleInvitation } from '../api';

export default function TeamsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', type: 'public' });
    const [creating, setCreating] = useState(false);

    const load = async () => {
        try {
            const data = await fetchTeams();
            setTeams(data.teams ?? data);
        } catch (err) { addToast(err.message, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const data = await createTeam(form.name, form.description, form.type);
            setTeams((prev) => [data.team ?? data, ...prev]);
            addToast('Team created!', 'success');
            setShowCreate(false);
            setForm({ name: '', description: '', type: 'public' });
        } catch (err) { addToast(err.message, 'error'); }
        finally { setCreating(false); }
    };

    const handleJoin = async (teamId) => {
        try {
            const data = await requestToJoin(teamId);
            addToast(data.message ?? 'Request sent!', 'success');
            load();
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleInvite = async (teamId, action) => {
        try {
            const data = await handleInvitation(teamId, action);
            addToast(data.message ?? `Invitation ${action}ed!`, 'success');
            load();
        } catch (err) { addToast(err.message, 'error'); }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Teams</h1>
                        <p className="text-gray-400 text-sm mt-1">Browse and join teams, or create your own</p>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Team
                    </button>
                </div>

                {/* Create Team Form */}
                {showCreate && (
                    <form onSubmit={handleCreate}
                        className="mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 animate-fade-in">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Create Team</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="label">Team Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Frontend Team" required className="input" />
                            </div>
                            <div className="col-span-2">
                                <label className="label">Description</label>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="What does this team do?" className="input" />
                            </div>
                            <div>
                                <label className="label">Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowCreate(false)}
                                className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-all">Cancel</button>
                            <button type="submit" disabled={creating}
                                className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 disabled:opacity-60 transition-all">
                                {creating ? 'Creating…' : 'Create'}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <Spinner />
                ) : teams.length === 0 ? (
                    <EmptyState icon="👥" message="No teams found" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => {
                            const isMember = team.members?.some((m) => (m._id ?? m) === user?.id);
                            const hasInvitation = team.pendingInvitations?.some((i) => (i._id ?? i) === user?.id);

                            return (
                                <div key={team._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-semibold">{team.name}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${team.type === 'private'
                                                    ? 'bg-gray-800 text-gray-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                                    {team.type}
                                                </span>
                                            </div>
                                            {team.description && <p className="text-gray-500 text-sm mt-1">{team.description}</p>}
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {team.members?.length ?? 0} member{team.members?.length !== 1 ? 's' : ''}
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <Link to={`/teams/${team._id}`}
                                            className="flex-1 text-center py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-all">
                                            View
                                        </Link>
                                        {hasInvitation ? (
                                            <>
                                                <button onClick={() => handleInvite(team._id, 'accept')}
                                                    className="flex-1 py-2 rounded-xl bg-green-600/80 hover:bg-green-600 text-white text-sm transition-all">Accept</button>
                                                <button onClick={() => handleInvite(team._id, 'reject')}
                                                    className="flex-1 py-2 rounded-xl bg-red-600/60 hover:bg-red-600 text-white text-sm transition-all">Reject</button>
                                            </>
                                        ) : !isMember && (
                                            <button onClick={() => handleJoin(team._id)}
                                                className="flex-1 py-2 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-sm font-medium transition-all">
                                                Join
                                            </button>
                                        )}
                                        {isMember && (
                                            <span className="flex-1 text-center py-2 rounded-xl bg-green-500/10 text-green-400 text-sm">✓ Member</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
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

function EmptyState({ icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <span className="text-4xl mb-3">{icon}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}
