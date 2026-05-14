import { useOfflineSync } from '../hooks/useOfflineSync';

export default function SyncStatus() {
  const { online, isSyncing, lastSync, performSync } = useOfflineSync();
  return (
    <div style={{ padding: '8px', background: online ? '#e8f5e9' : '#ffebee' }}>
      <span>📶 {online ? 'Online' : 'Offline'}</span>
      {isSyncing && <span> 🔄 Syncing...</span>}
      {lastSync && <span> Last sync: {lastSync.toLocaleTimeString()}</span>}
      {online && !isSyncing && (
        <button onClick={performSync} style={{ marginLeft: '10px' }}>Sync Now</button>
      )}
    </div>
  );
}