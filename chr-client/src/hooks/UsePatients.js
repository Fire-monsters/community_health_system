import { useEffect, useState } from 'react';
import { getAll, put, remove } from '../services/db';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    const data = await getAll('patients');
    setPatients(data);
    setLoading(false);
  };

  const addPatient = async (patient) => {
    await put('patients', patient);
    await loadPatients();
  };

  const updatePatient = async (id, updates) => {
    const existing = await getById('patients', id);
    if (existing) {
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
      await put('patients', updated);
      await loadPatients();
    }
  };

  const deletePatient = async (id) => {
    await remove('patients', id);
    await loadPatients();
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return { patients, loading, addPatient, updatePatient, deletePatient };
}