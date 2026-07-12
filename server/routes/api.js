import {
  TRADES,
  SSIS,
  SWIFT_MESSAGES,
  getTradeById,
  investigateTrade,
  getDashboardStats,
  getSsiById,
} from '../data/scenario.js';
import { createOpsRequest, listOpsRequests, getOpsRequest, clearOpsRequests } from '../data/opsStore.js';
import {
  getInvestigationLog,
  recordAlert,
  recordAgentStep,
  recordInvestigation,
  recordOpsRequest,
  recordNotificationStep,
  recordStepUpdate,
  resetInvestigationLog,
} from '../data/investigationLogStore.js';
import {
  getEodLog,
  recordMarketClose,
  recordClientActivityPull,
  recordDraftCommentary,
  recordHumanApproval,
  recordSendCommentary,
  recordEodStepUpdate,
  resetEodLog,
} from '../data/eodLogStore.js';
import {
  getInquiryLog,
  recordInquiry,
  recordPriceRetrieval,
  recordDraftReply,
  recordInquiryApproval,
  recordSendReply,
  recordInquiryStepUpdate,
  resetInquiryLog,
} from '../data/inquiryLogStore.js';
import { getPrice, CITADEL_DEMO_CLIENT, CITADEL_DEMO_INSTRUMENT } from '../data/citadelScenario.js';
import { buildEodSummary, EOD_DEMO_CLIENT } from '../data/eodScenario.js';
import { clearRequestLogs } from '../middleware/requestLog.js';

function getBaseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

function pickField(sources, key) {
  for (const source of sources) {
    const value = source?.[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
      continue;
    }
    return value;
  }
  return undefined;
}

function normalizeAlertInput(req) {
  const body = req.body ?? {};
  const query = req.query ?? {};
  const data = body.data ?? {};
  const trade = body.trade ?? data.trade ?? body.body?.trade ?? {};
  const request = body.request ?? data.request ?? body.body?.request ?? {};
  const legacyAlert = body.alert ?? data.alert ?? body.body?.alert ?? {};
  const sources = [query, trade, legacyAlert, body, data, body.body];

  const normalized = {
    trade_id: pickField(sources, 'trade_id')
      ?? pickField(sources, 'tradeId'),
    alert_id: pickField([query, body, data, body.body], 'alert_id')
      ?? pickField([query, body, data, body.body], 'eventId'),
    client: pickField(sources, 'client'),
    break_type: pickField(sources, 'break_type')
      ?? pickField(sources, 'breakType'),
    status: pickField(sources, 'status'),
    source: pickField([query, request, body, data, body.body], 'source') ?? 'workhq',
  };

  if (normalized.trade_id) {
    const trade = getTradeById(normalized.trade_id);
    if (trade) {
      normalized.client ??= trade.client;
      normalized.break_type ??= trade.break_type;
      normalized.status ??= trade.status;
    }
  }

  return normalized;
}

function handleLogAlert(req, res) {
  const alert = normalizeAlertInput(req);
  if (!alert.trade_id) {
    return res.status(400).json({
      error: 'trade_id is required',
      hint: 'Map trigger body trade tradeId (or trade_id) via Data Selector.',
      received: { body: req.body ?? {}, query: req.query ?? {} },
    });
  }
  const log = recordAlert(alert);
  return res.status(201).json({ success: true, log });
}

function handleInvestigationStep(req, res) {
  const payload = { ...req.query, ...req.body, ...(req.body?.data ?? {}) };
  const stepId = payload.step_id;
  if (!stepId) {
    return res.status(400).json({ error: 'step_id is required' });
  }

  let log;
  if (stepId === 'B5') {
    log = recordNotificationStep({
      detail: payload.detail,
      ops_request_id: payload.ops_request_id,
      trade_id: payload.trade_id,
    });
  } else if (stepId === 'B2') {
    log = recordAgentStep({
      break_type: payload.break_type,
      trade_id: payload.trade_id,
      summary: payload.detail,
    });
  } else {
    log = recordStepUpdate({
      step_id: stepId,
      detail: payload.detail,
    });
  }

  return res.status(201).json({ success: true, log });
}

