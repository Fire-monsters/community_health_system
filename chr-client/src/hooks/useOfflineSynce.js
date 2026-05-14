import { useEffect, useState, useContext } from 'react';
import { fullSync } from '../services/syncService';
import { SyncContext } from '../contexts/SyncContext';

export function useOfflineSync() {
  const { isSyncing, setSyncing, lastSync, setLastSync, conflicts, setConflicts } = useContext(SyncContext);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      // Trigger sync automatically when coming online
      performSync();
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const performSync = async () => {
    if (!online || isSyncing) return;
    setSyncing(true);
    try {
      const result = await fullSync();
      if (result.downloadResult.conflicts && result.downloadResult.conflicts.length) {
        setConflicts(result.downloadResult.conflicts);
      }
      setLastSync(new Date());
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncing(false);
    }
  };

  return { online, isSyncing, performSync, lastSync, conflicts };
}