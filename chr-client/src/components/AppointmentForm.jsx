import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppointments } from '../hooks/useAppointments';
import { getFacilityId, getAll } from '../services/db';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildHealthNotes, parseHealthNotes } from '../services/healthNotes';
import { CalendarDays, ClipboardPlus, Save, Stethoscope } from 'lucide-react';

function formatDateTimeInput(value) {
  return value ? String(value).slice(0, 16) : '';
}

function buildInitialForm(existingAppointment, patientId) {
  return existingAppointment || {
    id: uuidv4(),
    patient_id: patientId || '',
    facility_id: '',
    scheduled_for: '',
    status: 'scheduled',
    notes: ''
  };
}

export default function AppointmentForm({ existingAppointment, onSuccess }) {
  const { addAppointment, updateAppointment } = useAppointments();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => buildInitialForm(existingAppointment, searchParams.get('patient_id')));
  const [healthRecord, setHealthRecord] = useState(() => parseHealthNotes(existingAppointment?.notes));

  useEffect(() => {
    const loadPatients = async () => {
      const all = await getAll('patients');
      setPatients(all);
    };
    loadPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const facilityId = await getFacilityId();
      const data = {
        ...form,
        facility_id: facilityId,
        notes: buildHealthNotes(healthRecord)
      };

      if (existingAppointment) {
        await updateAppointment(existingAppointment.id, data);
      } else {
        await addAppointment(data);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Appointment could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {existingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </h1>
            <p className="mt-1 text-gray-500">Set the visit time and capture patient health records</p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Patient</span>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.patient_id}
              onChange={e => setForm({...form, patient_id: e.target.value})}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Date and time</span>
            <input
              type="datetime-local"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={formatDateTimeInput(form.scheduled_for)}
              onChange={e => setForm({...form, scheduled_for: e.target.value})}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Status</span>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </label>

          <section className="rounded-3xl border border-blue-100 bg-blue-50/40 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                <ClipboardPlus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Patient health record</h2>
                <p className="text-sm text-gray-500">Capture disease, symptoms, care notes, and follow-up details</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Disease / condition</span>
                <input
                  className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="e.g. Malaria, hypertension"
                  value={healthRecord.disease}
                  onChange={e => setHealthRecord({...healthRecord, disease: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Symptoms</span>
                <input
                  className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="e.g. Fever, cough, headache"
                  value={healthRecord.symptoms}
                  onChange={e => setHealthRecord({...healthRecord, symptoms: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Diagnosis</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Diagnosis or assessment"
                  value={healthRecord.diagnosis}
                  onChange={e => setHealthRecord({...healthRecord, diagnosis: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Treatment / care plan</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Treatment given or recommended care"
                  value={healthRecord.treatment}
                  onChange={e => setHealthRecord({...healthRecord, treatment: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Medications</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Medicine, dose, frequency"
                  value={healthRecord.medications}
                  onChange={e => setHealthRecord({...healthRecord, medications: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Allergies</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Known allergies or reactions"
                  value={healthRecord.allergies}
                  onChange={e => setHealthRecord({...healthRecord, allergies: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Vitals / measurements</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="BP, temperature, weight, pulse"
                  value={healthRecord.vitals}
                  onChange={e => setHealthRecord({...healthRecord, vitals: e.target.value})}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Additional notes</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Follow-up instructions or other details"
                  value={healthRecord.notes}
                  onChange={e => setHealthRecord({...healthRecord, notes: e.target.value})}
                />
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 p-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? <Stethoscope size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
