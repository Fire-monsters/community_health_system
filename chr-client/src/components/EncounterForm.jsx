import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEncounters } from '../hooks/useEncounters';
import { getFacilityId, getById } from '../services/db';

export default function EncounterForm({ patientId, existingEncounter, onSuccess }) {
  const { addEncounter, updateEncounter } = useEncounters(patientId);
  const [form, setForm] = useState(existingEncounter || {
    id: uuidv4(),
    patient_id: patientId,
    recorded_by: '', // will be filled from user context
    facility_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'outpatient',
    chief_complaint: '',
    diagnosis: '',
    treatment_given: '',
    notes: '',
    sync_status: 'pending'
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitals, setVitals] = useState({ weight_kg: '', height_cm: '', temperature_c: '', blood_pressure_sys: '', blood_pressure_dia: '', pulse_rate: '', respiratory_rate: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const facilityId = await getFacilityId();
    const userId = localStorage.getItem('user_id') || 'temp-user'; // would come from auth
    const encounterData = {
      ...form,
      facility_id: facilityId,
      recorded_by: userId
    };
    if (existingEncounter) {
      await updateEncounter(existingEncounter.id, encounterData);
    } else {
      const newEnc = await addEncounter(encounterData);
      // Save vitals and prescriptions linked to newEnc.id
      if (vitals.weight_kg) {
        const vitalRecord = { id: uuidv4(), encounter_id: newEnc.id, ...vitals, recorded_at: new Date().toISOString() };
        await put('vitals', vitalRecord);
      }
      for (const rx of prescriptions) {
        const rxRecord = { id: uuidv4(), encounter_id: newEnc.id, ...rx };
        await put('prescriptions', rxRecord);
      }
    }
    if (onSuccess) onSuccess();
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication_name: '', dosage: '', frequency: '', duration_days: '' }]);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">{existingEncounter ? 'Edit Encounter' : 'New Encounter'}</h2>
      <input type="date" className="border p-2 w-full" value={form.visit_date} onChange={e => setForm({...form, visit_date: e.target.value})} />
      <select className="border p-2 w-full" value={form.visit_type} onChange={e => setForm({...form, visit_type: e.target.value})}>
        <option value="outpatient">Outpatient</option>
        <option value="inpatient">Inpatient</option>
        <option value="antenatal">Antenatal</option>
        <option value="immunization">Immunization</option>
        <option value="follow_up">Follow-up</option>
        <option value="emergency">Emergency</option>
      </select>
      <textarea className="border p-2 w-full" rows="2" placeholder="Chief Complaint" value={form.chief_complaint} onChange={e => setForm({...form, chief_complaint: e.target.value})} />
      <textarea className="border p-2 w-full" rows="2" placeholder="Diagnosis" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} />
      <textarea className="border p-2 w-full" rows="2" placeholder="Treatment Given" value={form.treatment_given} onChange={e => setForm({...form, treatment_given: e.target.value})} />
      <textarea className="border p-2 w-full" rows="2" placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

      <div className="border p-2">
        <h3 className="font-bold">Vitals</h3>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Weight (kg)" className="border p-1" value={vitals.weight_kg} onChange={e => setVitals({...vitals, weight_kg: e.target.value})} />
          <input placeholder="Height (cm)" className="border p-1" value={vitals.height_cm} onChange={e => setVitals({...vitals, height_cm: e.target.value})} />
          <input placeholder="Temp (°C)" className="border p-1" value={vitals.temperature_c} onChange={e => setVitals({...vitals, temperature_c: e.target.value})} />
          <input placeholder="BP (sys/dia)" className="border p-1" value={vitals.blood_pressure_sys} onChange={e => setVitals({...vitals, blood_pressure_sys: e.target.value})} />
        </div>
      </div>

      <div className="border p-2">
        <h3 className="font-bold">Prescriptions</h3>
        {prescriptions.map((rx, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 mt-2">
            <input placeholder="Medication" className="border p-1" value={rx.medication_name} onChange={e => { const newRx = [...prescriptions]; newRx[idx].medication_name = e.target.value; setPrescriptions(newRx); }} />
            <input placeholder="Dosage" className="border p-1" value={rx.dosage} onChange={e => { const newRx = [...prescriptions]; newRx[idx].dosage = e.target.value; setPrescriptions(newRx); }} />
            <input placeholder="Frequency" className="border p-1" value={rx.frequency} onChange={e => { const newRx = [...prescriptions]; newRx[idx].frequency = e.target.value; setPrescriptions(newRx); }} />
            <input placeholder="Duration (days)" className="border p-1" value={rx.duration_days} onChange={e => { const newRx = [...prescriptions]; newRx[idx].duration_days = e.target.value; setPrescriptions(newRx); }} />
          </div>
        ))}
        <button type="button" onClick={addPrescription} className="mt-2 text-blue-600">+ Add Prescription</button>
      </div>

      <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">Save Encounter</button>
    </form>
  );
}