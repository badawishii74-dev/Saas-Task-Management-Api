import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Mail } from 'lucide-react';
import api from '../../api/axios';
import TeamCard from './TeamCard';
import { CreateTeamModal, InviteModal, PendingInvitationsModal } from './TeamModal';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const TYPE_FILTERS = ['all', 'public', 'private'];

export default function Teams() {
    const { user } = useAuth();

    const [createOpen, setCreateOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [invitationsOpen, setInvitationsOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data: teams, isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: () => api.get('/teams').then(r => r.data),
    });

    const allTeams = Array.isArray(teams) ? teams : [];

    // Count pending invitations
    const pendingInvites = allTeams.filter((t) =>
        t.invitations?.length > 0
    ).length;

    // Client-side filtering
    const filtered = allTeams.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchType;
    });

    const openInvite = (team) => {
        setSelectedTeam(team);
        setInviteOpen(true);
    };

    const filterBtnClass = (active) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
         ${active
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-white text-xl font-bold">Teams</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {filtered.length} team{filtered.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Invitations badge */}
                    {pendingInvites > 0 && (
                        <Button
                            variant="secondary"
                            onClick={() => setInvitationsOpen(true)}
                            className="relative text-sm"
                        >
                            <Mail className="w-4 h-4 mr-1" />
                            Invitations
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                                             bg-indigo-500 text-white text-xs flex items-center
                                             justify-center font-bold">
                                {pendingInvites}
                            </span>
                        </Button>
                    )}
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" /> New Team
                    </Button>
                </div>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-700 border
                                   border-slate-600 text-white placeholder-slate-500
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                                   transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {TYPE_FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setTypeFilter(f)}
                            className={filterBtnClass(typeFilter === f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Team grid */}
            {isLoading ? (
                <Spinner fullPage />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center
                                    justify-center mb-4">
                        <Plus className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-medium">No teams found</p>
                    <p className="text-sm mt-1">
                        {search || typeFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first team to get started'}
                    </p>
                    {!search && typeFilter === 'all' && (
                        <Button onClick={() => setCreateOpen(true)} className="mt-4">
                            <Plus className="w-4 h-4 mr-2" /> Create Team
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((team) => (
                        <TeamCard
                            key={team._id}
                            team={team}
                            onInvite={openInvite}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateTeamModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
            <InviteModal
                open={inviteOpen}
                onClose={() => { setInviteOpen(false); setSelectedTeam(null); }}
                team={selectedTeam}
            />
            <PendingInvitationsModal
                open={invitationsOpen}
                onClose={() => setInvitationsOpen(false)}
                teams={allTeams}
            />
        </div>
    );
}