import { useState } from 'react';
import { Link } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

import { usePatients } from '../hooks/usePatients';

import { getFacilityId } from '../services/db';

import {
  ArrowLeft,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Users,
  CalendarDays
} from 'lucide-react';

function formatDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

function buildInitialForm(existingPatient) {
  if (existingPatient) {
    return {
      ...existingPatient,
      full_name: existingPatient.full_name || '',
      date_of_birth: formatDateInput(existingPatient.date_of_birth),
      sex: existingPatient.sex || 'female',
      village: existingPatient.village || '',
      phone_number: existingPatient.phone_number || '',
      next_of_kin: existingPatient.next_of_kin || '',
      patient_number: existingPatient.patient_number || `OFF-${Date.now()}`
    };
  }

  return {
    id: uuidv4(),
    full_name: '',
    date_of_birth: '',
    sex: 'female',
    village: '',
    phone_number: '',
    next_of_kin: '',
    patient_number: `OFF-${Date.now()}`
  };
}

export default function PatientForm({
  existingPatient,
  onSuccess
}) {
  const { addPatient, updatePatient } = usePatients();
  const [savedPatient, setSavedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(() => buildInitialForm(existingPatient));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (existingPatient) {
        const updated = await updatePatient(existingPatient.id, form);
        setSavedPatient(updated);
      } else {
        const facilityId = await getFacilityId();

        const created = await addPatient({
          ...form,
          facility_id: facilityId
        });

        setSavedPatient(created);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Patient could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (savedPatient) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-green-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 size={34} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-800">
            {existingPatient ? 'Patient updated' : 'Patient created'}
          </h1>

          <p className="mt-3 text-gray-500">
            {savedPatient.full_name} has been saved successfully.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/patients/${savedPatient.id}`}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              View patient
            </Link>

            <Link
              to="/patients"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              <ArrowLeft size={18} />
              Patient list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {existingPatient
                ? 'Edit Patient'
                : 'Register Patient'}
            </h1>

            <p className="text-gray-500 mt-2">
              Enter patient information
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3">
                <User
                  className="text-gray-400 mr-2"
                  size={18}
                />

                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      full_name: e.target.value
                    })
                  }
                  className="w-full outline-none"
                  placeholder="Patient full name"
                />
              </div>
            </div>

            {/* DOB + Sex */}
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date of Birth
                </label>

                <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3">
                  <CalendarDays
                    className="text-gray-400 mr-2"
                    size={18}
                  />

                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date_of_birth: e.target.value
                      })
                    }
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sex
                </label>

                <select
                  value={form.sex}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sex: e.target.value
                    })
                  }
                  className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none"
                >
                  <option value="female">
                    Female
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>
            </div>

            {/* Village */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Village
              </label>

              <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3">
                <MapPin
                  className="text-gray-400 mr-2"
                  size={18}
                />

                <input
                  type="text"
                  value={form.village}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      village: e.target.value
                    })
                  }
                  className="w-full outline-none"
                  placeholder="Village"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3">
                <Phone
                  className="text-gray-400 mr-2"
                  size={18}
                />

                <input
                  type="text"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone_number: e.target.value
                    })
                  }
                  className="w-full outline-none"
                  placeholder="+256..."
                />
              </div>
            </div>

            {/* NOK */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Next of Kin
              </label>

              <div className="mt-2 flex items-center border border-gray-200 rounded-2xl px-4 py-3">
                <Users
                  className="text-gray-400 mr-2"
                  size={18}
                />

                <input
                  type="text"
                  value={form.next_of_kin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      next_of_kin: e.target.value
                    })
                  }
                  className="w-full outline-none"
                  placeholder="Next of kin"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-md"
            >
              {saving
                ? 'Saving...'
                : existingPatient
                  ? 'Update Patient'
                  : 'Save Patient'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
