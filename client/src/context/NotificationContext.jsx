import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { fetchUnreadCount } from '../api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState(null);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await fetchUnreadCount();
            setUnreadCount(data.unreadCount ?? 0);
        } catch { /* silent */ }
    }, [isAuthenticated]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io('https://saas-task-management-api.onrender.com', {
            auth: { token: `Bearer ${token}` }
        });

        socket.on('notification', (newNotification) => {
            setUnreadCount((prev) => prev + 1);
            setLatestNotification(newNotification);
            if (newNotification && newNotification.message) {
                addToast(newNotification.message, 'info');
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated, addToast]);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refresh, latestNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

