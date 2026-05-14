import { useAppointments } from '../hooks/useAppointments';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getById } from '../services/db';

export default function AppointmentList() {
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [patientNames, setPatientNames] = useState({});

  useEffect(() => {
    const loadNames = async () => {
      const names = {};
      for (const apt of appointments) {
        if (!names[apt.patient_id]) {
          const p = await getById('patients', apt.patient_id);
          names[apt.patient_id] = p?.full_name || 'Unknown';
        }
      }
      setPatientNames(names);
    };
    if (appointments.length) loadNames();
  }, [appointments]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Appointments</h2>
        <Link to="/appointments/new" className="bg-blue-600 text-white px-4 py-2 rounded">+ New Appointment</Link>
      </div>
      <ul className="space-y-2">
        {appointments.map(apt => (
          <li key={apt.id} className="border p-3 rounded">
            <div><strong>{new Date(apt.scheduled_for).toLocaleString()}</strong></div>
            <div>Patient: {patientNames[apt.patient_id]}</div>
            <div>Status: {apt.status}</div>
            <div className="mt-2">
              <Link to={`/appointments/${apt.id}/edit`} className="text-blue-600 mr-2">Edit</Link>
              <button onClick={() => deleteAppointment(apt.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}