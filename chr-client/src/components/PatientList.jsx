import { usePatients } from '../hooks/usePatients';
import { Link } from 'react-router-dom';

export default function PatientList() {
  const { patients, loading, deletePatient } = usePatients();
  if (loading) return <div>Loading...</div>;
  return (
    <ul>
      {patients.map(p => (
        <li key={p.id}>
          <Link to={`/patients/${p.id}`}>{p.full_name}</Link>
          <button onClick={() => deletePatient(p.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}