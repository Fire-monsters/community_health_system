import React, { createContext, useState } from 'react';

export const SyncContext = createContext();

export function SyncProvider({ children }) {
  const [isSyncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  return (
    <SyncContext.Provider value={{
      isSyncing, setSyncing,
      lastSync, setLastSync,
      conflicts, setConflicts
    }}>
      {children}
    </SyncContext.Provider>
  );
}