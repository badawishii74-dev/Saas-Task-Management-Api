import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ user, onNewTask }) {
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand + Nav Links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow shadow-violet-500/30">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">TaskFlow</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" label="Dashboard" />
                        <NavLink to="/teams" label="Teams" />
                        {user?.role === 'admin' && <NavLink to="/admin" label="Admin" />}
                    </nav>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* New Task button */}
                    {onNewTask && (
                        <button onClick={onNewTask}
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                                px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:block">New Task</span>
                        </button>
                    )}

                    {/* Notification Bell */}
                    <Link to="/notifications"
                        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* User avatar */}
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm text-gray-200 font-medium">{user?.name}</p>
                            {user?.role === 'admin' && (
                                <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">Admin</span>
                            )}
                        </div>
                    </div>

                    {/* Logout */}
                    <button onClick={handleLogout} title="Logout"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}

function NavLink({ to, label }) {
    return (
        <Link to={to}
            className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
            {label}
        </Link>
    );
}
