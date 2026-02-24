const STATUS_CONFIG = {
    all: { label: 'All Tasks', color: 'text-gray-300', bg: 'bg-gray-700', ring: 'ring-gray-500' },
    pending: { label: 'Pending', color: 'text-amber-300', bg: 'bg-amber-500/20', ring: 'ring-amber-500' },
    'in progress': { label: 'In Progress', color: 'text-blue-300', bg: 'bg-blue-500/20', ring: 'ring-blue-500' },
    completed: { label: 'Completed', color: 'text-emerald-300', bg: 'bg-emerald-500/20', ring: 'ring-emerald-500' },
};

export default function StatsBar({ tasks, filter, setFilter }) {
    const counts = {
        all: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        'in progress': tasks.filter((t) => t.status === 'in progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-5">My Tasks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`group relative flex flex-col gap-1 p-4 rounded-2xl border transition-all duration-200 text-left
              ${filter === key
                                ? `${cfg.bg} border-transparent ring-2 ${cfg.ring} shadow-lg`
                                : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'
                            }`}
                    >
                        <span className={`text-3xl font-extrabold tracking-tight ${cfg.color}`}>
                            {counts[key]}
                        </span>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${filter === key ? cfg.color : 'text-gray-500'}`}>
                            {cfg.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
