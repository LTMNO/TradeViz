import { useState, useEffect } from 'react';
import { appPath } from '../appPath';
import { formatDate } from '../components/StatusBadge';

export default function DebugPage() {
  const [logs, setLogs] = useState([]);

  function refresh() {
    fetch(appPath('/api/debug/requests'))
      .then((r) => r.json())
      .then(setLogs);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  function clear() {
    fetch(appPath('/api/debug/requests'), { method: 'DELETE' }).then(refresh);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Request Log</h1>
        <p>Live API request log — useful for verifying Blue Prism webhook calls</p>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className="btn btn-sm" onClick={refresh}>Refresh</button>
        <button className="btn btn-sm" onClick={clear}>Clear</button>
      </div>

      <div className="panel">
        <div className="panel-body flush">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--tv-gray-50)' }}>No requests yet</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td><code>{log.method}</code></td>
                  <td><code>{log.path}</code></td>
                  <td>{log.status ?? '—'}</td>
                  <td>{log.duration_ms != null ? `${log.duration_ms}ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
