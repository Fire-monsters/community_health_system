import { Routes, Route, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppointmentList from '../components/AppointmentList';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointments } from '../hooks/useAppointments';

function AppointmentEditRoute() {
  const { id } = useParams();
  const { getAppointment } = useAppointments();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAppointment = async () => {
      try {
        const data = await getAppointment(id);
        if (active) setAppointment(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAppointment();

    return () => {
      active = false;
    };
  }, [getAppointment, id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        Loading appointment...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        Appointment not found
      </div>
    );
  }

  return <AppointmentForm existingAppointment={appointment} />;
}

export default function AppointmentsPage() {
  return (
    <Routes>
      <Route index element={<AppointmentList />} />
      <Route path="new" element={<AppointmentForm onSuccess={() => window.history.back()} />} />
      <Route path=":id/edit" element={<AppointmentEditRoute />} />
    </Routes>
  );
}
