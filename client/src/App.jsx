import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
}
