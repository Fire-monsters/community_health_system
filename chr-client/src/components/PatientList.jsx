import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';

export default function PatientList() {
  const { patients, loading, deletePatient } = usePatients();
  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Patients</h2>
        <Link to="/patients/new" className="bg-blue-600 text-white px-4 py-2 rounded">+ New Patient</Link>
      </div>
      <ul className="space-y-2">
        {patients.map(p => (
          <li key={p.id} className="border p-3 rounded flex justify-between items-center">
            <Link to={`/patients/${p.id}`} className="font-medium">{p.full_name}</Link>
            <div>
              <Link to={`/patients/${p.id}/edit`} className="text-blue-600 mr-2">Edit</Link>
              <button onClick={() => deletePatient(p.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}