import { ResourceBadge, formatDate } from '../components/StatusBadge';

export default function InvestigationLogPage({ log, onReset }) {
  if (!log) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Investigation Log</h1>
        <p>{log.scenario}</p>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h2>Workflow State</h2>
          <button className="btn btn-sm" onClick={onReset}>Reset Demo</button>
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
