import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// ── Create Team Modal ──────────────────────────────────────────────────────
export function CreateTeamModal({ open, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: '', description: '', type: 'public' });

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => api.post('/teams', data),
        onSuccess: () => {
            toast.success('Team created!');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            onClose();
            setForm({ name: '', description: '', type: 'public' });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create team'),
    });

    const selectClass = `w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                         text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition-all duration-200`;

    return (
        <Modal open={open} onClose={onClose} title="Create Team">
            <Input
                label="Team Name"
                placeholder="e.g. Frontend Team"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                    rows={3}
                    placeholder="What does this team work on?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${selectClass} resize-none`}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Type</label>
                <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={selectClass}
                >
                    <option value="public">Public — anyone can join</option>
                    <option value="private">Private — requires approval</option>
                </select>
            </div>
            <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                    onClick={() => { if (!form.name) return toast.error('Name is required'); mutate(form); }}
                    loading={isPending}
                    className="flex-1"
                >
                    Create Team
                </Button>
            </div>
        </Modal>
    );
}

// ── Invite User Modal ──────────────────────────────────────────────────────
export function InviteModal({ open, onClose, team }) {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');

    // Search user by email — in real app you'd have a search endpoint
    // For now we'll let the leader paste the userId directly
    const { mutate, isPending } = useMutation({
        mutationFn: (data) => api.post(`/teams/${team?._id}/invite`, data),
        onSuccess: () => {
            toast.success('Invitation sent!');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            onClose();
            setUserId('');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to invite'),
    });

    return (
        <Modal open={open} onClose={onClose} title={`Invite to ${team?.name}`}>
            <p className="text-slate-400 text-sm">
                Paste the user's ID to send them an invitation.
            </p>
            <Input
                label="User ID"
                placeholder="64a1b2c3d4e5f6a7b8c9d0e1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                    onClick={() => { if (!userId) return toast.error('User ID is required'); mutate({ userId }); }}
                    loading={isPending}
                    className="flex-1"
                >
                    Send Invite
                </Button>
            </div>
        </Modal>
    );
}

// ── Handle Invitation Modal ────────────────────────────────────────────────
export function PendingInvitationsModal({ open, onClose, teams }) {
    const queryClient = useQueryClient();

    const pendingTeams = teams?.filter((t) =>
        t.invitations?.some((inv) => typeof inv === 'string' || inv?._id)
    ) || [];

    const { mutate, isPending } = useMutation({
        mutationFn: ({ teamId, action }) =>
            api.post(`/teams/${teamId}/invitations`, { action }),
        onSuccess: (_, vars) => {
            toast.success(vars.action === 'accept' ? 'Joined team!' : 'Invitation declined');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    });

    return (
        <Modal open={open} onClose={onClose} title="Pending Invitations">
            {pendingTeams.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                    No pending invitations
                </p>
            ) : (
                pendingTeams.map((team) => (
                    <div key={team._id}
                        className="flex items-center justify-between p-4 bg-slate-700/30
                                    rounded-xl">
                        <div>
                            <p className="text-white font-medium">{team.name}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Led by {team.leader?.name}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => mutate({ teamId: team._id, action: 'accept' })}
                                loading={isPending}
                                className="text-xs py-1.5 px-3"
                            >
                                Accept
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => mutate({ teamId: team._id, action: 'reject' })}
                                loading={isPending}
                                className="text-xs py-1.5 px-3"
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </Modal>
    );
}