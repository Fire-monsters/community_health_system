import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';

import {
  CheckCircle2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  UserRound
} from 'lucide-react';

import { useState } from 'react';

export default function PatientList() {
  const { patients, loading, deletePatient } = usePatients();

  const [search, setSearch] = useState('');
  const [deletedPatient, setDeletedPatient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(`Delete ${patient.full_name}?`);
    if (!confirmed) return;

    setDeletingId(patient.id);

    try {
      await deletePatient(patient.id);
      setDeletedPatient(patient);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="app-bg flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading patients...
        </p>
      </div>
    );
  }

  const filteredPatients = patients.filter((p) =>
    p.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-10">
      {deletedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-800">
              Patient deleted
            </h2>

            <p className="mt-3 text-gray-500">
              {deletedPatient.full_name} has been removed successfully.
            </p>

            <button
              type="button"
              onClick={() => setDeletedPatient(null)}
              className="mt-8 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Patients
              </h1>

              <p className="text-gray-500 mt-1">
                Community Health Records
              </p>
            </div>

            <Link
              to="/patients/new"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl transition shadow-md"
            >
              <Plus size={18} />
              New Patient
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Search
                className="text-gray-400 mr-2"
                size={18}
              />

              <input
                type="text"
                placeholder="Search patient..."
                className="bg-transparent outline-none w-full"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Patients */}
        <div className="space-y-4">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* Left */}
                <div className="flex items-start gap-4">

                  <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                    <UserRound size={24} />
                  </div>

                  <div>
                    <Link
                      to={`/patients/${p.id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                    >
                      {p.full_name}
                    </Link>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        {p.phone_number || 'No phone'}
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {p.village || 'Unknown village'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">

                  <Link
                    to={`/patients/${p.id}/edit`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    {deletingId === p.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
              <p className="text-gray-500">
                No patients found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
