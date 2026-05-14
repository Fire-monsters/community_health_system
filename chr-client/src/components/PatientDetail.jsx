import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEncounters } from '../hooks/useEncounters';
import { usePatients } from '../hooks/usePatients';

import {
  Phone,
  MapPin,
  Calendar,
  UserRound,
  Plus,
  ClipboardList,
  Pencil
} from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const { encounters } = useEncounters(id);
  const { getPatient } = usePatients();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const p = await getPatient(id);
        if (active) setPatient(p);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [getPatient, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Loading patient...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Patient not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Left */}
          <div className="flex items-start gap-5">
            <div className="bg-blue-100 text-blue-600 p-5 rounded-2xl">
              <UserRound size={32} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {patient.full_name}
              </h1>

              <p className="text-gray-500 mt-1">
                Patient #: {patient.patient_number}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-gray-600">

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {patient.phone_number || 'No phone'}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {patient.village || 'Unknown village'}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {patient.date_of_birth || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">

            <Link
              to={`/patients/${id}/edit`}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <Link
              to={`/encounters/new?patient_id=${id}`}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl"
            >
              <Plus size={16} />
              New Encounter
            </Link>

            <Link
              to={`/appointments/new?patient_id=${id}`}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl"
            >
              <Calendar size={16} />
              Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Encounters */}
      <div className="mt-8">

        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Encounter History
          </h2>
        </div>

        <div className="space-y-4">
          {encounters.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {e.visit_type}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    {e.visit_date}
                  </p>

                  <p className="mt-3 text-gray-700">
                    <span className="font-medium">
                      Diagnosis:
                    </span>{' '}
                    {e.diagnosis}
                  </p>
                </div>

                <Link
                  to={`/encounters/${e.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