function handleInquiryStep(req, res) {
  const payload = { ...req.query, ...req.body, ...(req.body?.data ?? {}) };
  const stepId = payload.step_id;
  if (!stepId) {
    return res.status(400).json({ error: 'step_id is required' });
  }
  try {
    const log = recordInquiryStepUpdate({
      step_id: stepId,
      detail: payload.detail,
      draft: payload.draft ?? payload.reply,
      approved_by: payload.approved_by,
      message_id: payload.message_id,
      client: payload.client,
      instrument: payload.instrument,
      inquiry_id: payload.inquiry_id,
    });
    return res.status(201).json({ success: true, log });
  } catch (err) {
    return res.status(404).json({ error: err.message ?? 'Step update failed' });
  }
}

function handleEodStep(req, res) {
  const payload = { ...req.query, ...req.body, ...(req.body?.data ?? {}) };
  const stepId = payload.step_id;
  if (!stepId) {
    return res.status(400).json({ error: 'step_id is required' });
  }
  const log = recordEodStepUpdate({
    step_id: stepId,
    detail: payload.detail,
    draft: payload.draft ?? payload.commentary,
    approved_by: payload.approved_by,
    commentary_id: payload.commentary_id,
    client: payload.client,
  });
  return res.status(201).json({ success: true, log });
}

function filterTrades(query) {
  let results = [...TRADES];
  if (query.status) {
    results = results.filter(
      (t) => t.status.toLowerCase() === query.status.toLowerCase(),
    );
  }
  if (query.client) {
    const client = query.client.toLowerCase();
    results = results.filter((t) => t.client.toLowerCase().includes(client));
  }
  if (query.break_type) {
    results = results.filter(
      (t) => t.break_type?.toLowerCase() === query.break_type.toLowerCase(),
    );
  }
  return results;
}

