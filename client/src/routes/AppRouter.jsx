import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth pages
import Login from '../pages/auth/Login';
// import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// App pages
// import Layout from '../components/layout/Layout';
// import Dashboard from '../pages/dashboard/Dashboard';
// import Tasks from '../pages/tasks/Tasks';
// import Teams from '../pages/teams/Teams';
// import Notifications from '../pages/notifications/Notifications';

// // Admin pages
// import AdminDashboard from '../pages/admin/AdminDashboard';
// import AdminUsers from '../pages/admin/AdminUsers';
// import AdminTasks from '../pages/admin/AdminTasks';
// import AdminTeams from '../pages/admin/AdminTeams';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

// Admin only route
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            {/* <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="teams" element={<Teams />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Admin routes */}
            {/* <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="teams" element={<AdminTeams />} />
            </Route> */}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} /> */}
        </Routes>
    </BrowserRouter>
);

export default AppRouter;