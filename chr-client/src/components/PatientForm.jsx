import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePatients } from '../hooks/usePatients';
import { getFacilityId } from '../services/db';

export default function PatientForm({ existingPatient, onSuccess }) {
  const { addPatient, updatePatient } = usePatients();
  const [form, setForm] = useState(existingPatient || {
    id: uuidv4(),
    full_name: '',
    date_of_birth: '',
    sex: 'female',
    village: '',
    phone_number: '',
    next_of_kin: '',
    patient_number: `OFF-${Date.now()}`
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingPatient) {
      await updatePatient(existingPatient.id, form);
    } else {
      const facilityId = await getFacilityId();
      form.facility_id = facilityId;
      await addPatient(form);
    }
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">{existingPatient ? 'Edit Patient' : 'New Patient'}</h2>
      <input className="border p-2 w-full" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Full Name" required />
      <input type="date" className="border p-2 w-full" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
      <select className="border p-2 w-full" value={form.sex} onChange={e => setForm({...form, sex: e.target.value})}>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>
      <input className="border p-2 w-full" value={form.village} onChange={e => setForm({...form, village: e.target.value})} placeholder="Village" />
      <input className="border p-2 w-full" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="Phone Number" />
      <input className="border p-2 w-full" value={form.next_of_kin} onChange={e => setForm({...form, next_of_kin: e.target.value})} placeholder="Next of Kin" />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">Save</button>
    </form>
  );
}