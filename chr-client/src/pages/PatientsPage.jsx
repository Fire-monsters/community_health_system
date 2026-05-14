import { Routes, Route } from 'react-router-dom';
import PatientList from '../components/PatientList';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail'; // we'll create below

export default function PatientsPage() {
  return (
    <Routes>
      <Route index element={<PatientList />} />
      <Route path="new" element={<PatientForm onSuccess={() => window.history.back()} />} />
      <Route path=":id" element={<PatientDetail />} />
      <Route path=":id/edit" element={<PatientForm existingPatient={null} onSuccess={() => window.history.back()} />} />
    </Routes>
  );
}