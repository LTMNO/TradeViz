/**
 * Generates WorkHQ workflow JSON aligned with TradeViz demo log pacing.
 * Run: node scripts/build-workflows.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'workflows');
const DOWNLOADS = join(process.env.USERPROFILE || '', 'Downloads');

const BASE = 'https://scportal.blueprism.com/TradeViz';
const AGENT = 'ykULzrGCe1CzT3int3ETG';
const ESCALATION_AGENT = 'eEBnIkzAEKuXatzmi9rrk';

function delayStep(name, seconds, nextAction, displayName = `Delay ${seconds}s`) {
  return {
    name,
    skip: false,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: { unit: 'seconds', delayFor: String(seconds) },
      connectorName: '@ssnc/connector-delay',
      connectorType: 'OFFICIAL',
      actionName: 'delayFor',
      inputUiInfo: { customizedInputs: {} },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.3.12',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
    nextAction,
  };
}

function httpGet(name, displayName, url, queryParams, nextAction, continueOnFailure = false) {
  return {
    name,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: {
        url,
        body: {},
        method: 'GET',
        headers: {},
        authType: 'NONE',
        body_type: 'none',
        use_proxy: false,
        authFields: {},
        queryParams,
        proxy_settings: {},
        response_is_binary: false,
      },
      connectorName: '@ssnc/connector-http',
      connectorType: 'OFFICIAL',
      actionName: 'send_request',
      inputUiInfo: { schema: { body: {}, authFields: {}, proxy_settings: {} }, queryParams },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.8.2',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: continueOnFailure },
      },
    },
    nextAction,
  };
}

function httpPostQuery(name, displayName, url, queryParams, nextAction, continueOnFailure = false) {
  return {
    name,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: {
        url,
        body: {},
        method: 'POST',
        headers: {},
        authType: 'NONE',
        body_type: 'none',
        use_proxy: false,
        authFields: {},
        queryParams,
        proxy_settings: {},
        response_is_binary: false,
      },
      connectorName: '@ssnc/connector-http',
      connectorType: 'OFFICIAL',
      actionName: 'send_request',
      inputUiInfo: { body: {}, schema: { body: {}, authFields: {}, proxy_settings: {} }, queryParams },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.8.2',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: continueOnFailure },
      },
    },
    nextAction,
  };
}

function httpPostJson(name, displayName, url, data, nextAction) {
  const body = { data };
  return {
    name,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: {
        url,
        body,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authType: 'NONE',
        body_type: 'json',
        use_proxy: false,
        authFields: {},
        queryParams: {},
        proxy_settings: {},
        response_is_binary: false,
      },
      connectorName: '@ssnc/connector-http',
      connectorType: 'OFFICIAL',
      actionName: 'send_request',
      inputUiInfo: {
        body,
        schema: {
          body: { data: { type: 'JSON', required: true, displayName: 'JSON Body' } },
          authFields: {},
          proxy_settings: {},
        },
      },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.8.2',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
    nextAction,
  };
}

function agentStep(name, displayName, prompt, nextAction) {
  return {
    name,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: { prompt, agentId: AGENT },
      connectorName: '@ssnc/connector-agent',
      connectorType: 'OFFICIAL',
      actionName: 'run_agent',
      inputUiInfo: { customizedInputs: { agentId: false } },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.4.12',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
    nextAction,
  };
}

function returnResponse(name, displayName, body) {
  return {
    name,
    type: 'CONNECTOR',
    valid: true,
    displayName,
    settings: {
      input: {
        fields: { body, status: 200, headers: {} },
        respond: 'stop',
        responseType: 'json',
      },
      connectorName: '@ssnc/connector-webhook',
      connectorType: 'OFFICIAL',
      actionName: 'return_response',
      inputUiInfo: {
        schema: {
          fields: {
            body: { type: 'JSON', required: true, displayName: 'JSON Body' },
            status: { type: 'NUMBER', required: false, displayName: 'Status', defaultValue: 200 },
            headers: { type: 'OBJECT', required: false, displayName: 'Headers' },
          },
        },
      },
      packageType: 'ARCHIVE',
      connectorVersion: '~0.1.18',
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };
}

function webhookTrigger(displayName, sampleData) {
  return {
    name: 'trigger',
    valid: true,
    displayName,
    type: 'CONNECTOR_TRIGGER',
    settings: {
      connectorName: '@ssnc/connector-webhook',
      connectorVersion: '~0.1.18',
      connectorType: 'OFFICIAL',
      packageType: 'ARCHIVE',
      input: { authType: 'none', authFields: {} },
      inputUiInfo: { schema: { authFields: {} } },
      triggerName: 'catch_webhook',
      sampleData,
    },
  };
}

function buildScenarioB() {
  const tradeId = "{{trigger['body']['trade']['tradeId']}}";
  const client = "{{trigger['body']['trade']['client']}}";
  const breakType = "{{trigger['body']['trade']['breakType']}}";

  const step7 = returnResponse('step_7', 'Return Response (/sync)', {
    trade_id: tradeId,
    fix_ssi_id: "{{step_2['body']['recommended_fix']['ssi_id']}}",
    root_cause: "{{step_2['body']['root_cause']}}",
    ops_request_id: "{{step_4['body']['request']['id']}}",
    workflow_result: 'RESOLVED',
  });

  const step5Notify = httpPostQuery(
    'step_5_notify',
    'Log B5 — Notification in TradeViz',
    `${BASE}/api/investigation-log/step`,
    {
      step_id: 'B5',
      detail: 'Internal status notification drafted — workflow RESOLVED',
      source: 'workhq',
      trade_id: tradeId,
      ops_request_id: "{{step_4['body']['request']['id']}}",
    },
    step7,
    true,
  );

  const step5Agent = agentStep(
    'step_5',
    'B5 — Draft Internal Status Notification (AI Agent)',
    `Internal ops update only. No client-facing message.\n\nTrade ID: ${tradeId}\nClient: ${client}\nRoot Cause: {{step_2['body']['root_cause']}}\nOps Request ID: {{step_4['body']['request']['id']}}\nFix: {{step_2['body']['recommended_fix']['action']}} → {{step_2['body']['recommended_fix']['ssi_id']}}`,
    delayStep('step_11', 2, step5Notify, 'Delay 2s — B5 log'),
  );

  const step4 = httpPostJson(
    'step_4',
    'B4 — Create Ops Request (HTTP POST)',
    `${BASE}/api/ops-requests`,
    {
      trade_id: tradeId,
      action: "{{step_2['body']['recommended_fix']['action']}}",
      ssi_id: "{{step_2['body']['recommended_fix']['ssi_id']}}",
      source: 'workhq',
    },
    delayStep('step_d4', 3, step5Agent, 'Delay 3s — B5 agent'),
  );

  const step2 = httpGet(
    'step_2',
    'B3 — Investigate Trade in TradeViz (HTTP GET)',
    `${BASE}/functions/investigateTrade`,
    { trade_id: tradeId },
    delayStep(
      'step_d3',
      3,
      {
        name: 'step_3',
        type: 'ROUTER',
        valid: true,
        displayName: 'Auto-Executable? Route to B4 or Human Review',
        settings: {
          branches: [
            {
              branchName: 'Auto-Executable — Proceed to B4',
              branchType: 'CONDITION',
              conditions: [
                [{ operator: 'BOOLEAN_IS_TRUE', firstValue: "{{step_2['body']['recommended_fix']['auto_executable']}}" }],
              ],
            },
            { branchName: 'Manual Review Required', branchType: 'FALLBACK' },
          ],
          inputUiInfo: {},
          executionType: 'EXECUTE_FIRST_MATCH',
        },
        children: [
          delayStep('step_9', 2, step4, 'Delay 2s — B4 ops'),
          {
            name: 'step_6',
            type: 'CONNECTOR',
            valid: true,
            displayName: 'Escalate to Human Review (AI Agent)',
            settings: {
              input: {
                prompt: `Manual review required.\n\nTrade ID: ${tradeId}\nClient: ${client}\nRoot Cause: {{step_2['body']['root_cause']}}`,
                agentId: ESCALATION_AGENT,
              },
              connectorName: '@ssnc/connector-agent',
              connectorType: 'OFFICIAL',
              actionName: 'run_agent',
              inputUiInfo: {},
              packageType: 'ARCHIVE',
              connectorVersion: '~0.4.12',
              errorHandlingOptions: {
                retryOnFailure: { value: false },
                continueOnFailure: { value: false },
              },
            },
            nextAction: returnResponse('step_8', 'Return Response — Escalation (/sync)', {
              workflow_result: 'ESCALATED',
              trade_id: tradeId,
              root_cause: "{{step_2['body']['root_cause']}}",
            }),
          },
        ],
      },
      'Delay 3s — route B4',
    ),
  );

  const step1b = httpGet(
    'step_1b',
    'Log B2 — Interpret in TradeViz',
    `${BASE}/functions/logInvestigationStep`,
    {
      step_id: 'B2',
      trade_id: tradeId,
      break_type: breakType,
      detail: 'Classified as SSI_MISMATCH — settlement break interpreted by WorkHQ agent',
    },
    delayStep('step_d2', 3, step2, 'Delay 3s — B3 investigate'),
    true,
  );

  const step1 = agentStep(
    'step_1',
    'B2 — Interpret Settlement Break (AI Agent)',
    `You are a settlement operations analyst. A failing trade alert has been received.\n\nEvent: {{trigger['body']['eventType']}} ({{trigger['body']['eventId']}})\nTrade: {{trigger['body']['trade']}}\n\nInterpret the settlement failure.`,
    delayStep('step_d1', 2, step1b, 'Delay 2s — B2 log'),
  );

  const step0 = httpGet(
    'step_0',
    'Log B1 — Alert in TradeViz (HTTP GET)',
    `${BASE}/functions/logFailingTradeAlert`,
    { trade_id: tradeId },
    delayStep('step_10', 3, step1, 'Delay 3s — B2 agent'),
    true,
  );

  return {
    created: String(Date.now()),
    updated: String(Date.now()),
    name: 'Scenario B — Millennium Failing Trade',
    description: 'TradeViz-synced: one log HTTP per UI step, 2–3s delays. Open Investigation Log with Live on before firing /sync.',
    tags: ['TradeViz', 'demo'],
    connectors: [
      '@ssnc/connector-webhook',
      '@ssnc/connector-http',
      '@ssnc/connector-delay',
      '@ssnc/connector-agent',
    ],
    template: {
      displayName: 'Scenario B — Millennium Failing Trade',
      valid: true,
      connectionIds: [],
      trigger: {
        ...webhookTrigger('B1 — Failing Trade Alert (Signal)', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: {
            eventId: 'ALERT-2026-07-09-0042',
            eventType: 'failing_trade_alert',
            trade: {
              tradeId: 'TRD-2026-048291',
              client: 'Millennium Management',
              breakType: 'SSI_MISMATCH',
              status: 'FAILED',
            },
            request: { priority: 'high', requiresApproval: false, source: 'workhq-test-harness' },
          },
        }),
        nextAction: step0,
      },
      schemaVersion: '3',
    },
    blogUrl: '',
    metadata: null,
  };
}

function buildScenarioA() {
  const client = "{{trigger['body']['client']}}";
  const instrument = "{{trigger['body']['instrument']}}";
  const inquiryId = "{{trigger['body']['inquiryId']}}";

  const step7 = returnResponse('step_7', 'Return Response (/sync)', {
    workflow_result: 'SENT',
    client,
    instrument,
    inquiry_id: inquiryId,
    price: "{{step_2['body']['price']['price']}}",
    yield_pct: "{{step_2['body']['price']['yield_pct']}}",
    message_id: "{{step_6['body']['log']['state']['message_id']}}",
  });

  const step6 = httpPostQuery(
    'step_6',
    'S6 — Send Reply and Log (HTTP POST)',
    `${BASE}/api/inquiry-log/send`,
    { message_id: `MSG-${inquiryId}`, detail: `Reply sent to ${client}` },
    step7,
  );

  const step5 = httpPostQuery(
    'step_5',
    'S5 — Log Human Approval in TradeViz',
    `${BASE}/api/inquiry-log/approve`,
    {
      approved_by: 'Alex Morgan',
      detail: `Approved — cleared to send priced reply to ${client}`,
    },
    delayStep('step_d6', 2, step6, 'Delay 2s — S6 send'),
  );

  const step4 = httpPostQuery(
    'step_4',
    'Log S4 — Draft in TradeViz (HTTP POST)',
    `${BASE}/api/inquiry-log/step`,
    {
      step_id: 'S4',
      detail: 'AI agent drafted client-facing priced reply',
      draft: "{{step_3['body']}}",
    },
    delayStep('step_d5', 4, step5, 'Delay 4s — S5 human gate (UI awaiting)'),
    true,
  );

  const step3 = agentStep(
    'step_3',
    'S4 — Draft Client Reply (AI Agent)',
    `Draft a client-facing pricing reply.\n\nClient: ${client}\nInstrument: ${instrument}\nPrice: {{step_2['body']['price']['price']}}\nYield: {{step_2['body']['price']['yield_pct']}}%`,
    delayStep('step_d4', 3, step4, 'Delay 3s — S4 log'),
  );

  const step2 = httpGet(
    'step_2',
    'S3 — Retrieve Price from TradeViz (HTTP GET)',
    `${BASE}/functions/getPrice`,
    { client, instrument },
    delayStep('step_d3', 3, step3, 'Delay 3s — S4 agent'),
  );

  const step1b = httpGet(
    'step_1b',
    'Log S2 — Interpret in TradeViz',
    `${BASE}/functions/logInquiryStep`,
    {
      step_id: 'S2',
      instrument,
      detail: `Parsed request — instrument: ${instrument}, client: ${client}`,
    },
    delayStep('step_d2', 3, step2, 'Delay 3s — S3 price'),
    true,
  );

  const step1 = agentStep(
    'step_1',
    'S2 — Interpret Inquiry (AI Agent)',
    `Interpret the pricing inquiry.\n\nInquiry: ${inquiryId}\nClient: ${client}\nInstrument: ${instrument}\nMessage: {{trigger['body']['message']}}`,
    delayStep('step_d1', 2, step1b, 'Delay 2s — S2 log'),
  );

  const step0 = httpGet(
    'step_0',
    'Log S1 — Inquiry in TradeViz (HTTP GET)',
    `${BASE}/functions/logClientInquiry`,
    { client, instrument, inquiry_id: inquiryId },
    delayStep('step_10', 3, step1, 'Delay 3s — S2 agent'),
    true,
  );

  return {
    created: String(Date.now()),
    updated: String(Date.now()),
    name: 'Scenario A — Citadel Pricing Inquiry',
    description: 'TradeViz-synced: S1–S6 one step at a time. 4s pause before S5 for human gate on UI. Swap S5 delay+approve for Create User Task live.',
    tags: ['TradeViz', 'demo'],
    connectors: [
      '@ssnc/connector-webhook',
      '@ssnc/connector-http',
      '@ssnc/connector-delay',
      '@ssnc/connector-agent',
    ],
    template: {
      displayName: 'Scenario A — Citadel Pricing Inquiry',
      valid: true,
      connectionIds: [],
      trigger: {
        ...webhookTrigger('S1 — Client Inquiry (Signal)', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: {
            inquiryId: 'INQ-20260709-0042',
            client: 'Citadel Advisors',
            instrument: 'US Treasury 10Y Note',
            channel: 'email',
            message: 'Can you provide an indicative price on the 10-year Treasury?',
          },
        }),
        nextAction: step0,
      },
      schemaVersion: '3',
    },
    blogUrl: '',
    metadata: null,
  };
}

function buildScenarioC() {
  const client = "{{trigger['body']['client']}}";
  const eventId = "{{trigger['body']['eventId']}}";

  const step6 = returnResponse('step_6', 'Return Response (/sync)', {
    workflow_result: 'SENT',
    client,
    event_id: eventId,
    trades_today: "{{step_1['body']['summary']['summary']['trades_today']}}",
    commentary_id: "{{step_5['body']['log']['state']['commentary_id']}}",
  });

  const step5 = httpPostQuery(
    'step_5',
    'C5 — Send Commentary and Log (HTTP POST)',
    `${BASE}/api/eod-log/send`,
    { commentary_id: `EOD-${eventId}`, detail: `Commentary sent to ${client}` },
    step6,
  );

  const step4 = httpPostQuery(
    'step_4',
    'C4 — Log Human Approval in TradeViz',
    `${BASE}/api/eod-log/approve`,
    { approved_by: 'Alex Morgan', detail: `Approved for send to ${client}` },
    delayStep('step_d5', 2, step5, 'Delay 2s — C5 send'),
  );

  const step3 = httpPostQuery(
    'step_3',
    'Log C3 — Draft in TradeViz (HTTP POST)',
    `${BASE}/api/eod-log/step`,
    {
      step_id: 'C3',
      detail: 'AI agent drafted client-facing end-of-day commentary',
      draft: "{{step_2['body']}}",
    },
    delayStep('step_d4', 4, step4, 'Delay 4s — C4 human gate (UI awaiting)'),
    true,
  );

  const step2 = agentStep(
    'step_2',
    'C3 — Draft EOD Commentary (AI Agent)',
    `Draft EOD commentary.\n\nClient: ${client}\nActivity:\n{{step_1['body']['summary']}}`,
    delayStep('step_d3', 3, step3, 'Delay 3s — C3 log'),
  );

  const step1 = httpGet(
    'step_1',
    'C2 — Pull Client Activity from TradeViz (HTTP GET)',
    `${BASE}/functions/pullClientActivity`,
    { client },
    delayStep('step_d2', 3, step2, 'Delay 3s — C3 agent'),
  );

  const step0 = httpGet(
    'step_0',
    'Log C1 — Market Close in TradeViz (HTTP GET)',
    `${BASE}/functions/logMarketClose`,
    { client, run_id: eventId },
    delayStep('step_10', 3, step1, 'Delay 3s — C2 pull'),
    true,
  );

  return {
    created: String(Date.now()),
    updated: String(Date.now()),
    name: 'Scenario C — EOD Commentary',
    description: 'TradeViz-synced: C1–C5 one step at a time. 4s pause before C4 for human gate on UI. Swap C4 delay+approve for Create User Task live.',
    tags: ['TradeViz', 'demo'],
    connectors: [
      '@ssnc/connector-webhook',
      '@ssnc/connector-http',
      '@ssnc/connector-delay',
      '@ssnc/connector-agent',
    ],
    template: {
      displayName: 'Scenario C — EOD Commentary',
      valid: true,
      connectionIds: [],
      trigger: {
        ...webhookTrigger('C1 — Market Close (Signal)', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: {
            eventId: 'EOD-20260709-001',
            eventType: 'market_close',
            client: 'Millennium Management',
            marketCloseAt: '2026-07-09T20:00:00.000Z',
            timezone: 'America/New_York',
          },
        }),
        nextAction: step0,
      },
      schemaVersion: '3',
    },
    blogUrl: '',
    metadata: null,
  };
}

mkdirSync(OUT_DIR, { recursive: true });

const files = [
  ['Scenario B — Millennium Failing Trade.json', buildScenarioB()],
  ['Scenario A — Citadel Pricing Inquiry.json', buildScenarioA()],
  ['Scenario C — EOD Commentary.json', buildScenarioC()],
];

for (const [name, data] of files) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(join(OUT_DIR, name), json);
  try {
    writeFileSync(join(DOWNLOADS, name), json);
  } catch {
    /* optional */
  }
  console.log('Wrote', name);
}
