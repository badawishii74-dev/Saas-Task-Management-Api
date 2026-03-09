import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import {
    fetchNotifications, markNotificationRead, markAllNotificationsRead,
    deleteNotification, deleteAllNotifications,
} from '../api';

export default function NotificationsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { setUnreadCount, refresh: refreshCount } = useNotifications();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchNotifications(unreadOnly ? { unreadOnly: true } : {});
            setNotifications(data.notifications ?? data);
            setUnreadCount(data.unreadCount ?? 0);
        } catch (err) { addToast(err.message, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [unreadOnly]);

    // Listen for real-time notifications
    const { latestNotification } = useNotifications();
    useEffect(() => {
        if (latestNotification) {
            // Only prepend if it matches the 'unreadOnly' filter (all new notifications are unread)
            setNotifications(prev => {
                // Check if it's already there to prevent duplicates
                if (prev.some(n => n._id === latestNotification._id)) return prev;
                return [latestNotification, ...prev];
            });
        }
    }, [latestNotification]);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
            refreshCount();
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            addToast('All marked as read', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            refreshCount();
        } catch (err) { addToast(err.message, 'error'); }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            addToast('All notifications deleted', 'success');
        } catch (err) { addToast(err.message, 'error'); }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar user={user} />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-violet-400 mt-1">{unreadCount} unread</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setUnreadOnly(!unreadOnly)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                                ${unreadOnly ? 'bg-violet-600/20 border-violet-500/60 text-violet-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                            {unreadOnly ? 'Showing Unread' : 'Show Unread'}
                        </button>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAll}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button onClick={handleDeleteAll}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <Spinner />
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <span className="text-5xl mb-3">🔔</span>
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => (
                            <div key={n._id}
                                className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all
                                    ${n.isRead ? 'bg-gray-900/50 border-gray-800' : 'bg-violet-600/5 border-violet-500/20'}`}>
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {!n.isRead && <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />}
                                    {n.isRead && <div className="w-2 h-2 flex-shrink-0" />}
                                    <div className="min-w-0">
                                        <p className={`text-sm ${n.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {!n.isRead && (
                                        <button onClick={() => handleMarkRead(n._id)}
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                                            title="Mark as read">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(n._id)}
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Delete">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function Spinner() {
    return (
        <div className="flex justify-center items-center h-48">
            <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    );
}
