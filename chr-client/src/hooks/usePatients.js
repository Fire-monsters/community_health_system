import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getAll, getById, put, putSync, deleteSync, remove } from '../services/db';

const PATIENT_FIELDS = [
  'id',
  'facility_id',
  'patient_number',
  'full_name',
  'date_of_birth',
  'sex',
  'village',
  'phone_number',
  'next_of_kin',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at'
];

function sortPatients(data) {
  return [...data].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function cleanPatient(patient) {
  return PATIENT_FIELDS.reduce((cleaned, field) => {
    if (patient[field] !== undefined) {
      cleaned[field] = patient[field] === '' ? null : patient[field];
    }
    return cleaned;
  }, {});
}

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/patients', { params: { limit: 500 } });
      const remotePatients = sortPatients(response.data);

      for (const patient of remotePatients) {
        await putSync('patients', patient);
      }

      setPatients(remotePatients);
    } catch (err) {
      const cachedPatients = await getAll('patients');
      setPatients(sortPatients(cachedPatients));
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shouldUseOfflineFallback = (err) => !err.response;

  const addPatient = useCallback(async (patient) => {
    const now = new Date().toISOString();
    const newPatient = cleanPatient({
      ...patient,
      created_at: patient.created_at || now,
      updated_at: now
    });

    try {
      const response = await api.post('/patients', newPatient);
      await putSync('patients', response.data);
      await loadPatients();
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await put('patients', newPatient);
      await loadPatients();
      return newPatient;
    }
  }, [loadPatients]);

  const getPatient = useCallback(async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      await putSync('patients', response.data);
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      return getById('patients', id);
    }
  }, []);

  const updatePatient = useCallback(async (id, updates) => {
    const existing = await getById('patients', id);
    const now = new Date().toISOString();
    const updated = cleanPatient({
      ...existing,
      ...updates,
      id,
      updated_at: now
    });

    try {
      const response = await api.put(`/patients/${id}`, updated);
      await putSync('patients', response.data);
      await loadPatients();
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await put('patients', updated);
      await loadPatients();
      return updated;
    }
  }, [loadPatients]);

  const deletePatient = useCallback(async (id) => {
    try {
      await api.delete(`/patients/${id}`);
      await deleteSync('patients', id);
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await remove('patients', id);
    }

    await loadPatients();
    return id;
  }, [loadPatients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    addPatient,
    getPatient,
    updatePatient,
    deletePatient,
    refresh: loadPatients
  };
}
