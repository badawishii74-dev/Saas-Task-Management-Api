import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, Users, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function AdminTeams() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editTeam, setEditTeam] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-teams'],
        queryFn: () => api.get('/admin/teams').then(r => r.data),
    });

    const teams = data?.teams || [];
    const filtered = teams.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const { mutate: updateTeam, isPending: updating } = useMutation({
        mutationFn: (data) => api.put(`/admin/teams/${editTeam._id}`, data),
        onSuccess: () => {
            toast.success('Team updated');
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setEditTeam(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
    });

    const { mutate: deleteTeam } = useMutation({
        mutationFn: (id) => api.delete(`/admin/teams/${id}`),
        onSuccess: () => {
            toast.success('Team deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
    });

    const openEdit = (team) => {
        setEditTeam(team);
        setForm({ name: team.name, description: team.description || '' });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-white text-xl font-bold">All Teams</h2>
                <p className="text-slate-400 text-sm mt-0.5">{filtered.length} teams</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border
                               border-slate-700 text-white placeholder-slate-500
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>

            {isLoading ? <Spinner fullPage /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center
                                        justify-center py-20 text-slate-500">
                            <Users className="w-12 h-12 mb-3 opacity-30" />
                            <p>No teams found</p>
                        </div>
                    ) : filtered.map((team) => (
                        <Card
                            key={team._id}
                            className="flex flex-col gap-4 cursor-pointer hover:border-purple-500/40 transition-all"
                            onClick={() => navigate(`/admin/teams/${team._id}`)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br
                                                    from-purple-500 to-indigo-600 flex items-center
                                                    justify-center flex-shrink-0">
                                        <span className="text-white font-bold">
                                            {team.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{team.name}</p>
                                        <Badge label={team.type} />
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(team)}
                                        className="p-1.5 rounded-lg text-slate-400
                                                   hover:text-indigo-400 hover:bg-indigo-500/10
                                                   transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this team?')) deleteTeam(team._id);
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400
                                                   hover:text-red-400 hover:bg-red-500/10
                                                   transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {team.description && (
                                <p className="text-slate-400 text-sm line-clamp-2">
                                    {team.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Users className="w-3.5 h-3.5" />
                                <span>{team.members?.length} members</span>
                                <span className="text-slate-600">·</span>
                                <span>
                                    Led by{' '}
                                    <span className="text-slate-300">{team.leader?.name}</span>
                                </span>
                            </div>

                            {/* Member avatars */}
                            <div className="flex -space-x-2">
                                {team.members?.slice(0, 6).map((m, i) => (
                                    <div
                                        key={m._id || i}
                                        title={m.name}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br
                                                   from-indigo-500 to-purple-600 border-2
                                                   border-slate-800 flex items-center justify-center"
                                    >
                                        <span className="text-white text-xs font-bold">
                                            {m.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                                {team.members?.length > 6 && (
                                    <div className="w-7 h-7 rounded-full bg-slate-700
                                                    border-2 border-slate-800 flex items-center
                                                    justify-center">
                                        <span className="text-slate-300 text-xs">
                                            +{team.members.length - 6}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit modal */}
            <Modal open={!!editTeam} onClose={() => setEditTeam(null)} title="Edit Team">
                <Input
                    label="Team Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                                   text-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                                   transition-all duration-200 resize-none"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setEditTeam(null)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!form.name) return toast.error('Name is required');
                            updateTeam(form);
                        }}
                        loading={updating}
                        className="flex-1"
                    >
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </div>
    );
}