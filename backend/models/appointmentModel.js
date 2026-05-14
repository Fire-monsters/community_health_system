const { pool } = require('../config/database');

const writableFields = [
  'patient_id',
  'facility_id',
  'scheduled_for',
  'status',
  'notes'
];

function normalizeAppointment(appointmentData) {
  return {
    ...appointmentData,
    scheduled_for: appointmentData.scheduled_for || null,
    status: appointmentData.status || 'scheduled',
    notes: appointmentData.notes || null
  };
}

async function create(appointmentData) {
  const {
    id,
    patient_id,
    facility_id,
    scheduled_for,
    status,
    notes
  } = normalizeAppointment(appointmentData);

  if (id) {
    const result = await pool.query(
      `INSERT INTO appointments (id, patient_id, facility_id, scheduled_for, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, patient_id, facility_id, scheduled_for, status, notes]
    );
    return result.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO appointments (patient_id, facility_id, scheduled_for, status, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [patient_id, facility_id, scheduled_for, status, notes]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT * FROM appointments WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function findByFacility(facilityId, limit = 100, offset = 0) {
  const result = await pool.query(
    `SELECT * FROM appointments
     WHERE facility_id = $1
     ORDER BY scheduled_for ASC
     LIMIT $2 OFFSET $3`,
    [facilityId, limit, offset]
  );
  return result.rows;
}

async function update(id, updates) {
  const cleaned = normalizeAppointment(updates);
  const entries = writableFields
    .filter((key) => cleaned[key] !== undefined)
    .map((key) => [key, cleaned[key]]);

  if (entries.length === 0) {
    return findById(id);
  }

  const fields = entries.map(([key], idx) => `${key} = $${idx + 2}`).join(', ');
  const values = entries.map(([, value]) => value);
  const result = await pool.query(
    `UPDATE appointments SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    `DELETE FROM appointments WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = { create, findById, findByFacility, update, remove };
