import { ResourceBadge, formatDate } from '../components/StatusBadge';

function formatLiveTime(ts) {
  if (!ts) return 'connecting…';
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function InvestigationLogPage({ log, onReset, onRefresh, logUpdatedAt, resetting }) {
  if (!log) return <div className="page-loading">Loading investigation log…</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Investigation Log</h1>
        <p>{log.scenario}</p>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h2>Workflow State</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="live-badge" title="Updates automatically while this page is open">
              <span className="live-dot" aria-hidden="true" />
              Live · every {logUpdatedAt ? '0.5s' : '…'}
              {logUpdatedAt ? ` · ${formatLiveTime(logUpdatedAt)}` : ''}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={onRefresh} disabled={resetting}>
              Refresh now
            </button>
            <button className="btn btn-sm" onClick={onReset} disabled={resetting}>
              {resetting ? 'Resetting…' : 'Reset Demo'}
            </button>
          </div>
        </div>
        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">B3 — Investigate</div>
              <div className="value">{log.state?.b3_completed ? `Completed ${formatDate(log.state.b3_timestamp)}` : 'Pending'}</div>
            </div>
            <div className="detail-item">
              <div className="label">B4 — Ops Request</div>
              <div className="value">{log.state?.b4_completed ? `Completed ${formatDate(log.state.b4_timestamp)}` : 'Pending'}</div>
            </div>
            <div className="detail-item">
              <div className="label">B5 — Notification</div>
              <div className="value">{log.state?.b5_completed ? `Completed ${formatDate(log.state.b5_timestamp)}` : 'Pending'}</div>
            </div>
            {log.state?.last_ops_request && (
              <div className="detail-item">
                <div className="label">Last Ops Request</div>
                <div className="value"><code>{log.state.last_ops_request.id}</code></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Scenario B Steps</h2>
        </div>
        <div className="panel-body">
          <ul className="timeline">
            {log.steps?.map((step) => (
              <li key={step.step_id}>
                <div className={`step-badge ${step.resource_type === 'AI Agent' ? 'agent' : step.resource_type === 'Digital Worker' ? 'worker' : step.resource_type === 'Human' ? 'human' : 'signal'}`}>
                  {step.step_id}
                </div>
                <div className="step-content">
                  <div className="action">{step.action}</div>
                  <div className="meta">
                    <ResourceBadge type={step.resource_type} />
                    {' '}
                    {step.timestamp ? formatDate(step.timestamp) : 'Not yet executed'}
                    {step.human_gate && ' — Human gate required'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tv-gray-70)', marginTop: 4 }}>
                    {step.detail}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
