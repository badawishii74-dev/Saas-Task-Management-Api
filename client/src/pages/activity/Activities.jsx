import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import ActivityFeed from './ActivityFeed';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const ACTION_FILTERS = [
    'all',
    'task_created',
    'task_updated',
    'task_deleted',
    'status_changed',
    'team_created',
    'member_added',
    'member_removed',
    'comment_added',
];

export default function Activities() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['activities', 'recent'],
        queryFn: () => api.get('/activities/recent').then(r => r.data),
        refetchInterval: 30000,
    });

    const activities = data?.activities || [];

    const filtered = activities.filter((a) => {
        const matchSearch = a.details?.toLowerCase().includes(search.toLowerCase())
            || a.user?.name?.toLowerCase().includes(search.toLowerCase())
            || a.task?.title?.toLowerCase().includes(search.toLowerCase())
            || a.team?.name?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || a.action === filter;
        return matchSearch && matchFilter;
    });

    const filterBtnClass = (active) =>
        `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize whitespace-nowrap
         ${active
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">

            {/* Header */}
            <div>
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Activity Feed
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    {filtered.length} activities
                </p>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50
                            rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                       w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-700
                                   border border-slate-600 text-white placeholder-slate-500
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                    {ACTION_FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={filterBtnClass(filter === f)}
                        >
                            {f.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity list */}
            <Card>
                {isLoading ? (
                    <Spinner fullPage />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No activities found</p>
                        <p className="text-sm mt-1">
                            {search || filter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Activities will appear here as you use the app'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-700/30">
                        {filtered.map((activity) => {
                            const timeAgo = getTimeAgo(activity.createdAt);
                            const ACTION_STYLES = {
                                task_created: 'bg-green-500/20 text-green-400',
                                task_updated: 'bg-blue-500/20 text-blue-400',
                                task_deleted: 'bg-red-500/20 text-red-400',
                                status_changed: 'bg-yellow-500/20 text-yellow-400',
                                team_created: 'bg-purple-500/20 text-purple-400',
                                member_added: 'bg-teal-500/20 text-teal-400',
                                member_removed: 'bg-red-500/20 text-red-400',
                                join_request_handled: 'bg-orange-500/20 text-orange-400',
                                comment_added: 'bg-pink-500/20 text-pink-400',
                            };
                            const colorClass = ACTION_STYLES[activity.action]
                                || 'bg-slate-500/20 text-slate-400';

                            return (
                                <div key={activity._id}
                                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                                    {/* User avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br
                                                    from-indigo-500 to-purple-600 flex items-center
                                                    justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">
                                            {activity.user?.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-white text-sm font-medium">
                                                {activity.user?.name || 'Unknown'}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full
                                                              ${colorClass}`}>
                                                {activity.action?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <p className="text-slate-300 text-sm">
                                            {activity.details}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {activity.task && (
                                                <span className="text-xs px-2 py-0.5 rounded-lg
                                                                 bg-slate-700 text-slate-300">
                                                    📋 {activity.task.title}
                                                </span>
                                            )}
                                            {activity.team && (
                                                <span className="text-xs px-2 py-0.5 rounded-lg
                                                                 bg-slate-700 text-slate-300">
                                                    👥 {activity.team.name}
                                                </span>
                                            )}
                                            <span className="text-slate-500 text-xs">
                                                {timeAgo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}