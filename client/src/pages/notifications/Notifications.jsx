import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const TYPE_COLORS = {
    task_assigned: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    task_updated: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    task_deleted: 'bg-red-500/20 text-red-400 border-red-500/20',
    task_status_changed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    team_invite: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    team_join_request: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    team_join_accepted: 'bg-green-500/20 text-green-400 border-green-500/20',
    team_join_rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
    team_member_added: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
    team_member_removed: 'bg-red-500/20 text-red-400 border-red-500/20',
    comment_added: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
};

const TYPE_ICONS = {
    task_assigned: '📋',
    task_updated: '✏️',
    task_deleted: '🗑️',
    task_status_changed: '🔄',
    team_invite: '📨',
    team_join_request: '🙋',
    team_join_accepted: '✅',
    team_join_rejected: '❌',
    team_member_added: '👋',
    team_member_removed: '👋',
    comment_added: '💬',
};

const FILTERS = ['all', 'unread', 'read'];

export default function Notifications() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications-page', filter, page],
        queryFn: () => api.get('/notifications', {
            params: {
                unreadOnly: filter === 'unread' ? true : undefined,
                page,
                limit: 15,
            }
        }).then(r => r.data),
    });

    const notifications = data?.notifications || [];
    const totalPages = data?.pages || 1;
    const unreadCount = data?.unreadCount || 0;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const { mutate: markRead } = useMutation({
        mutationFn: (id) => api.patch(`/notifications/${id}/read`),
        onSuccess: invalidate,
    });

    const { mutate: markAllRead, isPending: markingAll } = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: invalidate,
    });

    const { mutate: deleteOne } = useMutation({
        mutationFn: (id) => api.delete(`/notifications/${id}`),
        onSuccess: invalidate,
    });

    const { mutate: deleteAll, isPending: deletingAll } = useMutation({
        mutationFn: () => api.delete('/notifications'),
        onSuccess: invalidate,
    });

    const filterBtnClass = (active) =>
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize
         ${active
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-white text-xl font-bold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-400" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="text-sm px-2 py-0.5 rounded-full bg-indigo-500/20
                                             text-indigo-400 border border-indigo-500/20">
                                {unreadCount} unread
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {data?.total || 0} total notifications
                    </p>
                </div>

                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            onClick={() => markAllRead()}
                            loading={markingAll}
                            className="text-sm"
                        >
                            <Check className="w-4 h-4 mr-1" /> Mark all read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="danger"
                            onClick={() => { if (confirm('Delete all notifications?')) deleteAll(); }}
                            loading={deletingAll}
                            className="text-sm"
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> Clear all
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-3">
                <Filter className="w-4 h-4 text-slate-500 ml-1" />
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setPage(1); }}
                        className={filterBtnClass(filter === f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <Spinner fullPage />
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center
                                    justify-center mb-4">
                        <Bell className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm mt-1">
                        {filter !== 'all' ? 'Try switching the filter' : "You're all caught up!"}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`group relative flex items-start gap-4 p-4 rounded-2xl
                                        border transition-all duration-200 cursor-pointer
                                        ${n.read
                                    ? 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                                    : 'bg-slate-800/60 border-slate-600/50 hover:bg-slate-800/80'}`}
                            onClick={() => !n.read && markRead(n._id)}
                        >
                            {/* Emoji icon */}
                            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center
                                            justify-center flex-shrink-0 text-lg">
                                {TYPE_ICONS[n.type] || '🔔'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border
                                                      ${TYPE_COLORS[n.type] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                        {n.type.replace(/_/g, ' ')}
                                    </span>
                                    {!n.read && (
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed
                                               ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>
                                    {n.message}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    {n.sender && (
                                        <span className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-br
                                                            from-indigo-500 to-purple-600
                                                            flex items-center justify-center">
                                                <span className="text-white text-[9px] font-bold">
                                                    {n.sender.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {n.sender.name}
                                        </span>
                                    )}
                                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                                </div>

                                {/* Related task/team */}
                                {(n.task || n.team) && (
                                    <div className="flex gap-2 mt-2">
                                        {n.task && (
                                            <span className="text-xs px-2 py-0.5 rounded-lg
                                                             bg-slate-700 text-slate-300">
                                                📋 {n.task.title}
                                            </span>
                                        )}
                                        {n.team && (
                                            <span className="text-xs px-2 py-0.5 rounded-lg
                                                             bg-slate-700 text-slate-300">
                                                👥 {n.team.name}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                           text-slate-500 hover:text-red-400 hover:bg-red-500/10
                                           transition-all duration-200 flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                        variant="secondary"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="text-sm px-4"
                    >
                        Previous
                    </Button>
                    <span className="text-slate-400 text-sm px-4">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="text-sm px-4"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}