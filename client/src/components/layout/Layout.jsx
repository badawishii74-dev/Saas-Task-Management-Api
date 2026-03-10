import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'My Tasks',
    '/teams': 'Teams',
    '/notifications': 'Notifications',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'Manage Users',
    '/admin/tasks': 'All Tasks',
    '/admin/teams': 'All Teams',
};

export default function Layout() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Task Manager';

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar title={title} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}