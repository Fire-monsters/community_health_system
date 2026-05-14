import { useState, useEffect } from 'react';
import { getAll, getAllFromIndex, getById, put, remove } from '../services/db';

export function useEncounters(patientId = null) {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEncounters = async () => {
    let data;
    if (patientId) {
      data = await getAllFromIndex('encounters', 'patient_id', patientId);
    } else {
      data = await getAll('encounters');
    }
    setEncounters(data.sort((a,b) => new Date(b.visit_date) - new Date(a.visit_date)));
    setLoading(false);
  };

  const addEncounter = async (encounter) => {
    const newEnc = { ...encounter, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await put('encounters', newEnc);
    await loadEncounters();
    return newEnc;
  };

  const updateEncounter = async (id, updates) => {
    const existing = await getById('encounters', id);
    if (existing) {
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
      await put('encounters', updated);
      await loadEncounters();
    }
  };

  const deleteEncounter = async (id) => {
    await remove('encounters', id);
    await loadEncounters();
  };

  useEffect(() => {
    loadEncounters();
  }, [patientId]);

  return { encounters, loading, addEncounter, updateEncounter, deleteEncounter, refresh: loadEncounters };
}