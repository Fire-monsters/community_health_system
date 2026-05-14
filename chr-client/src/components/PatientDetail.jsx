import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getById, getAllFromIndex } from '../services/db';
import { useEncounters } from '../hooks/useEncounters';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const { encounters } = useEncounters(id);

  useEffect(() => {
    const load = async () => {
      const p = await getById('patients', id);
      setPatient(p);
    };
    load();
  }, [id]);

  if (!patient) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{patient.full_name}</h1>
      <p>Patient #: {patient.patient_number}</p>
      <p>Village: {patient.village}</p>
      <p>Phone: {patient.phone_number}</p>
      <div className="mt-4 flex space-x-2">
        <Link to={`/patients/${id}/edit`} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</Link>
        <Link to={`/encounters/new?patient_id=${id}`} className="bg-green-600 text-white px-3 py-1 rounded">New Encounter</Link>
        <Link to={`/appointments/new?patient_id=${id}`} className="bg-purple-600 text-white px-3 py-1 rounded">Schedule Appointment</Link>
      </div>
      <h2 className="text-xl font-bold mt-6">Encounters</h2>
      {encounters.map(e => (
        <div key={e.id} className="border p-2 mt-2">
          <p><strong>{e.visit_date}</strong> – {e.visit_type}</p>
          <p>Diagnosis: {e.diagnosis}</p>
          <Link to={`/encounters/${e.id}`} className="text-blue-600">View Details</Link>
        </div>
      ))}
    </div>
  );
}