const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, facility_id: user.facility_id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function login(username, password) {
  const result = await pool.query(
    `SELECT id, facility_id, role, username, password_hash, is_active FROM users WHERE username = $1`,
    [username]
  );
  const user = result.rows[0];
  if (!user || !user.is_active) return null;
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;
  // update last_login
  await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);
  const token = generateToken(user);
  return { user: { id: user.id, facility_id: user.facility_id, role: user.role, username: user.username }, token };
}

module.exports = { hashPassword, verifyPassword, generateToken, login };