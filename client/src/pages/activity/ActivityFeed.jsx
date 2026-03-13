import { useQuery } from '@tanstack/react-query';
import { Activity, CheckSquare, Users, MessageSquare, Trash2, Plus, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';

const ACTION_STYLES = {
    task_created: { color: 'bg-green-500/20 text-green-400', icon: Plus },
    task_updated: { color: 'bg-blue-500/20 text-blue-400', icon: CheckSquare },
    task_deleted: { color: 'bg-red-500/20 text-red-400', icon: Trash2 },
    status_changed: { color: 'bg-yellow-500/20 text-yellow-400', icon: RefreshCw },
    team_created: { color: 'bg-purple-500/20 text-purple-400', icon: Users },
    member_added: { color: 'bg-teal-500/20 text-teal-400', icon: Users },
    member_removed: { color: 'bg-red-500/20 text-red-400', icon: Users },
    join_request_handled: { color: 'bg-orange-500/20 text-orange-400', icon: Users },
    comment_added: { color: 'bg-pink-500/20 text-pink-400', icon: MessageSquare },
};

const DEFAULT_STYLE = { color: 'bg-slate-500/20 text-slate-400', icon: Activity };

function ActivityItem({ activity }) {
    const style = ACTION_STYLES[activity.action] || DEFAULT_STYLE;
    const Icon = style.icon;
    const timeAgo = getTimeAgo(activity.createdAt);

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/30
                        transition-colors group">
            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                             flex-shrink-0 ${style.color}`}>
                <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* User avatar + name */}
                    {activity.user && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br
                                            from-indigo-500 to-purple-600 flex items-center
                                            justify-center flex-shrink-0">
                                <span className="text-white text-[9px] font-bold">
                                    {activity.user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-white text-sm font-medium">
                                {activity.user.name}
                            </span>
                        </div>
                    )}
                    {/* Action badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${style.color}`}>
                        {activity.action?.replace(/_/g, ' ')}
                    </span>
                </div>

                {/* Details */}
                <p className="text-slate-400 text-sm mt-0.5 truncate">
                    {activity.details}
                </p>

                {/* Related task/team */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                    <span className="text-slate-600 text-xs">{timeAgo}</span>
                </div>
            </div>
        </div>
    );
}

// ── Main export — can be used anywhere ────────────────────────────────────
export default function ActivityFeed({
    type = 'recent',   // 'recent' | 'task' | 'team'
    id = null,       // taskId or teamId
    limit = 20,
    compact = false,      // compact mode for dashboard widget
}) {
    const queryKey = ['activities', type, id];

    const queryFn = () => {
        if (type === 'task' && id) return api.get(`/activities/task/${id}`).then(r => r.data);
        if (type === 'team' && id) return api.get(`/activities/team/${id}`).then(r => r.data);
        return api.get('/activities/recent').then(r => r.data);
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey,
        queryFn,
        refetchInterval: 30000, // auto refresh every 30s
    });

    const activities = (data?.activities || []).slice(0, limit);

    if (isLoading) return <Spinner size="sm" />;

    return (
        <div className="flex flex-col gap-1">
            {/* Header */}
            {!compact && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        Activity Feed
                    </h3>
                    <button
                        onClick={() => refetch()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white
                                   hover:bg-slate-700 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* List */}
            {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No activity yet</p>
                </div>
            ) : (
                activities.map((activity) => (
                    <ActivityItem key={activity._id} activity={activity} />
                ))
            )}
        </div>
    );
}

// ── Time ago helper ────────────────────────────────────────────────────────
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