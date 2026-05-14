const { pool } = require('../config/database');

async function create(patientData) {
  const { facility_id, patient_number, full_name, date_of_birth, sex, village, phone_number, next_of_kin } = patientData;
  const result = await pool.query(
    `INSERT INTO patients (facility_id, patient_number, full_name, date_of_birth, sex, village, phone_number, next_of_kin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [facility_id, patient_number, full_name, date_of_birth, sex, village, phone_number, next_of_kin]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0];
}

async function findByFacility(facilityId, limit = 50, offset = 0) {
  const result = await pool.query(
    `SELECT * FROM patients WHERE facility_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [facilityId, limit, offset]
  );
  return result.rows;
}

async function update(id, updates) {
  const fields = Object.keys(updates).map((key, idx) => `${key} = $${idx + 2}`).join(', ');
  const values = Object.values(updates);
  const result = await pool.query(
    `UPDATE patients SET ${fields}, updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

async function softDelete(id) {
  const result = await pool.query(
    `UPDATE patients SET deleted_at = NOW() WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = { create, findById, findByFacility, update, softDelete };