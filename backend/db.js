// db.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chr_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,                       // max clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Function to check if tables exist, if not create them from schema.sql
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Check if a core table exists (e.g., 'facilities')
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'facilities'
      );
    `);
    if (!res.rows[0].exists) {
      console.log('Database tables not found. Creating schema...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schemaSql);
      console.log('Schema created successfully.');
    } else {
      console.log('Database schema already exists.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Optional: Add a version tracking table to manage migrations incrementally
async function runMigrations() {
  // For future incremental migrations, implement a simple `schema_migrations` table.
  // For now, initDatabase is sufficient.
  console.log('Migrations skipped (schema.sql applied only if needed).');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

module.exports = {
  pool,
  initDatabase,
  runMigrations,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};