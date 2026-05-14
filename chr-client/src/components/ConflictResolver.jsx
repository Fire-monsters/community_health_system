import { useState } from 'react';
import { resolveConflict } from '../services/syncService';

export default function ConflictResolver({ conflict, onResolved }) {
  const [resolution, setResolution] = useState('use_server');
  const [customPayload, setCustomPayload] = useState('');

  const handleResolve = async () => {
    let payload = null;
    if (resolution === 'custom') {
      try {
        payload = JSON.parse(customPayload);
      } catch (e) {
        alert('Invalid JSON');
        return;
      }
    }
    await resolveConflict(conflict.conflict_id, resolution, payload);
    onResolved(conflict.conflict_id);
  };

  return (
    <div className="border border-red-400 p-4 m-2 rounded bg-red-50">
      <h3 className="font-bold">Conflict in {conflict.table}</h3>
      <div><strong>Client version:</strong> <pre className="text-xs">{JSON.stringify(conflict.client_version, null, 2)}</pre></div>
      <div><strong>Server version:</strong> <pre className="text-xs">{JSON.stringify(conflict.server_version, null, 2)}</pre></div>
      <select value={resolution} onChange={e => setResolution(e.target.value)} className="border p-1 mt-2">
        <option value="use_server">Use Server Version</option>
        <option value="use_client">Use Client Version</option>
        <option value="custom">Custom Merge</option>
      </select>
      {resolution === 'custom' && (
        <textarea rows={4} className="border w-full mt-2" value={customPayload} onChange={e => setCustomPayload(e.target.value)} placeholder='{"field": "merged value"}' />
      )}
      <button onClick={handleResolve} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">Resolve</button>
    </div>
  );
}