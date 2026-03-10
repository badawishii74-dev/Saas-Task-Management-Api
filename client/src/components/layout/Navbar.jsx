import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar({ title = '' }) {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-700/50
                           flex items-center justify-between px-6 flex-shrink-0">
            <h1 className="text-white font-semibold text-lg">{title}</h1>

            <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500
                                    to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-white text-sm font-medium">{user?.name}</p>
                        <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}