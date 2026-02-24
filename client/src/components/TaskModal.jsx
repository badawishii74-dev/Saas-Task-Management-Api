import { useState, useEffect } from 'react';

const STATUSES = ['pending', 'in progress', 'completed'];

export default function TaskModal({ task, onClose, onSubmit }) {
    const [form, setForm] = useState({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? 'pending',
    });
    const [loading, setLoading] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setLoading(true);
        await onSubmit(form);
        setLoading(false);
        onClose();
    };

    const isEdit = !!task;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <div>
                        <h3 className="font-bold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Update task details' : 'Fill in the details below'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="e.g. Design landing page"
                            value={form.title}
                            onChange={handleChange}
                            autoFocus
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Optional — add more context..."
                            value={form.description}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm resize-none"
                        />
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <div className="flex gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm({ ...form, status: s })}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${form.status === s
                                                ? s === 'pending'
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                    : s === 'in progress'
                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200
                         hover:border-gray-600 text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.title.trim()}
                            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900
                         disabled:cursor-not-allowed text-white text-sm font-semibold transition-all
                         shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : isEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
