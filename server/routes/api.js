import {
  TRADES,
  SSIS,
  SWIFT_MESSAGES,
  INVESTIGATION_LOG,
  getTradeById,
  investigateTrade,
  getDashboardStats,
  getSsiById,
} from '../data/scenario.js';
import { createOpsRequest, listOpsRequests, getOpsRequest } from '../data/opsStore.js';

let investigationState = {
  b3_completed: false,
  b4_completed: false,
  b3_timestamp: null,
  b4_timestamp: null,
  last_investigation: null,
  last_ops_request: null,
};

function getBaseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
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

function updateInvestigationLog(stepId, timestamp, detail) {
  const entry = INVESTIGATION_LOG.find((l) => l.step_id === stepId);
  if (entry) {
    entry.timestamp = timestamp;
    entry.detail = detail;
  }
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

    investigationState = {
      ...investigationState,
      b3_completed: true,
      b3_timestamp: new Date().toISOString(),
      last_investigation: result,
    };
    updateInvestigationLog(
      'B3',
      investigationState.b3_timestamp,
      `Identified fix: ${result.recommended_fix.action} → ${result.recommended_fix.ssi_id ?? 'manual review'}`,
    );

    res.json(result);
  });

  app.post('/api/trades/:id/investigate', (req, res) => {
    const result = investigateTrade(req.params.id);
    if (!result) return res.status(404).json({ error: 'Trade not found or cannot be investigated' });

    investigationState = {
      ...investigationState,
      b3_completed: true,
      b3_timestamp: new Date().toISOString(),
      last_investigation: result,
    };
    updateInvestigationLog(
      'B3',
      investigationState.b3_timestamp,
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

    investigationState = {
      ...investigationState,
      b4_completed: true,
      b4_timestamp: new Date().toISOString(),
      last_ops_request: record,
    };
    updateInvestigationLog(
      'B4',
      investigationState.b4_timestamp,
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

    investigationState = {
      ...investigationState,
      b4_completed: true,
      b4_timestamp: new Date().toISOString(),
      last_ops_request: record,
    };
    updateInvestigationLog(
      'B4',
      investigationState.b4_timestamp,
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

    investigationState = {
      ...investigationState,
      b3_completed: true,
      b3_timestamp: new Date().toISOString(),
      last_investigation: result,
    };
    updateInvestigationLog(
      'B3',
      investigationState.b3_timestamp,
      `Webhook investigation: ${result.recommended_fix.action}`,
    );

    res.json(result);
  });

  // --- Investigation log ---
  app.get('/api/investigation-log', (_req, res) => {
    res.json({
      scenario: 'Millennium failing trade (B1–B5)',
      steps: INVESTIGATION_LOG,
      state: investigationState,
    });
  });

  app.post('/api/investigation-log/reset', (_req, res) => {
    investigationState = {
      b3_completed: false,
      b4_completed: false,
      b3_timestamp: null,
      b4_timestamp: null,
      last_investigation: null,
      last_ops_request: null,
    };
    updateInvestigationLog('B3', null, 'Pending — retrieve trade, compare SSIs, identify fix');
    updateInvestigationLog('B4', null, 'Pending — internal operational action, no human gate');
    updateInvestigationLog('B5', null, 'Pending — after-the-fact notification, no approval required');
    res.json({ success: true, state: investigationState });
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
      ],
    });
  });
}
