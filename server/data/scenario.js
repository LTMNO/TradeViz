/** Millennium failing-trade scenario (WorkHQ Storyboard B1–B5). */

export const SSIS = [
  {
    id: 'SSI-JPM-4872',
    custodian: 'JPMorgan Chase',
    account: '487291-SETTLE',
    bic: 'CHASUS33',
    currency: 'USD',
    asset_class: 'Fixed Income',
    status: 'ACTIVE',
    last_validated: '2026-06-28',
    client: 'Millennium Management',
  },
  {
    id: 'SSI-BONY-1104',
    custodian: 'Bank of New York Mellon',
    account: '110482-SETTLE',
    bic: 'IRVTUS3N',
    currency: 'USD',
    asset_class: 'Fixed Income',
    status: 'STALE',
    last_validated: '2025-11-14',
    client: 'Millennium Management',
  },
  {
    id: 'SSI-DB-2291',
    custodian: 'Deutsche Bank',
    account: '229184-SETTLE',
    bic: 'DEUTUS33',
    currency: 'USD',
    asset_class: 'Equity',
    status: 'ACTIVE',
    last_validated: '2026-07-01',
    client: 'Millennium Management',
  },
  {
    id: 'SSI-CITI-8834',
    custodian: 'Citibank',
    account: '883412-SETTLE',
    bic: 'CITIUS33',
    currency: 'USD',
    asset_class: 'Fixed Income',
    status: 'ACTIVE',
    last_validated: '2026-06-15',
    client: 'Citadel Advisors',
  },
];

export const TRADES = [
  {
    id: 'TRD-2026-048291',
    client: 'Millennium Management',
    counterparty: 'Goldman Sachs',
    instrument: 'US Treasury 10Y Note',
    cusip: '91282CJL6',
    isin: 'US91282CJL64',
    side: 'BUY',
    quantity: 50000000,
    price: 98.4375,
    currency: 'USD',
    trade_date: '2026-07-08',
    settlement_date: '2026-07-09',
    status: 'FAILED',
    break_type: 'SSI_MISMATCH',
    priority: 'HIGH',
    assigned_ssi: 'SSI-BONY-1104',
    expected_ssi: 'SSI-JPM-4872',
    custodian: 'Bank of New York Mellon',
    alert_id: 'ALERT-2026-07-09-0042',
    created_at: '2026-07-09T08:14:22Z',
  },
  {
    id: 'TRD-2026-048105',
    client: 'Millennium Management',
    counterparty: 'Barclays',
    instrument: 'Apple Inc Common Stock',
    cusip: '037833100',
    isin: 'US0378331005',
    side: 'SELL',
    quantity: 125000,
    price: 214.82,
    currency: 'USD',
    trade_date: '2026-07-08',
    settlement_date: '2026-07-09',
    status: 'PENDING',
    break_type: null,
    priority: 'NORMAL',
    assigned_ssi: 'SSI-DB-2291',
    expected_ssi: 'SSI-DB-2291',
    custodian: 'Deutsche Bank',
    alert_id: null,
    created_at: '2026-07-08T16:42:11Z',
  },
  {
    id: 'TRD-2026-047892',
    client: 'Citadel Advisors',
    counterparty: 'Morgan Stanley',
    instrument: 'US Treasury 5Y Note',
    cusip: '91282CJZ5',
    isin: 'US91282CJZ58',
    side: 'BUY',
    quantity: 25000000,
    price: 97.125,
    currency: 'USD',
    trade_date: '2026-07-07',
    settlement_date: '2026-07-08',
    status: 'MATCHED',
    break_type: null,
    priority: 'NORMAL',
    assigned_ssi: 'SSI-CITI-8834',
    expected_ssi: 'SSI-CITI-8834',
    custodian: 'Citibank',
    alert_id: null,
    created_at: '2026-07-07T14:20:05Z',
  },
  {
    id: 'TRD-2026-047654',
    client: 'Millennium Management',
    counterparty: 'Credit Suisse',
    instrument: 'Microsoft Corp',
    cusip: '594918104',
    isin: 'US5949181045',
    side: 'BUY',
    quantity: 75000,
    price: 428.15,
    currency: 'USD',
    trade_date: '2026-07-07',
    settlement_date: '2026-07-08',
    status: 'FAILED',
    break_type: 'QUANTITY_MISMATCH',
    priority: 'MEDIUM',
    assigned_ssi: 'SSI-DB-2291',
    expected_ssi: 'SSI-DB-2291',
    custodian: 'Deutsche Bank',
    alert_id: 'ALERT-2026-07-08-0031',
    created_at: '2026-07-07T11:05:33Z',
  },
];

