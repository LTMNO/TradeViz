import { useState } from 'react';

export default function ApiEndpointsPage({ endpoints }) {
  const [copied, setCopied] = useState(null);

  function copy(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!endpoints) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>API Endpoints</h1>
        <p>HTTP and webhook endpoints for Blue Prism digital worker integration</p>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body">
          <div className="detail-item">
            <div className="label">Base URL</div>
            <div className="value"><code>{endpoints.base_url}</code></div>
          </div>
        </div>
      </div>

      {endpoints.endpoints?.map((ep) => (
        <div className="endpoint-card" key={ep.path + ep.method}>
          <div>
            <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
            <span className="path">{ep.path}</span>
          </div>
          <div className="desc">{ep.description}</div>
          <div className="example">
            <code>{ep.example}</code>
            <button className="btn btn-sm" onClick={() => copy(ep.example, ep.path)}>
              {copied === ep.path ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ))}

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <h2>Blue Prism — Scenario B Flow</h2>
        </div>
        <div className="panel-body">
          <pre style={{ lineHeight: 1.6, fontSize: 12 }}>{`# B3 — Investigate in TradeViz (digital worker)
GET ${endpoints.base_url}/api/trades?status=failed&client=millennium
GET ${endpoints.base_url}/api/trades/TRD-2026-048291/investigate

# Or webhook alias:
GET ${endpoints.base_url}/functions/investigateTrade?trade_id=TRD-2026-048291

# B4 — Auto-create Ops request (digital worker, no human gate)
POST ${endpoints.base_url}/api/ops-requests
Content-Type: application/json

{
  "trade_id": "TRD-2026-048291",
  "action": "UPDATE_SETTLEMENT_INSTRUCTION",
  "ssi_id": "SSI-JPM-4872"
}

# Or webhook alias:
POST ${endpoints.base_url}/functions/createOpsRequest
Content-Type: application/json

{
  "trade_id": "TRD-2026-048291",
  "action": "UPDATE_SETTLEMENT_INSTRUCTION",
  "ssi_id": "SSI-JPM-4872"
}`}</pre>
        </div>
      </div>
    </div>
  );
}
