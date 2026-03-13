import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, CheckSquare, Users, Bell,
    LogOut, Shield, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const adminItems = [
    { to: '/admin/dashboard', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tasks', icon: CheckSquare, label: 'All Tasks' },
    { to: '/admin/teams', icon: Users, label: 'All Teams' },
    { to: '/activities', icon: Activity, label: 'Activities' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const items = user?.role === 'admin' ? adminItems : navItems;

    return (
        <aside className={`relative flex flex-col bg-slate-900 border-r border-slate-700/50
                           transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>

            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-slate-700/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br
                                from-indigo-500 to-purple-600 flex items-center justify-center
                                shadow-lg shadow-indigo-500/25">
                    <CheckSquare className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-white text-lg truncate">TaskManager</span>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-slate-700
                           border border-slate-600 flex items-center justify-center
                           text-slate-400 hover:text-white transition-colors z-10"
            >
                {collapsed
                    ? <ChevronRight className="w-3 h-3" />
                    : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Nav items */}
            <nav className="flex-1 p-4 flex flex-col gap-1">
                {items.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                             ${isActive
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                        }
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="p-4 border-t border-slate-700/50">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500
                                        to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-slate-400 text-xs truncate">{user?.role}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                               text-slate-400 hover:text-red-400 hover:bg-red-500/10
                               transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
}