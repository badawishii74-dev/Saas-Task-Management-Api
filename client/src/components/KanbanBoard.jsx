import TaskCard from './TaskCard';

const COLUMNS = [
    { key: 'pending', label: 'Pending', dot: 'bg-amber-400' },
    { key: 'in progress', label: 'In Progress', dot: 'bg-blue-400' },
    { key: 'completed', label: 'Completed', dot: 'bg-emerald-400' },
];

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }) {
    // If filter is narrowed to one status, show a flat list; otherwise show Kanban columns
    const allStatuses = [...new Set(tasks.map((t) => t.status))];
    const isFiltered = COLUMNS.filter((c) => allStatuses.includes(c.key)).length === 1 || tasks.length === 0;

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-56 gap-3 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p className="text-gray-400 font-medium">No tasks found</p>
                <p className="text-gray-600 text-sm">Create your first task to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key);
                return (
                    <div key={col.key} className="flex flex-col gap-3">
                        {/* Column header */}
                        <div className="flex items-center gap-2 px-1">
                            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{col.label}</h3>
                            <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                {colTasks.length}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-3 min-h-[120px]">
                            {colTasks.length === 0 ? (
                                <div className="flex items-center justify-center h-24 rounded-2xl border-2 border-dashed border-gray-800 text-gray-600 text-sm">
                                    Empty
                                </div>
                            ) : (
                                colTasks.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onStatusChange={onStatusChange}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
