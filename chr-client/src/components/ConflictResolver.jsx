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
      } catch {
        alert('Invalid JSON');
        return;
      }
    }
    await resolveConflict(conflict.conflict_id, resolution, payload);
    onResolved(conflict.conflict_id);
  };

  return (
    <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 p-4">
      <h3 className="font-bold text-gray-800">Conflict in {conflict.table}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <strong className="text-sm text-gray-700">Client version</strong>
          <pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-white p-3 text-xs text-gray-600">{JSON.stringify(conflict.client_version, null, 2)}</pre>
        </div>
        <div>
          <strong className="text-sm text-gray-700">Server version</strong>
          <pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-white p-3 text-xs text-gray-600">{JSON.stringify(conflict.server_version, null, 2)}</pre>
        </div>
      </div>
      <select value={resolution} onChange={e => setResolution(e.target.value)} className="mt-4 w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
        <option value="use_server">Use Server Version</option>
        <option value="use_client">Use Client Version</option>
        <option value="custom">Custom Merge</option>
      </select>
      {resolution === 'custom' && (
        <textarea rows={4} className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={customPayload} onChange={e => setCustomPayload(e.target.value)} placeholder='{"field": "merged value"}' />
      )}
      <button onClick={handleResolve} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Resolve</button>
    </div>
  );
}
