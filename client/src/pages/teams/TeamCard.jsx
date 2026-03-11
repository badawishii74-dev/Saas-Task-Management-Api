import { Users, Lock, Globe, Crown, LogOut, UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function TeamCard({ team, onInvite }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const isLeader = team.leader?._id === user?.id;
    const isMember = team.members?.some((m) => m._id === user?.id);
    const hasRequested = team.joinRequests?.some((r) => r === user?.id || r?._id === user?.id);

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['teams'] });

    const { mutate: join, isPending: joining } = useMutation({
        mutationFn: () => api.post(`/teams/${team._id}/request-to-join`),
        onSuccess: (res) => {
            toast.success(res.data.message);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    });

    const { mutate: leave, isPending: leaving } = useMutation({
        mutationFn: () => api.post(`/teams/${team._id}/leave`),
        onSuccess: () => {
            toast.success('Left team successfully');
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    });

    return (
        <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5
                        hover:border-purple-500/30 hover:bg-slate-800/80
                        transition-all duration-200 flex flex-col gap-4">

            {/* Header */}
             <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => navigate(`/teams/${team._id}`)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500
                                    to-indigo-600 flex items-center justify-center flex-shrink-0
                                    shadow-lg shadow-purple-500/20">
                        <span className="text-white text-lg font-bold">
                            {team.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{team.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {team.type === 'private'
                                ? <Lock className="w-3 h-3 text-slate-400" />
                                : <Globe className="w-3 h-3 text-slate-400" />}
                            <span className="text-slate-400 text-xs capitalize">{team.type}</span>
                        </div>
                    </div>
                </div>

                {isLeader && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400
                                     bg-yellow-500/10 border border-yellow-500/20
                                     px-2 py-1 rounded-lg">
                        <Crown className="w-3 h-3" /> Leader
                    </span>
                )}
            </div>

            {/* Description */}
            {team.description && (
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {team.description}
                </p>
            )}

            {/* Members avatars */}
            <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {team.members?.slice(0, 5).map((member, i) => (
                        <div
                            key={member._id || i}
                            title={member.name}
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500
                                       to-purple-600 border-2 border-slate-800 flex items-center
                                       justify-center flex-shrink-0"
                        >
                            <span className="text-white text-xs font-bold">
                                {member.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    ))}
                    {team.members?.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-slate-700 border-2
                                        border-slate-800 flex items-center justify-center">
                            <span className="text-slate-300 text-xs">
                                +{team.members.length - 5}
                            </span>
                        </div>
                    )}
                </div>
                <span className="text-slate-500 text-xs">
                    {team.members?.length} member{team.members?.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Leader info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1
                            border-t border-slate-700/50">
                <Users className="w-3 h-3" />
                <span>Led by <span className="text-slate-300">{team.leader?.name}</span></span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isLeader && (
                    <Button
                        variant="secondary"
                        onClick={() => onInvite(team)}
                        className="flex-1 text-sm py-2"
                    >
                        <UserPlus className="w-4 h-4 mr-1" /> Invite
                    </Button>
                )}

                {!isMember && !isLeader && (
                    <Button
                        onClick={() => join()}
                        loading={joining}
                        disabled={hasRequested}
                        className="flex-1 text-sm py-2"
                    >
                        {hasRequested ? 'Requested' : 'Join Team'}
                    </Button>
                )}

                {isMember && !isLeader && (
                    <Button
                        variant="danger"
                        onClick={() => { if (confirm('Leave this team?')) leave(); }}
                        loading={leaving}
                        className="flex-1 text-sm py-2"
                    >
                        <LogOut className="w-4 h-4 mr-1" /> Leave
                    </Button>
                )}
            </div>
        </div>
    );
}