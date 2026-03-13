import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// App pages
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/dashboard/Dashboard';
import Tasks from '../pages/tasks/Tasks';
import TaskDetail from '../pages/tasks/TaskDetail';
import Teams from '../pages/teams/Teams';
import TeamDetail from '../pages/teams/TeamDetail';
import Notifications from '../pages/notifications/Notifications';
import Activities from '../pages/activity/Activities';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminTasks from '../pages/admin/AdminTasks';
import AdminTeams from '../pages/admin/AdminTeams';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminTeamDetail from '../pages/admin/AdminTeamDetail';

// ── Guards ─────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-900">
            <div className="w-8 h-8 animate-spin rounded-full border-2
                            border-indigo-500 border-t-transparent" />
        </div>
    );
    return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};

// ── Router ─────────────────────────────────────────────────────────────────
const AppRouter = () => (
    <BrowserRouter>
        <Routes>

            {/* ── Public routes ──────────────────────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── Protected user routes ───────────────────────────────── */}
            <Route
                path="/"
                element={<ProtectedRoute><Layout /></ProtectedRoute>}
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:taskId" element={<TaskDetail />} />  {/* ← relative */}
                <Route path="teams" element={<Teams />} />
                <Route path="teams/:teamId" element={<TeamDetail />} />  {/* ← relative */}
                <Route path="notifications" element={<Notifications />} />
                <Route path="activities" element={<Activities />} />  {/* ← relative */}
            </Route>

            {/* ── Admin routes ────────────────────────────────────────── */}
            <Route
                path="/admin"
                element={<AdminRoute><Layout /></AdminRoute>}
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:userId" element={<AdminUserDetail />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="teams" element={<AdminTeams />} />
                <Route path="teams/:teamId" element={<AdminTeamDetail />} />
                <Route path="activities" element={<Activities />} />
            </Route>

            {/* ── Fallback ─────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
    </BrowserRouter>
);

export default AppRouter;