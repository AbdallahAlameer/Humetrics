import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Performance from './pages/Performance';
import Recommendations from './pages/Recommendations';
import Employees from './pages/Employees';
import RiskAlerts from './pages/RiskAlerts';
import DataUpload from './pages/DataUpload';
import Settings from './pages/Settings';
import Help from './pages/Help';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const { landingPage } = usePreferences();
  
  const landingPath = landingPage === 'overview' ? '/' : `/${landingPage}`;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={landingPath} replace /> : <Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="employees" element={<RoleProtectedRoute allowedRoles={['hr', 'manager']}><Employees /></RoleProtectedRoute>} />
        <Route path="recommendations" element={<RoleProtectedRoute allowedRoles={['hr', 'manager']}><Recommendations /></RoleProtectedRoute>} />
        <Route path="performance" element={<RoleProtectedRoute allowedRoles={['hr', 'manager']}><Performance /></RoleProtectedRoute>} />
        <Route path="risk-alerts" element={<RoleProtectedRoute allowedRoles={['hr', 'manager']}><RiskAlerts /></RoleProtectedRoute>} />
        <Route path="upload" element={<RoleProtectedRoute allowedRoles={['hr']}><DataUpload /></RoleProtectedRoute>} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <PreferencesProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </PreferencesProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
