import { useOfflineSync } from '../hooks/useOfflineSync';

export default function SyncStatus() {
  const { online, isSyncing, lastSync, performSync } = useOfflineSync();
  return (
    <div className={`p-2 text-sm flex justify-between items-center ${online ? 'bg-green-100' : 'bg-red-100'}`}>
      <span>{online ? '🟢 Online' : '🔴 Offline'}</span>
      {isSyncing && <span>🔄 Syncing...</span>}
      {lastSync && <span>Last sync: {lastSync.toLocaleTimeString()}</span>}
      {online && !isSyncing && (
        <button onClick={performSync} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
          Sync Now
        </button>
      )}
    </div>
  );
}