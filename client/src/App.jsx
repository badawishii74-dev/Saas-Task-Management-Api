import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <NotificationProvider>
                <Routes>
                    <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
                    <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDetailPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </BrowserRouter>
    );
}
