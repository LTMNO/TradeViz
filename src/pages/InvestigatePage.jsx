import { useState, useEffect } from 'react';
import { appPath } from '../appPath';
import { StatusBadge, formatCurrency, formatDate } from '../components/StatusBadge';
import DemoRunStrip from '../components/DemoRunStrip';

const DEMO_TRADE = 'TRD-2026-048291';

export default function InvestigatePage({ selectedTradeId, onNavigate, activeScenario }) {
  const tradeId = selectedTradeId || DEMO_TRADE;
  const [trade, setTrade] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [swift, setSwift] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opsResult, setOpsResult] = useState(null);

  useEffect(() => {
    setInvestigation(null);
    setOpsResult(null);
    fetch(appPath(`/api/trades/${tradeId}`))
      .then((r) => r.json())
      .then(setTrade);
    fetch(appPath(`/api/trades/${tradeId}/swift`))
      .then((r) => r.json())
      .then((d) => setSwift(d.messages ?? []));
  }, [tradeId]);

  async function runInvestigation() {
    setLoading(true);
    try {
      const res = await fetch(appPath(`/api/trades/${tradeId}/investigate`));
      const data = await res.json();
      setInvestigation(data);
    } finally {
      setLoading(false);
    }
  }

  async function createOpsRequest() {
    if (!investigation?.recommended_fix) return;
    const res = await fetch(appPath('/api/ops-requests'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trade_id: tradeId,
        action: investigation.recommended_fix.action,
        ssi_id: investigation.recommended_fix.ssi_id,
        source: 'ui',
      }),
    });
    const data = await res.json();
    setOpsResult(data.request);
  }

  if (!trade) return <div>Loading trade...</div>;

  return (
    <div>
      {activeScenario && (
        <DemoRunStrip
          scenario={activeScenario}
          activePage="investigate"
          onNavigate={onNavigate}
        />
      )}

      <div className="page-header">
        <h1>Investigate Trade</h1>
        <p>
          <code>{trade.id}</code> — {trade.client} / {trade.instrument}
        </p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Trade Details</h2>
          <StatusBadge status={trade.status} />
        </div>
        <div className="panel-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">Client</div>
              <div className="value">{trade.client}</div>
            </div>
            <div className="detail-item">
              <div className="label">Counterparty</div>
              <div className="value">{trade.counterparty}</div>
            </div>
            <div className="detail-item">
              <div className="label">Instrument</div>
              <div className="value">{trade.instrument}</div>
            </div>
            <div className="detail-item">
              <div className="label">CUSIP / ISIN</div>
              <div className="value">{trade.cusip} / {trade.isin}</div>
            </div>
            <div className="detail-item">
              <div className="label">Side / Quantity</div>
              <div className="value">{trade.side} {formatCurrency(trade.quantity)}</div>
            </div>
            <div className="detail-item">
              <div className="label">Price</div>
              <div className="value">{trade.price}</div>
            </div>
            <div className="detail-item">
              <div className="label">Trade Date</div>
              <div className="value">{trade.trade_date}</div>
            </div>
            <div className="detail-item">
              <div className="label">Settlement Date</div>
              <div className="value">{trade.settlement_date}</div>
            </div>
            <div className="detail-item">
              <div className="label">Break Type</div>
              <div className="value"><StatusBadge status={trade.break_type} /></div>
            </div>
            <div className="detail-item">
              <div className="label">Alert</div>
              <div className="value">{trade.alert_id ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>SSI Comparison</h2>
          {!investigation && (
            <button className="btn btn-primary btn-sm" onClick={runInvestigation} disabled={loading}>
              {loading ? 'Investigating...' : 'Run Investigation (B3)'}
            </button>
          )}
        </div>
        <div className="panel-body">
          {investigation ? (
            <>
              <div className="comparison-grid">
                <div className="comparison-card expected">
                  <h3>Expected SSI</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="label">SSI ID</div>
                      <div className="value"><code>{investigation.expected_ssi.id}</code></div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Custodian</div>
                      <div className="value">{investigation.expected_ssi.custodian}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Account</div>
                      <div className="value">{investigation.expected_ssi.account}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">BIC</div>
                      <div className="value"><code>{investigation.expected_ssi.bic}</code></div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Status</div>
                      <div className="value"><StatusBadge status={investigation.expected_ssi.status} /></div>
                    </div>
                  </div>
                </div>
                <div className="comparison-card actual">
                  <h3>Actual SSI (Assigned)</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="label">SSI ID</div>
                      <div className="value"><code>{investigation.actual_ssi.id}</code></div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Custodian</div>
                      <div className="value">{investigation.actual_ssi.custodian}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Account</div>
                      <div className="value">{investigation.actual_ssi.account}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">BIC</div>
                      <div className="value"><code>{investigation.actual_ssi.bic}</code></div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Status</div>
                      <div className="value"><StatusBadge status={investigation.actual_ssi.status} /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fix-banner" style={{ marginTop: 16 }}>
                <h3>Root Cause</h3>
                <p>{investigation.root_cause}</p>
                <h3 style={{ marginTop: 10 }}>Recommended Fix</h3>
                <p>
                  <strong>{investigation.recommended_fix.action}</strong>
                  {investigation.recommended_fix.ssi_id && (
                    <> → <code>{investigation.recommended_fix.ssi_id}</code></>
                  )}
                </p>
                <p style={{ fontSize: 12, color: 'var(--tv-gray-50)', marginTop: 4 }}>
                  {investigation.recommended_fix.description}
                  {investigation.recommended_fix.auto_executable && ' — Auto-executable, no human gate.'}
                </p>
                {!opsResult && investigation.recommended_fix.auto_executable && (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={createOpsRequest}>
                    Create Ops Request (B4)
                  </button>
                )}
                {opsResult && (
                  <p style={{ marginTop: 10, fontWeight: 600, color: 'var(--tv-green)' }}>
                    Ops request created: <code>{opsResult.id}</code>
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--tv-gray-50)' }}>
              Click &quot;Run Investigation&quot; to compare settlement instructions and identify the fix.
              This mirrors the B3 digital worker step.
            </p>
          )}
        </div>
      </div>

      {swift.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <h2>SWIFT Messages</h2>
          </div>
          <div className="panel-body">
            {swift.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <code>{msg.id}</code>
                  <StatusBadge status={msg.type} />
                  <StatusBadge status={msg.status} />
                  <span style={{ fontSize: 11, color: 'var(--tv-gray-50)' }}>
                    {msg.direction} — {formatDate(msg.timestamp)}
                  </span>
                </div>
                <pre className="swift-raw">{msg.raw}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
