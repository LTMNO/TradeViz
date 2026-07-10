import { EOD_LOG as SEED_LOG, buildEodSummary } from './eodScenario.js';

const PENDING_DETAILS = {
  C1: 'Pending — awaiting 4 pm market close trigger from WorkHQ',
  C2: 'Pending — digital worker will pull client activity from TradeViz',
  C3: 'Pending — AI agent will draft end-of-day commentary',
  C4: 'Pending — salesperson must review and approve before send',
  C5: 'Pending — send approved commentary and log delivery',
};

function cloneSteps() {
  return SEED_LOG.map((step) => ({
    ...step,
    timestamp: null,
    detail: PENDING_DETAILS[step.step_id] ?? step.detail,
  }));
}

let steps = cloneSteps();

let eodState = {
  client: 'Millennium Management',
  market_close_at: null,
  last_summary: null,
  draft_commentary: null,
  approved_by: null,
  approved_at: null,
  commentary_id: null,
  sent_at: null,
  workflow_run_id: null,
};

function updateStep(stepId, timestamp, detail) {
  const entry = steps.find((s) => s.step_id === stepId);
  if (entry) {
    entry.timestamp = timestamp;
    entry.detail = detail;
  }
}

export function getEodLog() {
  return {
    scenario: 'End-of-day commentary (C1–C5)',
    steps,
    state: eodState,
  };
}

export function recordMarketClose({ client, run_id } = {}) {
  const now = new Date().toISOString();
  if (client) eodState.client = client;
  if (run_id) eodState.workflow_run_id = run_id;
  eodState.market_close_at = now;
  updateStep('C1', now, `Market close at 4:00 PM ET — EOD workflow started for ${eodState.client}`);
  return getEodLog();
}

export function recordClientActivityPull({ client } = {}) {
  const now = new Date().toISOString();
  const clientName = client ?? eodState.client;
  const summary = buildEodSummary(clientName);
  eodState = {
    ...eodState,
    client: clientName,
    last_summary: summary,
  };
  if (!steps.find((s) => s.step_id === 'C1')?.timestamp) {
    recordMarketClose({ client: clientName });
  }
  updateStep(
    'C2',
    now,
    `Pulled ${summary.summary.trades_today} trades — ${summary.summary.settled} settled, ${summary.summary.open_breaks} open break(s), ${summary.summary.resolved_today} resolved`,
  );
  return { log: getEodLog(), summary };
}

export function recordDraftCommentary({ detail, draft } = {}) {
  const now = new Date().toISOString();
  const text = draft ?? detail ?? 'EOD commentary draft prepared by WorkHQ agent';
  eodState.draft_commentary = text;
  updateStep('C3', now, detail ?? 'AI agent drafted client-facing end-of-day commentary');
  return getEodLog();
}

export function recordHumanApproval({ approved_by, detail } = {}) {
  const now = new Date().toISOString();
  eodState = {
    ...eodState,
    approved_by: approved_by ?? 'Salesperson',
    approved_at: now,
  };
  updateStep(
    'C4',
    now,
    detail ?? `Approved by ${eodState.approved_by} — ready to send to ${eodState.client}`,
  );
  return getEodLog();
}

export function recordSendCommentary({ detail, commentary_id } = {}) {
  const now = new Date().toISOString();
  const id = commentary_id ?? `EOD-${now.slice(0, 10).replace(/-/g, '')}-001`;
  eodState = {
    ...eodState,
    commentary_id: id,
    sent_at: now,
  };
  updateStep(
    'C5',
    now,
    detail ?? `Commentary ${id} sent to ${eodState.client} and logged`,
  );
  return getEodLog();
}

export function recordEodStepUpdate({ step_id, detail, draft, approved_by, commentary_id, client }) {
  switch (step_id) {
    case 'C1':
      return recordMarketClose({ client: client ?? undefined, run_id: detail });
    case 'C2':
      return recordClientActivityPull().log;
    case 'C3':
      return recordDraftCommentary({ detail, draft });
    case 'C4':
      return recordHumanApproval({ approved_by, detail });
    case 'C5':
      return recordSendCommentary({ detail, commentary_id });
    default:
      updateStep(step_id, now, detail ?? `Step ${step_id} completed via WorkHQ`);
      return getEodLog();
  }
}

export function resetEodLog() {
  steps = cloneSteps();
  eodState = {
    client: 'Millennium Management',
    market_close_at: null,
    last_summary: null,
    draft_commentary: null,
    approved_by: null,
    approved_at: null,
    commentary_id: null,
    sent_at: null,
    workflow_run_id: null,
  };
  return getEodLog();
}
