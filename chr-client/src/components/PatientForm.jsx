import { useState } from 'react';
import { usePatients } from '../hooks/usePatients';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

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
    facility_id: '' // will be set from metadata
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingPatient) {
      await updatePatient(existingPatient.id, form);
    } else {
      // Set facility_id from stored value
      const facilityId = await getFacilityId();
      form.facility_id = facilityId;
      await addPatient(form);
    }
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Full Name" required />
      <input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
      <select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})}>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>
      <input value={form.village} onChange={e => setForm({...form, village: e.target.value})} placeholder="Village" />
      <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="Phone" />
      <button type="submit">Save</button>
    </form>
  );
}