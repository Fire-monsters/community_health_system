import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import SyncStatus from './components/SyncStatus';
import Login from './pages/Login';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ReportsPage from './pages/ReportsPage';
import SyncPage from './pages/SyncPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
  return (
    <div>
      <SyncStatus />
      <div className="pb-16">
        <Routes>
          <Route path="/patients/*" element={<PatientsPage />} />
          <Route path="/appointments/*" element={<AppointmentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sync" element={<SyncPage />} />
          <Route path="/" element={<Navigate to="/patients" />} />
        </Routes>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2">
        <a href="/patients" className="text-center text-sm">Patients</a>
        <a href="/appointments" className="text-center text-sm">Appointments</a>
        <a href="/reports" className="text-center text-sm">Reports</a>
        <a href="/sync" className="text-center text-sm">Sync</a>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          </Routes>
          <ToastContainer position="bottom-center" />
        </SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;