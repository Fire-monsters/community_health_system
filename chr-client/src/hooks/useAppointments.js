import { useState, useEffect } from 'react';
import { getAll, getById, put, remove, getAllFromIndex } from '../services/db';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    const data = await getAll('appointments');
    setAppointments(data.sort((a,b) => new Date(a.scheduled_for) - new Date(b.scheduled_for)));
    setLoading(false);
  };

  const addAppointment = async (appointment) => {
    const newApp = { ...appointment, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await put('appointments', newApp);
    await loadAppointments();
    return newApp;
  };

  const updateAppointment = async (id, updates) => {
    const existing = await getById('appointments', id);
    if (existing) {
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
      await put('appointments', updated);
      await loadAppointments();
    }
  };

  const deleteAppointment = async (id) => {
    await remove('appointments', id);
    await loadAppointments();
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return { appointments, loading, addAppointment, updateAppointment, deleteAppointment, refresh: loadAppointments };
}