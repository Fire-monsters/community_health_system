import { useState, useEffect } from 'react';
import { getAll, getById, put, remove } from '../services/db';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    const data = await getAll('patients');
    setPatients(data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    setLoading(false);
  };

  const addPatient = async (patient) => {
    const newPatient = { ...patient, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await put('patients', newPatient);
    await loadPatients();
    return newPatient;
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

  return { patients, loading, addPatient, updatePatient, deletePatient, refresh: loadPatients };
}