export function registerRoutes(app) {
  // --- Dashboard ---
  app.get('/api/stats', (_req, res) => {
    res.json(getDashboardStats());
  });

  // --- Trades ---
  app.get('/api/trades', (req, res) => {
    res.json({ trades: filterTrades(req.query), count: filterTrades(req.query).length });
  });

  app.get('/api/trades/:id', (req, res) => {
    const trade = getTradeById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json(trade);
  });

  // --- Investigate (B3 digital worker endpoint) ---
  app.get('/api/trades/:id/investigate', (req, res) => {
    const result = investigateTrade(req.params.id);
    if (!result) return res.status(404).json({ error: 'Trade not found or cannot be investigated' });

    recordInvestigation(
      result,
      `Identified fix: ${result.recommended_fix.action} → ${result.recommended_fix.ssi_id ?? 'manual review'}`,
    );

    res.json(result);
  });

  app.post('/api/trades/:id/investigate', (req, res) => {
    const result = investigateTrade(req.params.id);
    if (!result) return res.status(404).json({ error: 'Trade not found or cannot be investigated' });

    recordInvestigation(
      result,
      `Identified fix: ${result.recommended_fix.action} → ${result.recommended_fix.ssi_id ?? 'manual review'}`,
    );

    res.json({ success: true, investigation: result });
  });

  // --- SSI ---
  app.get('/api/ssi', (req, res) => {
    let results = [...SSIS];
    if (req.query.client) {
      const client = req.query.client.toLowerCase();
      results = results.filter((s) => s.client.toLowerCase().includes(client));
    }
    if (req.query.status) {
      results = results.filter(
        (s) => s.status.toLowerCase() === req.query.status.toLowerCase(),
      );
    }
    res.json({ ssis: results, count: results.length });
  });

  app.get('/api/ssi/:id', (req, res) => {
    const ssi = getSsiById(req.params.id);
    if (!ssi) return res.status(404).json({ error: 'SSI not found' });
    res.json(ssi);
  });

  // --- SWIFT messages ---
  app.get('/api/trades/:id/swift', (req, res) => {
    const trade = getTradeById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    const messages = SWIFT_MESSAGES[req.params.id] ?? [];
    res.json({ trade_id: req.params.id, messages, count: messages.length });
  });

  app.get('/api/swift/:messageId', (req, res) => {
    for (const tradeId of Object.keys(SWIFT_MESSAGES)) {
      const msg = SWIFT_MESSAGES[tradeId].find((m) => m.id === req.params.messageId);
      if (msg) return res.json({ trade_id: tradeId, message: msg });
    }
    res.status(404).json({ error: 'SWIFT message not found' });
  });

  // --- Ops requests (B4 digital worker endpoint) ---
  app.get('/api/ops-requests', (_req, res) => {
    res.json({ requests: listOpsRequests(), count: listOpsRequests().length });
  });

  app.get('/api/ops-requests/:id', (req, res) => {
    const request = getOpsRequest(req.params.id);
    if (!request) return res.status(404).json({ error: 'Ops request not found' });
    res.json(request);
  });

  app.post('/api/ops-requests', (req, res) => {
    const { trade_id, action, ssi_id } = req.body ?? {};
    if (!trade_id || !action) {
      return res.status(400).json({ error: 'trade_id and action are required' });
    }

    const trade = getTradeById(trade_id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    const record = createOpsRequest({ trade_id, action, ssi_id, source: req.body?.source ?? 'api' });

    recordOpsRequest(
      record,
      `Ops request ${record.id} created: ${action}${ssi_id ? ` → ${ssi_id}` : ''}`,
    );

    res.status(201).json({ success: true, request: record });
  });

  // Webhook alias for Blue Prism — same as POST /api/ops-requests
  app.post('/functions/createOpsRequest', (req, res) => {
    const { trade_id, action, ssi_id } = { ...req.query, ...req.body };
    if (!trade_id || !action) {
      return res.status(400).json({ error: 'trade_id and action are required' });
    }

    const trade = getTradeById(trade_id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    const record = createOpsRequest({ trade_id, action, ssi_id, source: 'webhook' });

    recordOpsRequest(
      record,
      `Ops request ${record.id} created via webhook: ${action}`,
    );

    res.status(201).json({ success: true, request: record });
  });

  // Webhook alias for investigate
  app.get('/functions/investigateTrade', (req, res) => {
    const tradeId = req.query.trade_id;
    if (!tradeId) return res.status(400).json({ error: 'trade_id query parameter is required' });

    const result = investigateTrade(tradeId);
    if (!result) return res.status(404).json({ error: 'Trade not found' });

    recordInvestigation(
      result,
      `Webhook investigation: ${result.recommended_fix.action}`,
    );

    res.json(result);
  });

  // --- Investigation log ---
  app.get('/api/investigation-log', (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(getInvestigationLog());
  });

  app.post('/api/investigation-log/alert', (req, res) => {
    handleLogAlert(req, res);
  });

  // Webhook alias for B1 — one query param (same pattern as investigateTrade)
  app.get('/functions/logFailingTradeAlert', (req, res) => {
    handleLogAlert(req, res);
  });

  app.post('/api/investigation-log/step', (req, res) => {
    handleInvestigationStep(req, res);
  });

  app.get('/functions/logInvestigationStep', (req, res) => {
    handleInvestigationStep(req, res);
  });

  app.post('/api/investigation-log/reset', (_req, res) => {
    clearOpsRequests();
    clearRequestLogs();
    const log = resetInvestigationLog();
    res.json({ success: true, log });
  });

  // --- EOD summary (Scenario C — C2 data pull) ---
  app.get('/api/eod-summary', (req, res) => {
    const client = req.query.client ?? EOD_DEMO_CLIENT;
    res.json(buildEodSummary(client));
  });

  app.get('/functions/pullClientActivity', (req, res) => {
    const client = req.query.client ?? EOD_DEMO_CLIENT;
    const { log, summary } = recordClientActivityPull({ client });
    res.json({ success: true, summary, log });
  });

  // --- EOD commentary log (Scenario C — C1–C5) ---
  app.get('/api/eod-log', (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(getEodLog());
  });

  app.post('/api/eod-log/market-close', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordMarketClose({
      client: payload.client ?? EOD_DEMO_CLIENT,
      run_id: payload.run_id ?? payload.workflow_run_id,
    });
    res.status(201).json({ success: true, log });
  });

  app.get('/functions/logMarketClose', (req, res) => {
    const client = req.query.client ?? EOD_DEMO_CLIENT;
    const log = recordMarketClose({ client, run_id: req.query.run_id });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/eod-log/step', (req, res) => {
    handleEodStep(req, res);
  });

  app.get('/functions/logEodStep', (req, res) => {
    handleEodStep(req, res);
  });

  app.post('/api/eod-log/approve', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordHumanApproval({
      approved_by: payload.approved_by ?? 'Salesperson',
      detail: payload.detail,
    });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/eod-log/send', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordSendCommentary({
      detail: payload.detail,
      commentary_id: payload.commentary_id,
    });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/eod-log/reset', (_req, res) => {
    const log = resetEodLog();
    res.json({ success: true, log });
  });

  // --- Pricing inquiry (Scenario A — S1–S6) ---
  app.get('/api/pricing', (req, res) => {
    const instrument = req.query.instrument ?? CITADEL_DEMO_INSTRUMENT;
    const client = req.query.client ?? CITADEL_DEMO_CLIENT;
    const price = getPrice(instrument, client);
    if (!price) return res.status(404).json({ error: 'Instrument not found' });
    res.json(price);
  });

  app.get('/functions/getPrice', (req, res) => {
    const instrument = req.query.instrument ?? CITADEL_DEMO_INSTRUMENT;
    const client = req.query.client ?? CITADEL_DEMO_CLIENT;
    try {
      const { log, price } = recordPriceRetrieval({ instrument, client });
      res.json({ success: true, price, log });
    } catch (err) {
      res.status(404).json({ error: err.message ?? 'Instrument not found' });
    }
  });

  app.get('/api/inquiry-log', (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(getInquiryLog());
  });

  app.post('/api/inquiry-log/inquiry', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordInquiry({
      client: payload.client,
      instrument: payload.instrument,
      inquiry_id: payload.inquiry_id,
      detail: payload.detail,
    });
    res.status(201).json({ success: true, log });
  });

  app.get('/functions/logClientInquiry', (req, res) => {
    const log = recordInquiry({
      client: req.query.client ?? CITADEL_DEMO_CLIENT,
      instrument: req.query.instrument ?? CITADEL_DEMO_INSTRUMENT,
      inquiry_id: req.query.inquiry_id,
    });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/inquiry-log/step', (req, res) => {
    handleInquiryStep(req, res);
  });

  app.get('/functions/logInquiryStep', (req, res) => {
    handleInquiryStep(req, res);
  });

  app.post('/api/inquiry-log/approve', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordInquiryApproval({
      approved_by: payload.approved_by ?? 'Salesperson',
      detail: payload.detail,
    });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/inquiry-log/send', (req, res) => {
    const payload = { ...req.query, ...req.body };
    const log = recordSendReply({
      detail: payload.detail,
      message_id: payload.message_id,
    });
    res.status(201).json({ success: true, log });
  });

  app.post('/api/inquiry-log/reset', (_req, res) => {
    const log = resetInquiryLog();
    res.json({ success: true, log });
  });

  // --- API documentation ---
  app.get('/api/endpoints', (req, res) => {
    const base = getBaseUrl(req);
    res.json({
      base_url: base,
      endpoints: [
        {
          method: 'GET',
          path: '/api/trades',
          description: 'List trades (filter: ?status=failed&client=millennium)',
          example: `${base}/api/trades?status=failed&client=millennium`,
        },
        {
          method: 'GET',
          path: '/api/trades/:id',
          description: 'Get trade details',
          example: `${base}/api/trades/TRD-2026-048291`,
        },
        {
          method: 'GET',
          path: '/api/trades/:id/investigate',
          description: 'B3 — Digital worker investigates trade, returns SSI fix',
          example: `${base}/api/trades/TRD-2026-048291/investigate`,
        },
        {
          method: 'GET',
          path: '/functions/investigateTrade',
          description: 'B3 webhook alias — ?trade_id=TRD-2026-048291',
          example: `${base}/functions/investigateTrade?trade_id=TRD-2026-048291`,
        },
        {
          method: 'POST',
          path: '/api/ops-requests',
          description: 'B4 — Create ops request (body: trade_id, action, ssi_id)',
          example: `${base}/api/ops-requests`,
        },
        {
          method: 'POST',
          path: '/functions/createOpsRequest',
          description: 'B4 webhook alias',
          example: `${base}/functions/createOpsRequest`,
        },
        {
          method: 'GET',
          path: '/api/ssi',
          description: 'List settlement instructions',
          example: `${base}/api/ssi?client=millennium`,
        },
        {
          method: 'GET',
          path: '/api/trades/:id/swift',
          description: 'SWIFT messages for a trade',
          example: `${base}/api/trades/TRD-2026-048291/swift`,
        },
        {
          method: 'GET',
          path: '/api/investigation-log',
          description: 'Scenario B audit trail with step state',
          example: `${base}/api/investigation-log`,
        },
        {
          method: 'POST',
          path: '/api/investigation-log/alert',
          description: 'B1 — Record failing-trade alert from WorkHQ',
          example: `${base}/api/investigation-log/alert`,
        },
        {
          method: 'GET',
          path: '/functions/logFailingTradeAlert',
          description: 'B1 webhook alias — ?trade_id=TRD-2026-048291 (one Data Selector field)',
          example: `${base}/functions/logFailingTradeAlert?trade_id=TRD-2026-048291`,
        },
        {
          method: 'POST',
          path: '/api/investigation-log/step',
          description: 'Update a scenario step (e.g. B5 notification)',
          example: `${base}/api/investigation-log/step`,
        },
        {
          method: 'POST',
          path: '/api/investigation-log/reset',
          description: 'Reset demo state, ops requests, and request log',
          example: `${base}/api/investigation-log/reset`,
        },
        {
          method: 'GET',
          path: '/api/eod-summary',
          description: 'C2 — Client activity summary for EOD commentary',
          example: `${base}/api/eod-summary?client=Millennium%20Management`,
        },
        {
          method: 'GET',
          path: '/functions/pullClientActivity',
          description: 'C2 webhook alias — ?client=Millennium%20Management',
          example: `${base}/functions/pullClientActivity?client=Millennium%20Management`,
        },
        {
          method: 'GET',
          path: '/api/eod-log',
          description: 'Scenario C audit trail with step state',
          example: `${base}/api/eod-log`,
        },
        {
          method: 'GET',
          path: '/functions/logMarketClose',
          description: 'C1 webhook alias — ?client=Millennium%20Management',
          example: `${base}/functions/logMarketClose?client=Millennium%20Management`,
        },
        {
          method: 'POST',
          path: '/api/eod-log/step',
          description: 'Update a Scenario C step (C3 draft, C4 approve, C5 send)',
          example: `${base}/api/eod-log/step`,
        },
        {
          method: 'POST',
          path: '/api/eod-log/approve',
          description: 'C4 — Human approval before client send',
          example: `${base}/api/eod-log/approve`,
        },
        {
          method: 'POST',
          path: '/api/eod-log/send',
          description: 'C5 — Send approved commentary and log',
          example: `${base}/api/eod-log/send`,
        },
        {
          method: 'POST',
          path: '/api/eod-log/reset',
          description: 'Reset Scenario C demo state',
          example: `${base}/api/eod-log/reset`,
        },
        {
          method: 'GET',
          path: '/api/pricing',
          description: 'S3 — Get indicative price for instrument',
          example: `${base}/api/pricing?instrument=US%20Treasury%2010Y%20Note&client=Citadel%20Advisors`,
        },
        {
          method: 'GET',
          path: '/functions/getPrice',
          description: 'S3 webhook alias — logs S3 and returns price',
          example: `${base}/functions/getPrice?instrument=US%20Treasury%2010Y%20Note`,
        },
        {
          method: 'GET',
          path: '/api/inquiry-log',
          description: 'Scenario A audit trail with step state',
          example: `${base}/api/inquiry-log`,
        },
        {
          method: 'GET',
          path: '/functions/logClientInquiry',
          description: 'S1 webhook alias — log Citadel inquiry',
          example: `${base}/functions/logClientInquiry?client=Citadel%20Advisors`,
        },
        {
          method: 'POST',
          path: '/api/inquiry-log/step',
          description: 'Update a Scenario A step (S4 draft, S5 approve, S6 send)',
          example: `${base}/api/inquiry-log/step`,
        },
        {
          method: 'POST',
          path: '/api/inquiry-log/approve',
          description: 'S5 — Human approval before client send',
          example: `${base}/api/inquiry-log/approve`,
        },
        {
          method: 'POST',
          path: '/api/inquiry-log/send',
          description: 'S6 — Send approved reply and log',
          example: `${base}/api/inquiry-log/send`,
        },
        {
          method: 'POST',
          path: '/api/inquiry-log/reset',
          description: 'Reset Scenario A demo state',
          example: `${base}/api/inquiry-log/reset`,
        },
      ],
    });
  });
}
