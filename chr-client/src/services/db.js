import { openDB } from 'idb';

const DB_NAME = 'chr_db';
const DB_VERSION = 2;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Patients store
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
        patientStore.createIndex('facility_id', 'facility_id');
        patientStore.createIndex('full_name', 'full_name');
        patientStore.createIndex('updated_at', 'updated_at');
      }
      // Encounters store
      if (!db.objectStoreNames.contains('encounters')) {
        const encStore = db.createObjectStore('encounters', { keyPath: 'id' });
        encStore.createIndex('patient_id', 'patient_id');
        encStore.createIndex('visit_date', 'visit_date');
        encStore.createIndex('updated_at', 'updated_at');
      }
      // Vitals store
      if (!db.objectStoreNames.contains('vitals')) {
        const vitStore = db.createObjectStore('vitals', { keyPath: 'id' });
        vitStore.createIndex('encounter_id', 'encounter_id');
      }
      // Appointments store
      if (!db.objectStoreNames.contains('appointments')) {
        const aptStore = db.createObjectStore('appointments', { keyPath: 'id' });
        aptStore.createIndex('patient_id', 'patient_id');
        aptStore.createIndex('scheduled_for', 'scheduled_for');
        aptStore.createIndex('status', 'status');
      }
      // Prescriptions store
      if (!db.objectStoreNames.contains('prescriptions')) {
        const rxStore = db.createObjectStore('prescriptions', { keyPath: 'id' });
        rxStore.createIndex('encounter_id', 'encounter_id');
      }
      // Referrals store
      if (!db.objectStoreNames.contains('referrals')) {
        const refStore = db.createObjectStore('referrals', { keyPath: 'id' });
        refStore.createIndex('patient_id', 'patient_id');
      }
      // Outbox (pending changes)
      if (!db.objectStoreNames.contains('outbox')) {
        const outboxStore = db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
        outboxStore.createIndex('status', 'status');
      }
      // Metadata
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    }
  });
}

// ----- Generic CRUD (adds to outbox) -----
export async function put(storeName, record) {
  const db = await initDB();
  const existing = await db.get(storeName, record.id);
  const operation = existing ? 'UPDATE' : 'INSERT';
  await db.put(storeName, record);
  await addToOutbox(storeName, operation, record.id, record);
  return record;
}

export async function remove(storeName, id) {
  const db = await initDB();
  const record = await db.get(storeName, id);
  if (record) {
    await db.delete(storeName, id);
    await addToOutbox(storeName, 'DELETE', id, record);
  }
}

export async function getById(storeName, id) {
  const db = await initDB();
  return db.get(storeName, id);
}

export async function getAll(storeName) {
  const db = await initDB();
  return db.getAll(storeName);
}

export async function getAllFromIndex(storeName, indexName, value) {
  const db = await initDB();
  return db.getAllFromIndex(storeName, indexName, value);
}

// ----- Sync‑only operations (do NOT add to outbox) -----
export async function putSync(storeName, record) {
  const db = await initDB();
  await db.put(storeName, record);
}

export async function deleteSync(storeName, id) {
  const db = await initDB();
  await db.delete(storeName, id);
}

// ----- Outbox management -----
async function addToOutbox(table, operation, recordId, payload) {
  const db = await initDB();
  const outboxItem = {
    table,
    operation,
    record_id: recordId,
    payload,
    status: 'pending',
    created_at: new Date().toISOString(),
    retry_count: 0
  };
  await db.add('outbox', outboxItem);
}

export async function getPendingOutbox() {
  const db = await initDB();
  const all = await db.getAll('outbox');
  return all.filter(item => item.status === 'pending');
}

export async function markOutboxSynced(id) {
  const db = await initDB();
  const item = await db.get('outbox', id);
  if (item) {
    item.status = 'synced';
    await db.put('outbox', item);
  }
}

export async function markOutboxFailed(id) {
  const db = await initDB();
  const item = await db.get('outbox', id);
  if (item) {
    item.status = 'failed';
    item.retry_count += 1;
    await db.put('outbox', item);
  }
}

export async function clearSyncedOutbox() {
  const db = await initDB();
  const all = await db.getAll('outbox');
  const synced = all.filter(item => item.status === 'synced');
  for (const item of synced) {
    await db.delete('outbox', item.id);
  }
}

// ----- Metadata -----
export async function getLastSyncToken() {
  const db = await initDB();
  const meta = await db.get('metadata', 'last_sync_token');
  return meta ? meta.value : '1970-01-01T00:00:00.000Z';
}

export async function setLastSyncToken(token) {
  const db = await initDB();
  await db.put('metadata', { key: 'last_sync_token', value: token });
}

export async function getFacilityId() {
  const db = await initDB();
  const meta = await db.get('metadata', 'facility_id');
  return meta ? meta.value : null;
}

export async function setFacilityId(facilityId) {
  const db = await initDB();
  await db.put('metadata', { key: 'facility_id', value: facilityId });
}

export async function clearAllData() {
  const db = await initDB();
  const stores = ['patients', 'encounters', 'vitals', 'appointments', 'prescriptions', 'referrals', 'outbox', 'metadata'];
  for (const store of stores) {
    await db.clear(store);
  }
}