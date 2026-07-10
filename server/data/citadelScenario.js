/** Scenario A — Citadel pricing inquiry (WorkHQ Storyboard S1–S6). */

export const CITADEL_DEMO_CLIENT = 'Citadel Advisors';
export const CITADEL_DEMO_INSTRUMENT = 'US Treasury 10Y Note';

export const INQUIRY_LOG = [
  {
    step_id: 'S1',
    resource_type: 'Signal',
    action: 'Client inquiry received',
    timestamp: null,
    detail: 'Pending — awaiting Citadel pricing inquiry from WorkHQ',
    human_gate: false,
  },
  {
    step_id: 'S2',
    resource_type: 'AI Agent',
    action: 'Read and interpret the request',
    timestamp: null,
    detail: 'Pending — AI agent will parse instrument and client intent',
    human_gate: false,
  },
  {
    step_id: 'S3',
    resource_type: 'Digital Worker',
    action: 'Retrieve pricing from systems',
    timestamp: null,
    detail: 'Pending — digital worker will pull live price',
    human_gate: false,
  },
  {
    step_id: 'S4',
    resource_type: 'AI Agent',
    action: 'Draft client-facing reply',
    timestamp: null,
    detail: 'Pending — AI agent will draft priced response',
    human_gate: false,
  },
  {
    step_id: 'S5',
    resource_type: 'Human',
    action: 'Salesperson approves before send',
    timestamp: null,
    detail: 'Pending — human must approve client-facing price',
    human_gate: true,
  },
  {
    step_id: 'S6',
    resource_type: 'Digital Worker',
    action: 'Send reply and log',
    timestamp: null,
    detail: 'Pending — send approved reply and update audit log',
    human_gate: false,
  },
];

export const PRICING = {
  'US Treasury 10Y Note': {
    instrument: 'US Treasury 10Y Note',
    cusip: '91282CJL6',
    isin: 'US91282CJL64',
    price: 98.4375,
    yield_pct: 4.12,
    currency: 'USD',
    as_of: '2026-07-09T15:42:00Z',
    source: 'SSC_PRICING_ENGINE',
    client: CITADEL_DEMO_CLIENT,
  },
  'US Treasury 5Y Note': {
    instrument: 'US Treasury 5Y Note',
    cusip: '91282CJZ5',
    isin: 'US91282CJZ58',
    price: 97.125,
    yield_pct: 3.89,
    currency: 'USD',
    as_of: '2026-07-09T15:42:00Z',
    source: 'SSC_PRICING_ENGINE',
    client: CITADEL_DEMO_CLIENT,
  },
};

export function getPrice(instrument = CITADEL_DEMO_INSTRUMENT, client = CITADEL_DEMO_CLIENT) {
  const record = PRICING[instrument];
  if (!record) return null;
  return {
    ...record,
    client,
    retrieved_at: new Date().toISOString(),
  };
}

export const DRAFT_REPLY_TEMPLATE = `Hi Citadel team,

Re: {{instrument}}
Indicative price: {{price}} (yield {{yield}}%)
As of: {{as_of}}

Please confirm if you would like to proceed.

Best regards,
SS&C Sales Coverage`;
