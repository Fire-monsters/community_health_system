// Compare two record versions (ignore metadata fields like updated_at, sync_status)
function detectConflict(serverRecord, clientPayload) {
  // Define fields that should NOT trigger a conflict (e.g., updated_at, created_at, sync_status)
  const ignoreFields = ['updated_at', 'created_at', 'sync_status', 'synced_at'];
  for (const key of Object.keys(clientPayload)) {
    if (ignoreFields.includes(key)) continue;
    if (JSON.stringify(serverRecord[key]) !== JSON.stringify(clientPayload[key])) {
      return true; // meaningful difference
    }
  }
  return false;
}

module.exports = { detectConflict };