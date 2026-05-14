import { useSync } from '../contexts/SyncContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import ConflictResolver from '../components/ConflictResolver';

export default function SyncPage() {
  const { conflicts, setConflicts } = useSync();
  const { performSync, isSyncing, lastSync, online } = useOfflineSync();

  const handleConflictResolved = (conflictId) => {
    setConflicts(conflicts.filter(c => c.conflict_id !== conflictId));
    // Optionally re-sync to get updated record
    performSync();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sync Status</h2>
      <div className="bg-gray-100 p-4 rounded">
        <p>Status: {online ? '🟢 Online' : '🔴 Offline'}</p>
        <p>Last sync: {lastSync ? lastSync.toLocaleString() : 'Never'}</p>
        <button onClick={performSync} disabled={isSyncing || !online} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      {conflicts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Conflicts to Resolve</h3>
          {conflicts.map(conflict => (
            <ConflictResolver key={conflict.conflict_id} conflict={conflict} onResolved={handleConflictResolved} />
          ))}
        </div>
      )}
    </div>
  );
}