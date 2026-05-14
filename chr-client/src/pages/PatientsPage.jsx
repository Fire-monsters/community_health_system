import { Routes, Route, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PatientList from '../components/PatientList';
import PatientForm from '../components/PatientForm';
import PatientDetail from '../components/PatientDetail';
import { usePatients } from '../hooks/usePatients';

function PatientEditRoute() {
  const { id } = useParams();
  const { getPatient } = usePatients();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPatient = async () => {
      try {
        const data = await getPatient(id);
        if (active) {
          setPatient(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      active = false;
    };
  }, [getPatient, id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        Loading patient...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        Patient not found
      </div>
    );
  }

  return <PatientForm existingPatient={patient} />;
}

export default function PatientsPage() {
  return (
    <Routes>
      <Route index element={<PatientList />} />

      <Route
        path="new"
        element={<PatientForm />}
      />

      <Route
        path=":id"
        element={<PatientDetail />}
      />

      <Route
        path=":id/edit"
        element={<PatientEditRoute />}
      />
    </Routes>
  );
}
