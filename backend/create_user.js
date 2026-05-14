// create_user.js
const bcrypt = require('bcrypt');
const { pool } = require('./config/database');

async function createUser() {
  // Ensure a facility exists
  let facilityId;
  const facRes = await pool.query(`SELECT id FROM facilities LIMIT 1`);
  if (facRes.rows.length === 0) {
    const ins = await pool.query(
      `INSERT INTO facilities (name, district, region) VALUES ('Central Clinic', 'Kampala', 'Central') RETURNING id`
    );
    facilityId = ins.rows[0].id;
    console.log('Created facility:', facilityId);
  } else {
    facilityId = facRes.rows[0].id;
  }

  const username = 'admin1';
  const password = 'Admin123!';
  const hash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (facility_id, full_name, role, username, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (username) DO UPDATE SET
       facility_id = EXCLUDED.facility_id,
       full_name = EXCLUDED.full_name,
       role = EXCLUDED.role,
       password_hash = EXCLUDED.password_hash,
       is_active = TRUE
     RETURNING id, username, role, is_active`,
    [facilityId, 'Admin User', 'admin', username, hash]
  );

  console.log(`User '${result.rows[0].username}' is ready with password '${password}'`);
  await pool.end();
}

createUser().catch(err => {
  console.error(err);
  process.exit(1);
});
