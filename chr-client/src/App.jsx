import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import SyncStatus from './components/SyncStatus';
import Login from './pages/Login';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ReportsPage from './pages/ReportsPage';
import SyncPage from './pages/SyncPage';
import { CalendarDays, FileBarChart2, RefreshCw, UsersRound } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
  const navItems = [
    { to: '/patients', label: 'Patients', icon: UsersRound },
    { to: '/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/reports', label: 'Reports', icon: FileBarChart2 },
    { to: '/sync', label: 'Sync', icon: RefreshCw }
  ];

  return (
    <div className="app-bg min-h-screen">
      <SyncStatus />
      <header className="sticky top-0 z-30 px-4 py-4 backdrop-blur">
        <div className="mx-auto mb-3 max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
            Community Health
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Community Health Records System
          </h1>
          <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500" />
        </div>

        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto rounded-3xl border border-white/70 bg-white/90 p-2 shadow-lg shadow-slate-200/60">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div>
        <Routes>
          <Route path="/patients/*" element={<PatientsPage />} />
          <Route path="/appointments/*" element={<AppointmentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sync" element={<SyncPage />} />
          <Route path="/" element={<Navigate to="/patients" />} />
        </Routes>
      </div>
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
