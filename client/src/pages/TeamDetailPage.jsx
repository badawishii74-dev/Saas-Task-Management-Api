import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import {
    fetchTeamById, fetchTeamMembers, handleJoinRequest,
    inviteUser, removeMember, leaveTeam,
} from '../api';

export default function TeamDetailPage() {
    const { teamId } = useParams();
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteId, setInviteId] = useState('');

    const isLeader = team?.leader === user?.id || team?.leader?._id === user?.id;
    const isAdmin = user?.role === 'admin';

    const load = async () => {
        try {
            const [teamData, membersData] = await Promise.all([
                fetchTeamById(teamId),
                fetchTeamMembers(teamId).catch(() => ({ members: [] })),
            ]);
            setTeam(teamData.team ?? teamData);
            setMembers(membersData.members ?? membersData);
        } catch (err) { addToast(err.message, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [teamId]);

    const handleJoinReq = async (userId, action) => {
        try {
            await handleJoinRequest(teamId, userId, action);
            addToast(`Request ${action}ed`, 'success');
            load();
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteId.trim()) return;
        try {
            await inviteUser(teamId, inviteId.trim());
            addToast('User invited!', 'success');
            setInviteId('');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleRemove = async (memberId) => {
        try {
            await removeMember(teamId, memberId);
            addToast('Member removed', 'success');
            load();
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleLeave = async () => {
        try {
            await leaveTeam(teamId);
            addToast('You left the team', 'success');
            navigate('/teams');
        } catch (err) { addToast(err.message, 'error'); }
    };

    if (loading) return <div className="min-h-screen bg-gray-950"><Navbar user={user} /><Spinner /></div>;
    if (!team) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Team not found</div>;

    const joinRequests = team.joinRequests ?? [];

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.type === 'private'
                                ? 'bg-gray-800 text-gray-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                {team.type}
                            </span>
                        </div>
                        {team.description && <p className="text-gray-400 text-sm mt-1">{team.description}</p>}
                    </div>
                    <button onClick={handleLeave}
                        className="px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all">
                        Leave Team
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Members list */}
                    <div className="lg:col-span-2 space-y-4">
                        <SectionCard title={`Members (${members.length})`}>
                            {members.length === 0 ? (
                                <p className="text-gray-500 text-sm">No members yet.</p>
                            ) : members.map((m) => (
                                <div key={m._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                            {m.name?.[0]?.toUpperCase() ?? 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.email}</p>
                                        </div>
                                    </div>
                                    {(isLeader || isAdmin) && m._id !== user?.id && (
                                        <button onClick={() => handleRemove(m._id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                                    )}
                                </div>
                            ))}
                        </SectionCard>

                        {/* Join requests — leader only */}
                        {(isLeader || isAdmin) && joinRequests.length > 0 && (
                            <SectionCard title={`Join Requests (${joinRequests.length})`}>
                                {joinRequests.map((req) => {
                                    const u = req.user ?? req;
                                    return (
                                        <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                            <span className="text-sm text-gray-300">{u.name ?? u}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleJoinReq(u._id, 'accept')}
                                                    className="px-3 py-1 text-xs bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-all">Accept</button>
                                                <button onClick={() => handleJoinReq(u._id, 'reject')}
                                                    className="px-3 py-1 text-xs bg-red-600/60 hover:bg-red-600 text-white rounded-lg transition-all">Reject</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </SectionCard>
                        )}
                    </div>

                    {/* Sidebar: Invite + Info */}
                    <div className="space-y-4">
                        <SectionCard title="Team Info">
                            <InfoRow label="Leader" value={team.leader?.name ?? team.leader ?? '—'} />
                            <InfoRow label="Type" value={team.type} />
                            <InfoRow label="Members" value={members.length} />
                        </SectionCard>

                        {(isLeader || isAdmin) && (
                            <SectionCard title="Invite User">
                                <form onSubmit={handleInvite} className="space-y-2">
                                    <input value={inviteId} onChange={(e) => setInviteId(e.target.value)}
                                        placeholder="User ID to invite" className="input text-sm" />
                                    <button type="submit"
                                        className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all">
                                        Send Invite
                                    </button>
                                </form>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
            {children}
        </div>
    );
}
function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-300 capitalize">{String(value)}</span>
        </div>
    );
}
function Spinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    );
}
