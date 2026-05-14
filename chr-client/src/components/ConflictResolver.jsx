import { useState } from 'react';
import api from '../services/api';

export default function ConflictResolver({ conflict, onResolved }) {
  const [resolution, setResolution] = useState('use_server');
  const [customPayload, setCustomPayload] = useState('');

  const handleResolve = async () => {
    let payload = null;
    if (resolution === 'custom') {
      try {
        payload = JSON.parse(customPayload);
      } catch (e) {
        alert('Invalid JSON for custom payload');
        return;
      }
    }
    await api.post('/sync/resolve', {
      conflict_id: conflict.conflict_id,
      resolution,
      custom_payload: payload
    });
    onResolved(conflict.conflict_id);
  };

  return (
    <div style={{ border: '1px solid red', margin: '10px', padding: '10px' }}>
      <h4>Conflict in {conflict.table}</h4>
      <div><strong>Client version:</strong> <pre>{JSON.stringify(conflict.client_version, null, 2)}</pre></div>
      <div><strong>Server version:</strong> <pre>{JSON.stringify(conflict.server_version, null, 2)}</pre></div>
      <select value={resolution} onChange={e => setResolution(e.target.value)}>
        <option value="use_server">Use Server Version</option>
        <option value="use_client">Use Client Version</option>
        <option value="custom">Custom Merge</option>
      </select>
      {resolution === 'custom' && (
        <textarea
          rows={5}
          cols={50}
          value={customPayload}
          onChange={e => setCustomPayload(e.target.value)}
          placeholder='{"field": "merged value"}'
        />
      )}
      <button onClick={handleResolve}>Resolve</button>
    </div>
  );
}