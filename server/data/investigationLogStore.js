import { INVESTIGATION_LOG as SEED_LOG } from './scenario.js';

const PENDING_DETAILS = {
  B1: 'Pending — awaiting failing-trade alert from WorkHQ',
  B2: 'Pending — AI agent will interpret the settlement break',
  B3: 'Pending — retrieve trade, compare SSIs, identify fix',
  B4: 'Pending — internal operational action, no human gate',
  B5: 'Pending — after-the-fact notification, no approval required',
};

function cloneSteps() {
  return SEED_LOG.map((step) => ({
    ...step,
    timestamp: null,
    detail: PENDING_DETAILS[step.step_id] ?? step.detail,
  }));
}

let steps = cloneSteps();

let investigationState = {
  b3_completed: false,
  b4_completed: false,
  b5_completed: false,
  b3_timestamp: null,
  b4_timestamp: null,
  b5_timestamp: null,
  last_investigation: null,
  last_ops_request: null,
  trade_id: null,
  workflow_run_id: null,
};

function updateStep(stepId, timestamp, detail) {
  const entry = steps.find((s) => s.step_id === stepId);
  if (entry) {
    entry.timestamp = timestamp;
    entry.detail = detail;
  }
}

export function getInvestigationLog() {
  return {
    scenario: 'Millennium failing trade (B1–B5)',
    steps,
    state: investigationState,
  };
}

export function recordAlert(alert = {}) {
  const now = new Date().toISOString();
  const tradeId = alert.trade_id ?? 'unknown';
  investigationState.trade_id = tradeId;
  investigationState.workflow_run_id = alert.alert_id ?? null;

  updateStep(
    'B1',
    now,
    `Alert ${alert.alert_id ?? '—'}: ${alert.client ?? 'Unknown client'} trade ${tradeId} failed — ${alert.break_type ?? 'break'}`,
  );

  return getInvestigationLog();
}

export function recordAgentStep({ break_type, trade_id, summary } = {}) {
  const now = new Date().toISOString();
  updateStep(
    'B2',
    now,
    summary
      ?? `Classified as ${break_type ?? 'SSI_MISMATCH'} — settlement break interpreted by WorkHQ agent`,
  );
  if (trade_id) investigationState.trade_id = trade_id;
  return getInvestigationLog();
}

export function recordInvestigation(result, detail) {
  const now = new Date().toISOString();
  if (!steps.find((s) => s.step_id === 'B2')?.timestamp) {
    recordAgentStep({
      break_type: result.break_type,
      trade_id: result.trade_id,
    });
  }

  investigationState = {
    ...investigationState,
    b3_completed: true,
    b3_timestamp: now,
    last_investigation: result,
    trade_id: result.trade_id,
  };
  updateStep('B3', now, detail);
  return getInvestigationLog();
}

export function recordOpsRequest(record, detail) {
  const now = new Date().toISOString();
  investigationState = {
    ...investigationState,
    b4_completed: true,
    b4_timestamp: now,
    last_ops_request: record,
    trade_id: record.trade_id,
  };
  updateStep('B4', now, detail);
  return getInvestigationLog();
}

export function recordNotificationStep({ detail, ops_request_id, trade_id } = {}) {
  const now = new Date().toISOString();
  investigationState = {
    ...investigationState,
    b5_completed: true,
    b5_timestamp: now,
    trade_id: trade_id ?? investigationState.trade_id,
  };
  updateStep(
    'B5',
    now,
    detail
      ?? `Internal status notification sent${ops_request_id ? ` — ops request ${ops_request_id}` : ''}`,
  );
  return getInvestigationLog();
}

export function recordStepUpdate({ step_id, detail }) {
  const now = new Date().toISOString();
  if (step_id === 'B5') {
    return recordNotificationStep({ detail });
  }
  updateStep(step_id, now, detail ?? `Step ${step_id} completed via WorkHQ`);
  return getInvestigationLog();
}

export function resetInvestigationLog() {
  steps = cloneSteps();
  investigationState = {
    b3_completed: false,
    b4_completed: false,
    b5_completed: false,
    b3_timestamp: null,
    b4_timestamp: null,
    b5_timestamp: null,
    last_investigation: null,
    last_ops_request: null,
    trade_id: null,
    workflow_run_id: null,
  };
  return getInvestigationLog();
}
