import { useEffect, useRef } from 'react';
import { ResourceBadge, formatDate } from './StatusBadge';
import DemoRunStrip from './DemoRunStrip';

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
  if (status === 'awaiting') return 'Awaiting approval';
  return 'Pending';
}

function FlowConnector({ index, connectorDone, connectorPartial, isNext }) {
  const state = connectorDone
    ? 'completed'
    : connectorPartial
      ? 'partial'
      : isNext
        ? 'next'
        : 'pending';
  const gradientId = `flow-conn-${index}`;

  return (
    <div className={`flow-connector flow-connector-${state}`} aria-hidden="true">
      <svg className="flow-connector-svg" viewBox="0 0 48 16" preserveAspectRatio="none">
        {(state === 'partial' || state === 'next') && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {state === 'partial' ? (
                <>
                  <stop offset="0%" stopColor="var(--tv-gray-30)" />
                  <stop offset="100%" stopColor="var(--tv-green)" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="var(--tv-green)" />
                  <stop offset="100%" stopColor="var(--tv-gray-30)" />
                </>
              )}
            </linearGradient>
          </defs>
        )}
        <rect
          x="0"
          y="6"
          width="30"
          height="4"
          rx="2"
          fill={state === 'partial' || state === 'next' ? `url(#${gradientId})` : 'currentColor'}
        />
        <path d="M30 1.5 L46 8 L30 14.5 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function WorkflowLogView({
  title,
  log,
  onReset,
  onRefresh,
  logUpdatedAt,
  resetting,
  livePolling = false,
  onLivePollingChange,
  activeScenario,
  onNavigate,
  demoActivePage,
  completeTitle = 'Workflow resolved',
  completeMessage,
  metaChips = [],
  flowAriaLabel = 'Workflow steps',
}) {
  const flowChartRef = useRef(null);
  const activeStepRef = useRef(null);

  if (!log) return <div className="page-loading">Loading workflow log…</div>;

  const steps = log.steps ?? [];
  const completedCount = steps.filter((s) => s.timestamp).length;
  const progressPct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const allComplete = completedCount === steps.length && steps.length > 0;
  const { state } = log;

  const highestCompleted = steps.reduce(
    (max, s, i) => (s.timestamp ? i : max),
    -1,
  );
  const activeStep = highestCompleted >= 0 ? steps[highestCompleted + 1] : steps[0];
  const awaitingApproval = activeStep?.human_gate && !activeStep?.timestamp;

  useEffect(() => {
    if (!activeStepRef.current || !flowChartRef.current) return;
    const chart = flowChartRef.current;
    const node = activeStepRef.current;
    const chartRect = chart.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const offset = nodeRect.left - chartRect.left - chartRect.width / 2 + nodeRect.width / 2;
    chart.scrollTo({ left: chart.scrollLeft + offset, behavior: 'smooth' });
  }, [completedCount, awaitingApproval, logUpdatedAt]);

  const resolvedCompleteMessage = completeMessage ?? (
    allComplete
      ? `All ${steps.length} steps completed.`
      : null
  );

  return (
    <div>
      {activeScenario && onNavigate && (
        <DemoRunStrip
          scenario={activeScenario}
          activePage={demoActivePage ?? activeScenario.logPage}
          onNavigate={onNavigate}
          compact
        />
      )}

      <div className="page-header flow-page-header">
        <div>
          <h1>{title}</h1>
          <p>{log.scenario}</p>
        </div>
        <div className="flow-header-controls">
          <button
            type="button"
            className={`live-toggle ${livePolling ? 'live-toggle-on' : 'live-toggle-off'}`}
            onClick={() => onLivePollingChange?.(!livePolling)}
            title={livePolling
              ? 'Live refresh on (0.5s) — click to pause polling'
              : 'Live refresh off — click to enable for demo'}
            aria-pressed={livePolling}
          >
            <span className={`live-dot ${livePolling ? '' : 'live-dot-off'}`} aria-hidden="true" />
            {livePolling
              ? `Live · 0.5s${logUpdatedAt ? ` · ${formatLiveTime(logUpdatedAt)}` : ''}`
              : 'Live off'}
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onRefresh} disabled={resetting}>
            Refresh now
          </button>
          <button
            className="btn btn-sm"
            onClick={onReset}
            disabled={resetting}
            title="Reset Scenarios A, B, and C to pending"
          >
            {resetting ? 'Resetting…' : 'Reset All Demos'}
          </button>
        </div>
      </div>

      {allComplete && resolvedCompleteMessage && (
        <div className="fix-banner flow-complete-banner">
          <h3>{completeTitle}</h3>
          <p>{resolvedCompleteMessage}</p>
        </div>
      )}

      {awaitingApproval && (
        <div className="flow-awaiting-banner" role="status">
          <span className="flow-awaiting-icon" aria-hidden="true">⏸</span>
          <div>
            <strong>{activeStep.step_id} — Awaiting human approval</strong>
            <p>
              WorkHQ is paused before the approve step. Narrate the draft, then watch this node turn green when approval is logged.
            </p>
          </div>
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

          {metaChips.length > 0 && (
            <div className="flow-meta-chips">
              {metaChips.map((chip) => (
                <span
                  key={chip.key}
                  className={`flow-chip ${chip.success ? 'flow-chip-success' : ''}`}
                >
                  <span>{chip.label}</span>
                  {chip.code ? <code>{chip.code}</code> : null}
                </span>
              ))}
            </div>
          )}

          <div className="flow-chart" ref={flowChartRef} role="list" aria-label={flowAriaLabel}>
            {steps.map((step, index) => {
              const baseStatus = deriveStepStatus(step, index, steps);
              const status = step.human_gate && baseStatus === 'active' && !step.timestamp
                ? 'awaiting'
                : baseStatus;
              const connectorDone = index > 0 && steps[index - 1].timestamp;
              const connectorPartial = index > 0 && !steps[index - 1].timestamp
                && steps.slice(0, index).some((s) => s.timestamp);
              const isActiveStep = step.step_id === activeStep?.step_id;

              return (
                <div
                  className="flow-segment"
                  key={step.step_id}
                  role="listitem"
                  ref={isActiveStep ? activeStepRef : undefined}
                >
                  {index > 0 && (
                    <FlowConnector
                      index={index}
                      connectorDone={connectorDone}
                      connectorPartial={connectorPartial}
                      isNext={status === 'active' || status === 'awaiting'}
                    />
                  )}

                  <div className={`flow-node flow-node-${status} ${step.human_gate ? 'flow-node-human-gate' : ''}`}>
                    <div className={`flow-node-icon ${resourceClass(step.resource_type)}`}>
                      {status === 'completed' ? (
                        <span className="flow-check" aria-hidden="true">✓</span>
                      ) : (
                        <span>{step.step_id}</span>
                      )}
                      {(status === 'active' || status === 'awaiting') && (
                        <span className="flow-node-pulse" aria-hidden="true" />
                      )}
                    </div>

                    <div className="flow-node-body">
                      <div className="flow-node-action">{step.action}</div>
                      <div className="flow-node-meta">
                        <ResourceBadge type={step.resource_type} />
                        <span className={`flow-status-pill flow-status-${status}`}>
                          {statusLabel(status)}
                        </span>
                      </div>
                      {step.human_gate && !step.timestamp && (
                        <div className="flow-human-gate-note">Human gate — client-facing</div>
                      )}
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

      {state?.last_summary && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h2>Client activity snapshot (C2)</h2>
          </div>
          <div className="panel-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Trades today</div>
                <div className="value">{state.last_summary.summary?.trades_today ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Settled</div>
                <div className="value">{state.last_summary.summary?.settled ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Open breaks</div>
                <div className="value">{state.last_summary.summary?.open_breaks ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Resolved today</div>
                <div className="value">{state.last_summary.summary?.resolved_today ?? '—'}</div>
              </div>
            </div>
            {state.last_summary.highlights?.length > 0 && (
              <ul className="eod-highlights">
                {state.last_summary.highlights.map((h) => (
                  <li key={h.text}>{h.text}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {state?.draft_commentary && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h2>Draft commentary (C3)</h2>
          </div>
          <div className="panel-body">
            <pre className="eod-commentary-draft">{state.draft_commentary}</pre>
          </div>
        </div>
      )}

      {state?.last_price && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h2>Price snapshot (S3)</h2>
          </div>
          <div className="panel-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Instrument</div>
                <div className="value">{state.last_price.instrument ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Price</div>
                <div className="value">{state.last_price.price ?? '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Yield</div>
                <div className="value">{state.last_price.yield_pct != null ? `${state.last_price.yield_pct}%` : '—'}</div>
              </div>
              <div className="detail-item">
                <div className="label">Source</div>
                <div className="value">{state.last_price.source ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {state?.draft_reply && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h2>Draft reply (S4)</h2>
          </div>
          <div className="panel-body">
            <pre className="eod-commentary-draft">{state.draft_reply}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
