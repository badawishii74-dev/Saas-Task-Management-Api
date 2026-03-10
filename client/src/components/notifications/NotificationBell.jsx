import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const { data } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications?limit=10').then(r => r.data),
    });

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    // Socket.io — real-time push
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
            auth: { token: `Bearer ${token}` },
        });

        socket.on('notification', (n) => {
            toast(n.message, { icon: '🔔' });
            // Invalidate so the list refreshes
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        return () => socket.disconnect();
    }, [user]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const { mutate: markRead } = useMutation({
        mutationFn: (id) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const { mutate: markAllRead } = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const { mutate: deleteAll } = useMutation({
        mutationFn: () => api.delete('/notifications'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const typeColors = {
        task_assigned: 'bg-indigo-500/20 text-indigo-400',
        task_updated: 'bg-blue-500/20 text-blue-400',
        task_deleted: 'bg-red-500/20 text-red-400',
        task_status_changed: 'bg-yellow-500/20 text-yellow-400',
        team_invite: 'bg-purple-500/20 text-purple-400',
        team_join_request: 'bg-orange-500/20 text-orange-400',
        team_join_accepted: 'bg-green-500/20 text-green-400',
        team_join_rejected: 'bg-red-500/20 text-red-400',
        team_member_added: 'bg-teal-500/20 text-teal-400',
        team_member_removed: 'bg-red-500/20 text-red-400',
        comment_added: 'bg-pink-500/20 text-pink-400',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white
                           hover:bg-slate-700 transition-all duration-200"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full
                                     bg-gradient-to-br from-indigo-500 to-purple-600
                                     text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700/50
                                rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead()}
                                    className="text-xs text-indigo-400 hover:text-indigo-300
                                               flex items-center gap-1 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => deleteAll()}
                                    className="text-xs text-red-400 hover:text-red-300
                                               flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markRead(n._id)}
                                    className={`p-4 border-b border-slate-700/30 cursor-pointer
                                                hover:bg-slate-700/50 transition-colors
                                                ${!n.read ? 'bg-slate-700/20' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5
                                                          ${typeColors[n.type] || 'bg-slate-700 text-slate-400'}`}>
                                            {n.type.replace(/_/g, ' ')}
                                        </span>
                                        {!n.read && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5 ml-auto" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 mt-2">{n.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}