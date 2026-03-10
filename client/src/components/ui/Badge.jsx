const variants = {
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
    'in progress': 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
    completed: 'bg-green-500/20 text-green-400 border border-green-500/20',
    low: 'bg-slate-500/20 text-slate-400 border border-slate-500/20',
    medium: 'bg-orange-500/20 text-orange-400 border border-orange-500/20',
    high: 'bg-red-500/20 text-red-400 border border-red-500/20',
    personal: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20',
    team: 'bg-purple-500/20 text-purple-400 border border-purple-500/20',
    admin: 'bg-rose-500/20 text-rose-400 border border-rose-500/20',
    user: 'bg-slate-500/20 text-slate-400 border border-slate-500/20',
};

const Badge = ({ label }) => (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize
                      ${variants[label] || 'bg-slate-700 text-slate-400'}`}>
        {label}
    </span>
);
export default Badge;