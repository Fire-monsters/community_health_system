import api from './api';
import {
  getPendingOutbox,
  markOutboxSynced,
  markOutboxFailed,
  getLastSyncToken,
  setLastSyncToken,
  putSync,
  deleteSync,
  getById
} from './db';
import { toast } from 'react-toastify';

export async function syncUpload() {
  const pending = await getPendingOutbox();
  if (pending.length === 0) return { uploaded: 0, conflicts: [] };

  const lastSyncToken = await getLastSyncToken();
  const changes = pending.map(item => ({
    table: item.table,
    operation: item.operation,
    record_id: item.record_id,
    payload: item.payload
  }));

  try {
    const response = await api.post('/sync/upload', {
      last_sync_token: lastSyncToken,
      changes
    });

    const data = response.data;
    if (data.status === 'success') {
      for (const item of pending) {
        await markOutboxSynced(item.id);
      }
      return { uploaded: pending.length, conflicts: [] };
    } else if (data.conflicts && data.conflicts.length) {
      // conflicts returned – do NOT mark those items as synced
      const conflictRecordIds = data.conflicts.map(c => c.record_id);
      for (const item of pending) {
        if (conflictRecordIds.includes(item.record_id)) {
          // keep pending, but increment retry? we'll let conflict resolver handle
        } else {
          await markOutboxSynced(item.id);
        }
      }
      return { uploaded: pending.length - conflictRecordIds.length, conflicts: data.conflicts };
    }
    return { uploaded: 0, conflicts: [] };
  } catch (err) {
    console.error('Upload failed', err);
    for (const item of pending) {
      await markOutboxFailed(item.id);
    }
    toast.error('Sync upload failed. Will retry later.');
    throw err;
  }
}

export async function syncDownload() {
  const lastSyncToken = await getLastSyncToken();
  try {
    const response = await api.post('/sync/download', { last_sync_token: lastSyncToken });
    const { records, deleted_records, conflicts, sync_token } = response.data;

    // Merge records (using putSync to avoid re‑queuing)
    for (const [table, items] of Object.entries(records)) {
      for (const item of items) {
        await putSync(table, item);
      }
    }
    // Handle soft deletes
    for (const [table, ids] of Object.entries(deleted_records)) {
      for (const id of ids) {
        await deleteSync(table, id);
      }
    }
    await setLastSyncToken(sync_token);
    return { conflicts };
  } catch (err) {
    console.error('Download failed', err);
    toast.error('Sync download failed');
    throw err;
  }
}

export async function fullSync() {
  const uploadResult = await syncUpload();
  const downloadResult = await syncDownload();
  return { uploadResult, downloadResult };
}

export async function resolveConflict(conflictId, resolution, customPayload = null) {
  const res = await api.post('/sync/resolve', {
    conflict_id: conflictId,
    resolution,
    custom_payload: customPayload
  });
  return res.data;
}