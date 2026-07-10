import { TRADES } from './scenario.js';

export const EOD_DEMO_CLIENT = 'Millennium Management';
export const EOD_DATE = '2026-07-09';

export const EOD_LOG = [
  {
    step_id: 'C1',
    resource_type: 'Signal',
    action: 'Market close trigger (4 pm)',
    timestamp: null,
    detail: 'Pending — awaiting 4 pm market close trigger from WorkHQ',
    human_gate: false,
  },
  {
    step_id: 'C2',
    resource_type: 'Digital Worker',
    action: 'Pull client activity from TradeViz',
    timestamp: null,
    detail: 'Pending — digital worker will pull client activity from TradeViz',
    human_gate: false,
  },
  {
    step_id: 'C3',
    resource_type: 'AI Agent',
    action: 'Draft end-of-day commentary',
    timestamp: null,
    detail: 'Pending — AI agent will draft end-of-day commentary',
    human_gate: false,
  },
  {
    step_id: 'C4',
    resource_type: 'Human',
    action: 'Salesperson reviews and approves',
    timestamp: null,
    detail: 'Pending — salesperson must review and approve before send',
    human_gate: true,
  },
  {
    step_id: 'C5',
    resource_type: 'Digital Worker',
    action: 'Send commentary and log',
    timestamp: null,
    detail: 'Pending — send approved commentary and log delivery',
    human_gate: false,
  },
];

export const EOD_DRAFT_TEMPLATE = `Millennium Management — End of Day Summary (${EOD_DATE})

Settlement activity: {{trades_today}} trades today. {{settled}} settled successfully.
{{resolved_line}}
{{pending_line}}

Markets closed at 4:00 PM ET. Please reach out with any questions.

— Your SS&C coverage team`;

export function buildEodSummary(clientName = EOD_DEMO_CLIENT) {
  const clientTrades = TRADES.filter((t) => t.client === clientName);
  const today = clientTrades.filter(
    (t) => t.settlement_date === EOD_DATE || t.trade_date === EOD_DATE,
  );
  const failed = today.filter((t) => t.status === 'FAILED');
  const pending = today.filter((t) => t.status === 'PENDING');
  const matched = today.filter((t) => t.status !== 'FAILED' && t.status !== 'PENDING');

  const highlights = [];
  const resolved = clientTrades.find((t) => t.id === 'TRD-2026-048291');
  if (resolved) {
    highlights.push({
      type: 'RESOLVED',
      text: 'SSI mismatch on TRD-2026-048291 resolved via ops request (UPDATE_SETTLEMENT_INSTRUCTION)',
    });
  }
  if (failed.length > 0) {
    highlights.push({
      type: 'OPEN',
      text: `${failed.length} open break(s) under active investigation`,
    });
  }
  if (pending.length > 0) {
    highlights.push({
      type: 'PENDING',
      text: `${pending.length} trade(s) pending settlement`,
    });
  }

  return {
    client: clientName,
    as_of: `${EOD_DATE}T20:00:00.000Z`,
    market_close: `${EOD_DATE}T16:00:00-04:00`,
    summary: {
      trades_today: today.length,
      settled: matched.length,
      pending_settlement: pending.length,
      open_breaks: failed.length,
      resolved_today: resolved ? 1 : 0,
    },
    highlights,
    trades: today.map((t) => ({
      trade_id: t.id,
      instrument: t.instrument,
      side: t.side,
      status: t.status,
      break_type: t.break_type,
      settlement_date: t.settlement_date,
    })),
    draft_template: EOD_DRAFT_TEMPLATE,
  };
}
