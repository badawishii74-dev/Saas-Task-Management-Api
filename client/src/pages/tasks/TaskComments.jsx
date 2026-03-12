import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Trash2, Pencil, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';


export default function TaskComments({ taskId }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [text, setText] = useState('');
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState('');

    // ── Fetch comments ────────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: () => api.get(`/comments/${taskId}`).then(r => r.data),
        enabled: !!taskId,
    });

    const comments = data?.comments || [];
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] });

    // ── Create comment ────────────────────────────────────────────────────
    const { mutate: createComment, isPending: creating } = useMutation({
        mutationFn: () => api.post(`/comments/${taskId}`, { text }),
        onSuccess: () => {
            setText('');
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to post comment'),
    });

    // ── Update comment ────────────────────────────────────────────────────
    const { mutate: updateComment, isPending: updating } = useMutation({
        mutationFn: () => api.put(`/comments/${editId}`, { text: editText }),
        onSuccess: () => {
            setEditId(null);
            setEditText('');
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
    });

    // ── Delete comment ────────────────────────────────────────────────────
    const { mutate: deleteComment } = useMutation({
        mutationFn: (id) => api.delete(`/comments/${id}`),
        onSuccess: invalidate,
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
    });

    const handleSubmit = () => {
        if (!text.trim()) return toast.error('Comment cannot be empty');
        createComment();
    };

    const startEdit = (comment) => {
        setEditId(comment._id);
        setEditText(comment.text);
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditText('');
    };

    return (
        <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                Comments
                {comments.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700
                                     text-slate-400">
                        {comments.length}
                    </span>
                )}
            </h4>

            {/* Comment input */}
            <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500
                                to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-700 border border-slate-600
                                   text-white placeholder-slate-500 focus:outline-none
                                   focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={creating || !text.trim()}
                        className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-all text-white"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Comments list */}
            {isLoading ? (
                <Spinner size="sm" />
            ) : comments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                    No comments yet. Be the first to comment!
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {comments.map((comment) => {
                        const isOwner = comment.user?._id === user?.id;
                        const isEditing = editId === comment._id;

                        return (
                            <div key={comment._id} className="flex gap-3 group">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br
                                                from-indigo-500 to-purple-600 flex items-center
                                                justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">
                                        {comment.user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white text-sm font-medium">
                                            {comment.user?.name}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') updateComment();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                autoFocus
                                                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700
                                                           border border-indigo-500 text-white text-sm
                                                           focus:outline-none"
                                            />
                                            <button
                                                onClick={() => updateComment()}
                                                disabled={updating}
                                                className="p-1.5 rounded-lg text-green-400
                                                           hover:bg-green-500/10 transition-all"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1.5 rounded-lg text-slate-400
                                                           hover:bg-slate-700 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {comment.text}
                                        </p>
                                    )}
                                </div>

                                {/* Actions — only visible on hover for owner */}
                                {isOwner && !isEditing && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100
                                                    transition-opacity flex-shrink-0">
                                        <button
                                            onClick={() => startEdit(comment)}
                                            className="p-1.5 rounded-lg text-slate-400
                                                       hover:text-indigo-400 hover:bg-indigo-500/10
                                                       transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this comment?'))
                                                    deleteComment(comment._id);
                                            }}
                                            className="p-1.5 rounded-lg text-slate-400
                                                       hover:text-red-400 hover:bg-red-500/10
                                                       transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}