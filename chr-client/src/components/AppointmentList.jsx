import { useAppointments } from '../hooks/useAppointments';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getById } from '../services/db';
import { healthNoteSections, parseHealthNotes } from '../services/healthNotes';
import {
  CalendarClock,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound
} from 'lucide-react';

const statusStyles = {
  scheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  no_show: 'bg-amber-50 text-amber-700'
};

const formatStatus = (status) => status?.replace('_', ' ') || 'scheduled';

export default function AppointmentList() {
  const { appointments, loading, deleteAppointment } = useAppointments();
  const [patientNames, setPatientNames] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadNames = async () => {
      const names = {};
      for (const apt of appointments) {
        if (!names[apt.patient_id]) {
          const p = await getById('patients', apt.patient_id);
          names[apt.patient_id] = p?.full_name || 'Unknown';
        }
      }
      setPatientNames(names);
    };
    if (appointments.length) loadNames();
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  const filteredAppointments = appointments.filter((apt) => {
    const patientName = patientNames[apt.patient_id] || '';
    return [patientName, apt.status, apt.notes]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
              <p className="mt-1 text-gray-500">Schedule and follow up with patients</p>
            </div>

            <Link
              to="/appointments/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white shadow-md transition hover:bg-blue-700"
            >
              <Plus size={18} />
              New Appointment
            </Link>
          </div>

          <div className="mt-6 flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <Search className="mr-2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full bg-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const scheduledFor = apt.scheduled_for ? new Date(apt.scheduled_for) : null;
            const healthRecord = parseHealthNotes(apt.notes);
            const visibleHealthSections = healthNoteSections.filter(({ key }) => healthRecord[key]);

            return (
              <div
                key={apt.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                      <CalendarClock size={24} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                          {patientNames[apt.patient_id] || 'Unknown patient'}
                        </h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[apt.status] || statusStyles.scheduled}`}>
                          {formatStatus(apt.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {scheduledFor ? scheduledFor.toLocaleString() : 'No date set'}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserRound size={14} />
                          Patient appointment
                        </div>
                      </div>

                      {visibleHealthSections.length > 0 && (
                        <div className="mt-4 grid max-w-3xl gap-2 text-sm text-gray-600 md:grid-cols-2">
                          {visibleHealthSections.map(({ key, label }) => (
                            <div key={key} className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
                              <span className="block text-xs font-bold uppercase tracking-wide text-gray-400">
                                {label}
                              </span>
                              <span className="mt-1 block whitespace-pre-wrap">{healthRecord[key]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/appointments/${apt.id}/edit`}
                      className="flex items-center gap-1 rounded-xl bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="flex items-center gap-1 rounded-xl bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
