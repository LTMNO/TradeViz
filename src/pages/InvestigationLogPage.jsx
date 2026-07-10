import { ResourceBadge, formatDate } from '../components/StatusBadge';

function formatLiveTime(ts) {
  if (!ts) return 'connecting…';
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function resourceClass(type) {
  if (type === 'AI Agent') return 'agent';
  if (type === 'Digital Worker') return 'worker';
  if (type === 'Human') return 'human';
  return 'signal';
}

function deriveStepStatus(step, index, steps) {
  if (step.timestamp) return 'completed';
  const highestCompleted = steps.reduce(
    (max, s, i) => (s.timestamp ? i : max),
    -1,
  );
  if (index === highestCompleted + 1) return 'active';
  return 'pending';
}

function statusLabel(status) {
  if (status === 'completed') return 'Completed';
  if (status === 'active') return 'In progress';
  return 'Pending';
}

export default function InvestigationLogPage({ log, onReset, onRefresh, logUpdatedAt, resetting }) {
  if (!log) return <div className="page-loading">Loading investigation log…</div>;

  const steps = log.steps ?? [];
  const completedCount = steps.filter((s) => s.timestamp).length;
  const progressPct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const allComplete = completedCount === steps.length && steps.length > 0;
  const { state } = log;

  return (
    <div>
      <div className="page-header flow-page-header">
        <div>
          <h1>Investigation Log</h1>
          <p>{log.scenario}</p>
        </div>
        <div className="flow-header-controls">
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

      {allComplete && (
        <div className="fix-banner flow-complete-banner">
          <h3>Workflow resolved</h3>
          <p>
            All five steps completed
            {state?.trade_id ? ` for trade ${state.trade_id}` : ''}
            {state?.last_ops_request?.id ? ` — ops request ${state.last_ops_request.id}` : ''}.
          </p>
        </div>
      )}

      <div className="panel flow-panel">
        <div className="panel-header">
          <h2>Workflow progress</h2>
          <span className="flow-progress-label">
            {completedCount} of {steps.length} steps · {progressPct}%
          </span>
        </div>
        <div className="panel-body flow-panel-body">
          <div className="flow-progress-track" aria-hidden="true">
            <div className="flow-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          {(state?.trade_id || state?.last_ops_request?.id) && (
            <div className="flow-meta-chips">
              {state.trade_id && (
                <span className="flow-chip">
                  Trade <code>{state.trade_id}</code>
                </span>
              )}
              {state.last_ops_request?.id && (
                <span className="flow-chip flow-chip-success">
                  Ops <code>{state.last_ops_request.id}</code>
                </span>
              )}
            </div>
          )}

          <div className="flow-chart" role="list" aria-label="Scenario B workflow steps">
            {steps.map((step, index) => {
              const status = deriveStepStatus(step, index, steps);
              const connectorDone = index > 0 && steps[index - 1].timestamp;
              const connectorPartial = index > 0 && !steps[index - 1].timestamp
                && steps.slice(0, index).some((s) => s.timestamp);

              return (
                <div className="flow-segment" key={step.step_id} role="listitem">
                  {index > 0 && (
                    <div
                      className={`flow-connector ${connectorDone ? 'completed' : ''} ${connectorPartial ? 'partial' : ''} ${status === 'active' ? 'next' : ''}`}
                      aria-hidden="true"
                    >
                      <span className="flow-connector-line" />
                      <span className="flow-connector-arrow">›</span>
                    </div>
                  )}

                  <div className={`flow-node flow-node-${status}`}>
                    <div className={`flow-node-icon ${resourceClass(step.resource_type)}`}>
                      {status === 'completed' ? (
                        <span className="flow-check" aria-hidden="true">✓</span>
                      ) : (
                        <span>{step.step_id}</span>
                      )}
                      {status === 'active' && <span className="flow-node-pulse" aria-hidden="true" />}
                    </div>

                    <div className="flow-node-body">
                      <div className="flow-node-action">{step.action}</div>
                      <div className="flow-node-meta">
                        <ResourceBadge type={step.resource_type} />
                        <span className={`flow-status-pill flow-status-${status}`}>
                          {statusLabel(status)}
                        </span>
                      </div>
                      <div className={`flow-node-detail ${status === 'completed' ? 'done' : ''}`}>
                        {step.timestamp ? (
                          <>
                            <time dateTime={step.timestamp}>{formatDate(step.timestamp)}</time>
                            <span className="flow-detail-text">{step.detail}</span>
                          </>
                        ) : (
                          step.detail
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
