import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createComment, fetchTaskComments, updateComment, deleteComment } from '../api';

export default function CommentsPanel({ taskId }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!taskId) return;
        fetchTaskComments(taskId)
            .then((d) => setComments(d.comments ?? d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [taskId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const data = await createComment(taskId, text.trim());
            setComments((prev) => [...prev, data.comment ?? data]);
            setText('');
        } catch (err) { addToast(err.message, 'error'); }
        finally { setSubmitting(false); }
    };

    const handleUpdate = async (id) => {
        try {
            const data = await updateComment(id, editText.trim());
            setComments((prev) => prev.map((c) => c._id === id ? (data.comment ?? data) : c));
            setEditingId(null);
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteComment(id);
            setComments((prev) => prev.filter((c) => c._id !== id));
            addToast('Comment deleted', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    if (loading) return <p className="text-gray-500 text-sm py-4">Loading comments…</p>;

    return (
        <div className="mt-4 border-t border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Comments ({comments.length})
            </h3>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {comments.length === 0 && (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
                {comments.map((c) => (
                    <div key={c._id} className="bg-gray-800/50 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-violet-600/60 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                    {(c.userId?.name ?? c.author ?? 'U')[0].toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-gray-300">
                                    {c.userId?.name ?? c.author ?? 'User'}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {(c.userId?._id === user?.id || c.userId === user?.id) && (
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => { setEditingId(c._id); setEditText(c.text); }}
                                        className="text-gray-500 hover:text-violet-400 text-xs transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(c._id)}
                                        className="text-gray-500 hover:text-red-400 text-xs transition-colors">Del</button>
                                </div>
                            )}
                        </div>

                        {editingId === c._id ? (
                            <div className="flex gap-2 mt-1">
                                <input value={editText} onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                <button onClick={() => handleUpdate(c._id)}
                                    className="px-3 py-1 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-500">Save</button>
                                <button onClick={() => setEditingId(null)}
                                    className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">Cancel</button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 ml-8">{c.text}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button type="submit" disabled={submitting || !text.trim()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed
                        text-white text-sm font-semibold rounded-xl transition-all">
                    Send
                </button>
            </form>
        </div>
    );
}
