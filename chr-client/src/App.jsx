import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SyncProvider } from './contexts/SyncContext';
import SyncStatus from './components/SyncStatus';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import ConflictResolverList from './components/ConflictResolverList'; // you'll map conflicts

function App() {
  return (
    <SyncProvider>
      <BrowserRouter>
        <SyncStatus />
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id/edit" element={<PatientForm existingPatient={} 
          />} />
        </Routes>
      </BrowserRouter>
    </SyncProvider>
  );
}

export default App;