export const SWIFT_MESSAGES = {
  'TRD-2026-048291': [
    {
      id: 'SWIFT-MT548-0042',
      type: 'MT548',
      direction: 'INBOUND',
      timestamp: '2026-07-09T08:12:45Z',
      sender: 'GSILUS33',
      receiver: 'SSCCTECH',
      status: 'FAIL',
      raw: `:16R:GENL
:20C::SEME//TRD2026048291
:23G:INST
:16S:GENL
:16R:STAT
:25D::IPRC//FAIL
:16S:STAT
:16R:SETTRAN
:35B:ISIN US91282CJL64
:36B::SETT//FAMT/50000000,
:97A::SAFE//487291-SETTLE
:95P::SELL//GSILUS33
:95P::BUYR//CHASUS33
:16S:SETTRAN`,
      parsed: {
        settlement_status: 'FAIL',
        reason: 'Settlement instruction mismatch',
        expected_buyer_bic: 'CHASUS33',
        actual_safekeeping: '110482-SETTLE',
        amount: '50000000',
        currency: 'USD',
      },
    },
    {
      id: 'SWIFT-MT515-0041',
      type: 'MT515',
      direction: 'OUTBOUND',
      timestamp: '2026-07-08T17:30:12Z',
      sender: 'SSCCTECH',
      receiver: 'GSILUS33',
      status: 'SENT',
      raw: `:16R:GENL
:20C::SEME//TRD2026048291
:23G:NEWM
:16S:GENL
:16R:CONFDET
:35B:ISIN US91282CJL64
:36B::SETT//FAMT/50000000,
:97A::SAFE//110482-SETTLE
:95P::SELL//GSILUS33
:95P::BUYR//IRVTUS3N
:16S:CONFDET`,
      parsed: {
        settlement_status: 'SENT',
        safekeeping: '110482-SETTLE',
        buyer_bic: 'IRVTUS3N',
        amount: '50000000',
      },
    },
  ],
};

export const INVESTIGATION_LOG = [
  {
    step_id: 'B1',
    resource_type: 'Signal',
    action: 'Failing-trade alert received',
    timestamp: null,
    detail: 'Pending — awaiting failing-trade alert from WorkHQ',
    human_gate: false,
  },
  {
    step_id: 'B2',
    resource_type: 'AI Agent',
    action: 'Review the break, interpret the issue',
    timestamp: null,
    detail: 'Pending — AI agent will interpret the settlement break',
    human_gate: false,
  },
  {
    step_id: 'B3',
    resource_type: 'Digital Worker',
    action: 'Investigate in TradeViz',
    timestamp: null,
    detail: 'Pending — retrieve trade, compare SSIs, identify fix',
    human_gate: false,
  },
  {
    step_id: 'B4',
    resource_type: 'Digital Worker',
    action: 'Auto-create Ops request',
    timestamp: null,
    detail: 'Pending — internal operational action, no human gate',
    human_gate: false,
  },
  {
    step_id: 'B5',
    resource_type: 'AI Agent',
    action: 'Notify salesperson — status only',
    timestamp: null,
    detail: 'Pending — after-the-fact notification, no approval required',
    human_gate: false,
  },
];

export function getSsiById(id) {
  return SSIS.find((s) => s.id === id) ?? null;
}

export function getTradeById(id) {
  return TRADES.find((t) => t.id === id) ?? null;
}

export function investigateTrade(tradeId) {
  const trade = getTradeById(tradeId);
  if (!trade) return null;

  const actualSsi = getSsiById(trade.assigned_ssi);
  const expectedSsi = getSsiById(trade.expected_ssi);

  if (!actualSsi || !expectedSsi) return null;

  const rootCause =
    trade.break_type === 'SSI_MISMATCH'
      ? `Custodian SSI references ${actualSsi.custodian} (${actualSsi.bic}); counterparty expects ${expectedSsi.custodian} (${expectedSsi.bic})`
      : `Break type ${trade.break_type} requires manual review`;

  const swiftMessages = SWIFT_MESSAGES[tradeId] ?? [];

  return {
    trade_id: trade.id,
    client: trade.client,
    break_type: trade.break_type,
    alert_id: trade.alert_id,
    status: 'INVESTIGATED',
    root_cause: rootCause,
    expected_ssi: {
      id: expectedSsi.id,
      custodian: expectedSsi.custodian,
      account: expectedSsi.account,
      bic: expectedSsi.bic,
      status: expectedSsi.status,
    },
    actual_ssi: {
      id: actualSsi.id,
      custodian: actualSsi.custodian,
      account: actualSsi.account,
      bic: actualSsi.bic,
      status: actualSsi.status,
    },
    recommended_fix:
      trade.break_type === 'SSI_MISMATCH'
        ? {
            action: 'UPDATE_SETTLEMENT_INSTRUCTION',
            ssi_id: expectedSsi.id,
            description: `Update settlement instruction from ${actualSsi.id} to ${expectedSsi.id}`,
            auto_executable: true,
            human_gate_required: false,
          }
        : {
            action: 'MANUAL_REVIEW',
            ssi_id: null,
            description: 'Requires ops team manual review',
            auto_executable: false,
            human_gate_required: true,
          },
    evidence: [
      {
        source: 'SWIFT_MT548',
        field: 'SettlementParty',
        value: expectedSsi.bic,
        message_id: swiftMessages[0]?.id ?? null,
      },
      {
        source: 'SSI_MASTER',
        field: 'LastValidated',
        value: actualSsi.last_validated,
        message_id: null,
      },
      {
        source: 'TRADE_RECORD',
        field: 'AssignedSSI',
        value: actualSsi.id,
        message_id: null,
      },
    ],
    investigated_at: new Date().toISOString(),
  };
}

export function getDashboardStats() {
  const failed = TRADES.filter((t) => t.status === 'FAILED');
  const ssiIssues = TRADES.filter((t) => t.break_type === 'SSI_MISMATCH');
  return {
    open_breaks: failed.length,
    failed_today: failed.filter((t) => t.settlement_date === '2026-07-09').length,
    resolved_today: 12,
    ssi_mismatches: ssiIssues.length,
    pending_settlement: TRADES.filter((t) => t.status === 'PENDING').length,
    total_trades: TRADES.length,
  };
}
