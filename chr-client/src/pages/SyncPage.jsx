import { useSync } from '../contexts/SyncContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import ConflictResolver from '../components/ConflictResolver';
import { CheckCircle2, CloudOff, RefreshCw, Wifi } from 'lucide-react';

export default function SyncPage() {
  const { conflicts, setConflicts } = useSync();
  const { performSync, isSyncing, lastSync, online } = useOfflineSync();

  const handleConflictResolved = (conflictId) => {
    setConflicts(conflicts.filter(c => c.conflict_id !== conflictId));
    // Optionally re-sync to get updated record
    performSync();
  };

  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-8 text-center shadow-lg shadow-slate-200/70">
          <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl ${online ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {online ? <Wifi size={34} /> : <CloudOff size={34} />}
          </div>

          <h1 className="text-3xl font-bold text-gray-800">Sync Status</h1>
          <p className="mt-2 text-gray-500">
            {online ? 'Your device is online and ready to sync.' : 'You are offline. Sync will resume when connection returns.'}
          </p>

          <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
              <p className="text-sm font-semibold text-gray-500">Connection</p>
              <div className="mt-2 flex items-center gap-2 font-semibold text-gray-800">
                {online ? <CheckCircle2 className="text-green-600" size={18} /> : <CloudOff className="text-red-600" size={18} />}
                {online ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
              <p className="text-sm font-semibold text-gray-500">Last sync</p>
              <p className="mt-2 font-semibold text-gray-800">
                {lastSync ? lastSync.toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          <button
            onClick={performSync}
            disabled={isSyncing || !online}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

      {conflicts.length > 0 && (
        <div className="mt-6 rounded-3xl border border-white/70 bg-white/95 p-6 shadow-lg shadow-slate-200/70">
          <h2 className="text-xl font-bold text-gray-800">Conflicts to Resolve</h2>
          {conflicts.map(conflict => (
            <ConflictResolver key={conflict.conflict_id} conflict={conflict} onResolved={handleConflictResolved} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
