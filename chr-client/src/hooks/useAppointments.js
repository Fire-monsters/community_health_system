import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getAll, getById, put, putSync, deleteSync, remove } from '../services/db';

const APPOINTMENT_FIELDS = [
  'id',
  'patient_id',
  'facility_id',
  'scheduled_for',
  'status',
  'reminder_sent',
  'notes',
  'created_at',
  'updated_at'
];

function sortAppointments(data) {
  return [...data].sort((a, b) => new Date(a.scheduled_for || 0) - new Date(b.scheduled_for || 0));
}

function cleanAppointment(appointment) {
  return APPOINTMENT_FIELDS.reduce((cleaned, field) => {
    if (appointment[field] !== undefined) {
      cleaned[field] = appointment[field] === '' ? null : appointment[field];
    }
    return cleaned;
  }, {});
}

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/appointments', { params: { limit: 500 } });
      const remoteAppointments = sortAppointments(response.data);

      for (const appointment of remoteAppointments) {
        await putSync('appointments', appointment);
      }

      setAppointments(remoteAppointments);
    } catch (err) {
      const cachedAppointments = await getAll('appointments');
      setAppointments(sortAppointments(cachedAppointments));
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shouldUseOfflineFallback = (err) => !err.response;

  const addAppointment = useCallback(async (appointment) => {
    const now = new Date().toISOString();
    const newAppointment = cleanAppointment({
      ...appointment,
      created_at: appointment.created_at || now,
      updated_at: now
    });

    try {
      const response = await api.post('/appointments', newAppointment);
      await putSync('appointments', response.data);
      await loadAppointments();
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await put('appointments', newAppointment);
      await loadAppointments();
      return newAppointment;
    }
  }, [loadAppointments]);

  const getAppointment = useCallback(async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      await putSync('appointments', response.data);
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      return getById('appointments', id);
    }
  }, []);

  const updateAppointment = useCallback(async (id, updates) => {
    const existing = await getById('appointments', id);
    const updated = cleanAppointment({
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    });

    try {
      const response = await api.put(`/appointments/${id}`, updated);
      await putSync('appointments', response.data);
      await loadAppointments();
      return response.data;
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await put('appointments', updated);
      await loadAppointments();
      return updated;
    }
  }, [loadAppointments]);

  const deleteAppointment = useCallback(async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      await deleteSync('appointments', id);
    } catch (err) {
      if (!shouldUseOfflineFallback(err)) {
        throw err;
      }

      await remove('appointments', id);
    }
    await loadAppointments();
    return id;
  }, [loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    addAppointment,
    getAppointment,
    updateAppointment,
    deleteAppointment,
    refresh: loadAppointments
  };
}
