import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, UserPlus, UserMinus, Crown,
    Check, X, Users, Clock, Globe, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import UserSearchInput from '../../components/ui/UserSearchInput';

export default function TeamDetail() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // ── Fetch team details ────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ['team-detail', teamId],
        queryFn: () => api.get(`/teams/${teamId}`).then(r => r.data),
    });

    const team = data?.team;
    const isLeader = team?.leader?._id === user?.id;
    const isMember = team?.members?.some((m) => m._id === user?.id);

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['team-detail', teamId] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
    };

    // ── Add member directly ───────────────────────────────────────────────
    const { mutate: addMember, isPending: adding } = useMutation({
        mutationFn: () => api.post(`/teams/${teamId}/members`, { userId: selectedUser._id }),
        onSuccess: () => {
            toast.success('Member added!');
            setAddMemberOpen(false);
            setSelectedUser(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to add member'),
    });

    // ── Remove member ─────────────────────────────────────────────────────
    const { mutate: removeMember } = useMutation({
        mutationFn: (userId) => api.delete(`/teams/${teamId}/members/${userId}`),
        onSuccess: () => {
            toast.success('Member removed');
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
    });

    // ── Handle join requests (accept / reject) ────────────────────────────
    const { mutate: handleJoinRequest, isPending: handlingRequest } = useMutation({
        mutationFn: ({ userId, action }) =>
            api.post(`/teams/${teamId}/join-request`, { userId, action }),
        onSuccess: (_, vars) => {
            toast.success(vars.action === 'accept' ? 'Request accepted!' : 'Request rejected');
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    });

    // ── Leave team ────────────────────────────────────────────────────────
    const { mutate: leaveTeam, isPending: leaving } = useMutation({
        mutationFn: () => api.post(`/teams/${teamId}/leave`),
        onSuccess: () => {
            toast.success('Left team successfully');
            navigate('/teams');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to leave'),
    });

    if (isLoading) return <Spinner fullPage />;
    if (!team) return (
        <div className="text-center py-20 text-slate-500">
            <p>Team not found</p>
            <Button onClick={() => navigate('/teams')} className="mt-4">
                Back to Teams
            </Button>
        </div>
    );

    const joinRequests = team.joinRequests || [];

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">

            {/* Back */}
            <Button variant="ghost" onClick={() => navigate('/teams')} className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
            </Button>

            {/* Team header card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r
                            from-purple-500 to-indigo-600 p-6 shadow-lg shadow-purple-500/20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
                <div className="relative flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur
                                        flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-2xl font-bold">
                                {team.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-white text-2xl font-bold">{team.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                {team.type === 'private'
                                    ? <Lock className="w-3.5 h-3.5 text-purple-200" />
                                    : <Globe className="w-3.5 h-3.5 text-purple-200" />}
                                <span className="text-purple-100 text-sm capitalize">
                                    {team.type} team
                                </span>
                                <span className="text-purple-300">·</span>
                                <Users className="w-3.5 h-3.5 text-purple-200" />
                                <span className="text-purple-100 text-sm">
                                    {team.members?.length} members
                                </span>
                            </div>
                            {team.description && (
                                <p className="text-purple-100 text-sm mt-1">{team.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {isLeader && (
                            <Button
                                onClick={() => setAddMemberOpen(true)}
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                            >
                                <UserPlus className="w-4 h-4 mr-1" /> Add Member
                            </Button>
                        )}
                        {isMember && !isLeader && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (confirm('Are you sure you want to leave this team?'))
                                        leaveTeam();
                                }}
                                loading={leaving}
                                className="bg-red-500/30 hover:bg-red-500/50 border-0"
                            >
                                Leave Team
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Join requests — only visible to leader */}
            {isLeader && joinRequests.length > 0 && (
                <Card>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Pending Join Requests
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20
                                         text-orange-400 border border-orange-500/20">
                            {joinRequests.length}
                        </span>
                    </h3>
                    <div className="flex flex-col gap-3">
                        {joinRequests.map((req) => {
                            // req may be a populated object or just an ID string
                            const reqId = req?._id || req;
                            const reqName = req?.name || 'Unknown User';
                            const reqEmail = req?.email || '';
                            return (
                                <div key={reqId}
                                    className="flex items-center justify-between p-3
                                                bg-slate-700/30 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                                        from-orange-500 to-amber-500 flex items-center
                                                        justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {reqName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {reqName}
                                            </p>
                                            {reqEmail && (
                                                <p className="text-slate-400 text-xs">{reqEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleJoinRequest({
                                                userId: reqId, action: 'accept'
                                            })}
                                            disabled={handlingRequest}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                                       bg-green-500/20 text-green-400 hover:bg-green-500/30
                                                       transition-all text-xs font-medium"
                                        >
                                            <Check className="w-3 h-3" /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleJoinRequest({
                                                userId: reqId, action: 'reject'
                                            })}
                                            disabled={handlingRequest}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                                       bg-red-500/20 text-red-400 hover:bg-red-500/30
                                                       transition-all text-xs font-medium"
                                        >
                                            <X className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Members list */}
            <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Members ({team.members?.length})
                </h3>
                <div className="flex flex-col gap-3">
                    {team.members?.map((member) => {
                        const memberId = member._id;
                        const isThisLeader = team.leader?._id === memberId;
                        const isMe = memberId === user?.id;

                        return (
                            <div key={memberId}
                                className="flex items-center justify-between p-3
                                            bg-slate-700/30 rounded-xl hover:bg-slate-700/50
                                            transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br
                                                        from-indigo-500 to-purple-600 flex items-center
                                                        justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {member.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {isThisLeader && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4
                                                            rounded-full bg-yellow-500 flex items-center
                                                            justify-center">
                                                <Crown className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium flex items-center gap-2">
                                            {member.name}
                                            {isMe && (
                                                <span className="text-xs text-indigo-400">(you)</span>
                                            )}
                                        </p>
                                        <p className="text-slate-400 text-xs">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isThisLeader ? (
                                        <span className="flex items-center gap-1 text-xs
                                                         text-yellow-400 bg-yellow-500/10
                                                         border border-yellow-500/20 px-2 py-1 rounded-lg">
                                            <Crown className="w-3 h-3" /> Leader
                                        </span>
                                    ) : (
                                        <Badge label="member" />
                                    )}

                                    {/* Leader can remove non-leader members */}
                                    {isLeader && !isThisLeader && (
                                        <button
                                            onClick={() => {
                                                if (confirm(`Remove ${member.name} from team?`))
                                                    removeMember(memberId);
                                            }}
                                            className="p-1.5 rounded-lg text-slate-400
                                                       hover:text-red-400 hover:bg-red-500/10
                                                       transition-all"
                                            title="Remove member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Add Member Modal */}
            <Modal
                open={addMemberOpen}
                onClose={() => { setAddMemberOpen(false); setSelectedUser(null); }}
                title="Add Member"
            >
                <p className="text-slate-400 text-sm">
                    Search and select a user to add them directly to the team.
                </p>

                <UserSearchInput
                    onSelect={setSelectedUser}
                    placeholder="Search by name or email..."
                />

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={() => { setAddMemberOpen(false); setSelectedUser(null); }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!selectedUser) return toast.error('Please select a user');
                            addMember();
                        }}
                        loading={adding}
                        disabled={!selectedUser}
                        className="flex-1"
                    >
                        Add Member
                    </Button>
                </div>
            </Modal>
        </div>
    );
}