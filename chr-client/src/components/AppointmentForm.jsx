import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppointments } from '../hooks/useAppointments';
import { getFacilityId, getAll } from '../services/db';
import { useEffect } from 'react';

export default function AppointmentForm({ existingAppointment, onSuccess }) {
  const { addAppointment, updateAppointment } = useAppointments();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(existingAppointment || {
    id: uuidv4(),
    patient_id: '',
    facility_id: '',
    scheduled_for: '',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    const loadPatients = async () => {
      const all = await getAll('patients');
      setPatients(all);
    };
    loadPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const facilityId = await getFacilityId();
    const data = { ...form, facility_id: facilityId };
    if (existingAppointment) {
      await updateAppointment(existingAppointment.id, data);
    } else {
      await addAppointment(data);
    }
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">{existingAppointment ? 'Edit Appointment' : 'New Appointment'}</h2>
      <select className="border p-2 w-full" value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})} required>
        <option value="">Select Patient</option>
        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
      </select>
      <input type="datetime-local" className="border p-2 w-full" value={form.scheduled_for.slice(0,16)} onChange={e => setForm({...form, scheduled_for: e.target.value})} required />
      <select className="border p-2 w-full" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No Show</option>
      </select>
      <textarea className="border p-2 w-full" placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">Save</button>
    </form>
  );
}