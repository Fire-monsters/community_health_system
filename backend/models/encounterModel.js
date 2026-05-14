const { pool } = require('../config/database');

async function create(encounterData) {
  const { patient_id, recorded_by, facility_id, visit_date, visit_type, chief_complaint, diagnosis, treatment_given, notes } = encounterData;
  const result = await pool.query(
    `INSERT INTO encounters (patient_id, recorded_by, facility_id, visit_date, visit_type, chief_complaint, diagnosis, treatment_given, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [patient_id, recorded_by, facility_id, visit_date, visit_type, chief_complaint, diagnosis, treatment_given, notes]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM encounters WHERE id = $1`, [id]);
  return result.rows[0];
}

async function findByPatient(patientId) {
  const result = await pool.query(
    `SELECT * FROM encounters WHERE patient_id = $1 ORDER BY visit_date DESC`,
    [patientId]
  );
  return result.rows;
}

async function update(id, updates) {
  const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
  const values = Object.values(updates);
  const result = await pool.query(
    `UPDATE encounters SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

async function setSyncStatus(id, status) {
  await pool.query(`UPDATE encounters SET sync_status = $1 WHERE id = $2`, [status, id]);
}

module.exports = { create, findById, findByPatient, update, setSyncStatus };