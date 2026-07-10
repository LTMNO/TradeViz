import {
  INQUIRY_LOG as SEED_LOG,
  CITADEL_DEMO_CLIENT,
  CITADEL_DEMO_INSTRUMENT,
  getPrice,
} from './citadelScenario.js';

const PENDING_DETAILS = {
  S1: 'Pending — awaiting Citadel pricing inquiry from WorkHQ',
  S2: 'Pending — AI agent will parse instrument and client intent',
  S3: 'Pending — digital worker will pull live price',
  S4: 'Pending — AI agent will draft priced response',
  S5: 'Pending — human must approve client-facing price',
  S6: 'Pending — send approved reply and update audit log',
};

function cloneSteps() {
  return SEED_LOG.map((step) => ({
    ...step,
    timestamp: null,
    detail: PENDING_DETAILS[step.step_id] ?? step.detail,
  }));
}

let steps = cloneSteps();

let inquiryState = {
  client: CITADEL_DEMO_CLIENT,
  instrument: CITADEL_DEMO_INSTRUMENT,
  inquiry_id: null,
  last_price: null,
  draft_reply: null,
  approved_by: null,
  approved_at: null,
  message_id: null,
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

export function getInquiryLog() {
  return {
    scenario: 'Citadel pricing inquiry (S1–S6)',
    steps,
    state: inquiryState,
  };
}

export function recordInquiry({ client, instrument, inquiry_id, detail } = {}) {
  const now = new Date().toISOString();
  if (client) inquiryState.client = client;
  if (instrument) inquiryState.instrument = instrument;
  inquiryState.inquiry_id = inquiry_id ?? `INQ-${now.slice(0, 10).replace(/-/g, '')}-0042`;
  updateStep(
    'S1',
    now,
    detail ?? `Inquiry ${inquiryState.inquiry_id}: ${inquiryState.client} — ${inquiryState.instrument}`,
  );
  return getInquiryLog();
}

export function recordInterpretStep({ instrument, detail } = {}) {
  const now = new Date().toISOString();
  if (instrument) inquiryState.instrument = instrument;
  updateStep(
    'S2',
    now,
    detail ?? `Parsed request — instrument: ${inquiryState.instrument}, client: ${inquiryState.client}`,
  );
  return getInquiryLog();
}

export function recordPriceRetrieval({ instrument, client } = {}) {
  const now = new Date().toISOString();
  const inst = instrument ?? inquiryState.instrument;
  const price = getPrice(inst, client ?? inquiryState.client);
  if (!price) {
    throw new Error(`No price for instrument: ${inst}`);
  }
  if (!steps.find((s) => s.step_id === 'S1')?.timestamp) {
    recordInquiry({ client: price.client, instrument: inst });
  }
  if (!steps.find((s) => s.step_id === 'S2')?.timestamp) {
    recordInterpretStep({ instrument: inst });
  }
  inquiryState = {
    ...inquiryState,
    instrument: inst,
    client: price.client,
    last_price: price,
  };
  updateStep(
    'S3',
    now,
    `Price retrieved: ${price.price} (${price.yield_pct}% yield) — ${price.source}`,
  );
  return { log: getInquiryLog(), price };
}

export function recordDraftReply({ detail, draft } = {}) {
  const now = new Date().toISOString();
  const text = draft ?? detail ?? 'Draft client reply prepared by WorkHQ agent';
  inquiryState.draft_reply = text;
  updateStep('S4', now, detail ?? 'AI agent drafted client-facing priced reply');
  return getInquiryLog();
}

export function recordInquiryApproval({ approved_by, detail } = {}) {
  const now = new Date().toISOString();
  inquiryState = {
    ...inquiryState,
    approved_by: approved_by ?? 'Salesperson',
    approved_at: now,
  };
  updateStep(
    'S5',
    now,
    detail ?? `Approved by ${inquiryState.approved_by} — cleared to send to ${inquiryState.client}`,
  );
  return getInquiryLog();
}

export function recordSendReply({ detail, message_id } = {}) {
  const now = new Date().toISOString();
  const id = message_id ?? `MSG-${now.slice(0, 10).replace(/-/g, '')}-0042`;
  inquiryState = {
    ...inquiryState,
    message_id: id,
    sent_at: now,
  };
  updateStep(
    'S6',
    now,
    detail ?? `Reply ${id} sent to ${inquiryState.client} and logged`,
  );
  return getInquiryLog();
}

export function recordInquiryStepUpdate({
  step_id,
  detail,
  draft,
  approved_by,
  message_id,
  client,
  instrument,
  inquiry_id,
}) {
  switch (step_id) {
    case 'S1':
      return recordInquiry({ client, instrument, inquiry_id, detail });
    case 'S2':
      return recordInterpretStep({ instrument, detail });
    case 'S3':
      return recordPriceRetrieval({ instrument, client }).log;
    case 'S4':
      return recordDraftReply({ detail, draft });
    case 'S5':
      return recordInquiryApproval({ approved_by, detail });
    case 'S6':
      return recordSendReply({ detail, message_id });
    default: {
      const now = new Date().toISOString();
      updateStep(step_id, now, detail ?? `Step ${step_id} completed via WorkHQ`);
      return getInquiryLog();
    }
  }
}

export function resetInquiryLog() {
  steps = cloneSteps();
  inquiryState = {
    client: CITADEL_DEMO_CLIENT,
    instrument: CITADEL_DEMO_INSTRUMENT,
    inquiry_id: null,
    last_price: null,
    draft_reply: null,
    approved_by: null,
    approved_at: null,
    message_id: null,
    sent_at: null,
    workflow_run_id: null,
  };
  return getInquiryLog();
}
