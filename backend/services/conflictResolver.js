const { pool } = require('../config/database');
const { conflictStrategies } = require('../config/syncConfig');

async function resolveConflict(conflictId, resolution, customPayload, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Fetch conflict record
    const conflictRes = await client.query(`SELECT * FROM sync_conflicts WHERE id = $1 AND resolution_status = 'pending'`, [conflictId]);
    const conflict = conflictRes.rows[0];
    if (!conflict) throw new Error('Conflict not found or already resolved');
    
    let finalPayload = null;
    if (resolution === 'use_server') {
      finalPayload = conflict.remote_payload;
    } else if (resolution === 'use_client') {
      finalPayload = conflict.local_payload;
    } else if (resolution === 'custom' && customPayload) {
      finalPayload = customPayload;
    } else {
      throw new Error('Invalid resolution or missing custom payload');
    }
    
    // Apply the chosen payload to the actual record
    const table = conflict.table_name;
    const recordId = conflict.record_id;
    // Remove metadata fields that shouldn't be overwritten
    delete finalPayload.updated_at;
    delete finalPayload.created_at;
    delete finalPayload.sync_status;
    const setClause = Object.keys(finalPayload).map((k, i) => `${k}=$${i+2}`).join(', ');
    const values = Object.values(finalPayload);
    await client.query(`UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1`, [recordId, ...values]);
    
    // Mark conflict as resolved
    await client.query(
      `UPDATE sync_conflicts SET resolution_status = 'resolved', resolved_by = $1, resolved_at = NOW() WHERE id = $2`,
      [userId, conflictId]
    );
    
    await client.query('COMMIT');
    return { status: 'resolved', record_id: recordId, table };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { resolveConflict };