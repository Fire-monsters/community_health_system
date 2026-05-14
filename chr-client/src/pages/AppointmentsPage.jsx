import { Routes, Route } from 'react-router-dom';
import AppointmentList from '../components/AppointmentList';
import AppointmentForm from '../components/AppointmentForm';

export default function AppointmentsPage() {
  return (
    <Routes>
      <Route index element={<AppointmentList />} />
      <Route path="new" element={<AppointmentForm onSuccess={() => window.history.back()} />} />
      <Route path=":id/edit" element={<AppointmentForm existingAppointment={null} onSuccess={() => window.history.back()} />} />
    </Routes>
  );
}