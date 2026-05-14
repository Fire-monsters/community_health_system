const { pool } = require('../config/database');
const { conflictStrategies } = require('../config/syncConfig');
const { detectConflict } = require('../utils/conflictDetection');

// Helper: get current server version of a record
async function getServerRecord(table, recordId) {
  const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [recordId]);
  return res.rows[0];
}

// Helper: insert conflict into sync_conflicts
async function createConflict(table, recordId, localPayload, remotePayload) {
  const res = await pool.query(
    `INSERT INTO sync_conflicts (table_name, record_id, local_payload, remote_payload, resolution_status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id`,
    [table, recordId, localPayload, remotePayload]
  );
  return res.rows[0].id;
}

// Apply a single change with conflict detection
async function applyChange(change, facilityId, lastSyncToken) {
  const { table, operation, record_id, payload } = change;
  const serverRecord = await getServerRecord(table, record_id);
  
  if (operation === 'INSERT') {
    if (!serverRecord) {
      // Insert new record – ensure facility_id matches (security)
      await pool.query(`INSERT INTO ${table} SELECT * FROM jsonb_populate_record(NULL::${table}, $1)`, [JSON.stringify(payload)]);
      return { applied: true };
    } else {
      // Record already exists – conflict
      const conflictId = await createConflict(table, record_id, payload, serverRecord);
      return { applied: false, conflictId };
    }
  }
  
  if (operation === 'UPDATE') {
    if (!serverRecord) {
      // Client thinks update but server doesn't have it – treat as conflict
      const conflictId = await createConflict(table, record_id, payload, null);
      return { applied: false, conflictId };
    }
    // Check if server record was updated after client's last sync
    const serverUpdatedAt = new Date(serverRecord.updated_at);
    const clientLastSync = new Date(lastSyncToken);
    if (serverUpdatedAt > clientLastSync) {
      // Possible conflict – check actual data differences
      const hasConflict = detectConflict(serverRecord, payload);
      if (hasConflict) {
        const conflictId = await createConflict(table, record_id, payload, serverRecord);
        return { applied: false, conflictId };
      }
    }
    // No conflict – apply update (but restrict facility_id change if needed)
    await pool.query(`UPDATE ${table} SET ${Object.keys(payload).map((k, i) => `${k}=$${i+2}`).join(', ')} WHERE id = $1`, [record_id, ...Object.values(payload)]);
    return { applied: true };
  }
  
  if (operation === 'DELETE') {
    // Soft delete only if server record exists and not already deleted
    if (serverRecord && !serverRecord.deleted_at) {
      await pool.query(`UPDATE ${table} SET deleted_at = NOW() WHERE id = $1`, [record_id]);
    }
    return { applied: true };
  }
  
  return { applied: false, error: 'Unknown operation' };
}

// Main upload function
async function applyChanges(facilityId, lastSyncToken, changes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = { applied: [], conflicts: [] };
    for (const change of changes) {
      // Security: ensure the change's facility_id matches the requesting facility
      // This requires that payload includes facility_id for relevant tables.
      if (change.payload && change.payload.facility_id && change.payload.facility_id !== facilityId) {
        continue; // skip – possible tampering
      }
      const result = await applyChange(change, facilityId, lastSyncToken);
      if (result.applied) {
        results.applied.push(change.record_id);
      } else if (result.conflictId) {
        results.conflicts.push({
          table: change.table,
          record_id: change.record_id,
          conflict_id: result.conflictId,
          client_version: change.payload,
          server_version: await getServerRecord(change.table, change.record_id)
        });
      }
    }
    await client.query('COMMIT');
    return { status: results.conflicts.length ? 'partial' : 'success', applied: results.applied.length, conflicts: results.conflicts };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getDelta(facilityId, lastSyncToken) {
  // Fetch all records from relevant tables that have been updated after lastSyncToken
  // and belong to the facility (either directly or via patient join)
  const tables = ['patients', 'encounters', 'appointments', 'prescriptions', 'referrals', 'vitals'];
  const result = { records: {}, deleted_records: {} };
  
  for (const table of tables) {
    let query = '';
    if (table === 'patients') {
      query = `SELECT * FROM patients WHERE facility_id = $1 AND (updated_at > $2 OR deleted_at > $2)`;
    } else if (table === 'encounters') {
      query = `SELECT e.* FROM encounters e JOIN patients p ON e.patient_id = p.id WHERE p.facility_id = $1 AND (e.updated_at > $2 OR e.deleted_at > $2)`;
    } else if (table === 'appointments') {
      query = `SELECT a.* FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE p.facility_id = $1 AND a.updated_at > $2`;
    } // similarly for others – simplified for brevity
    else {
      continue;
    }
    const res = await pool.query(query, [facilityId, lastSyncToken]);
    // Separate active and deleted (if table supports soft delete)
    const active = res.rows.filter(r => !r.deleted_at);
    const deleted = res.rows.filter(r => r.deleted_at).map(r => r.id);
    if (active.length) result.records[table] = active;
    if (deleted.length) result.deleted_records[table] = deleted;
  }
  
  // Also fetch pending conflicts for this facility
  const conflictQuery = `
    SELECT c.* FROM sync_conflicts c
    JOIN patients p ON c.record_id = p.id AND c.table_name = 'patients'
    WHERE p.facility_id = $1 AND c.resolution_status = 'pending'
  `; // extend for other tables similarly
  const conflictsRes = await pool.query(conflictQuery, [facilityId]);
  result.conflicts = conflictsRes.rows;
  
  result.sync_token = new Date().toISOString();
  return result;
}

module.exports = { applyChanges, getDelta };

