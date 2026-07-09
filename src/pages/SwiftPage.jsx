import { useState, useEffect } from 'react';
import { appPath } from '../appPath';
import { StatusBadge, formatDate } from '../components/StatusBadge';

export default function SwiftPage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(appPath('/api/trades/TRD-2026-048291/swift'))
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        if (d.messages?.length) setSelected(d.messages[0]);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>SWIFT Messages</h1>
        <p>Settlement messaging for TRD-2026-048291 (Millennium scenario)</p>
      </div>

      <div className="investigate-layout">
        <div className="panel">
          <div className="panel-header">
            <h2>Message List</h2>
          </div>
          <div className="panel-body flush">
            <table>
              <thead>
                <tr>
                  <th>Message ID</th>
                  <th>Type</th>
                  <th>Direction</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`clickable-row ${selected?.id === msg.id ? 'highlight-row' : ''}`}
                    onClick={() => setSelected(msg)}
                  >
                    <td><code>{msg.id}</code></td>
                    <td><StatusBadge status={msg.type} /></td>
                    <td>{msg.direction}</td>
                    <td><StatusBadge status={msg.status} /></td>
                    <td>{formatDate(msg.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="panel">
            <div className="panel-header">
              <h2>{selected.id} — {selected.type}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="panel-body">
              <div className="detail-grid" style={{ marginBottom: 14 }}>
                <div className="detail-item">
                  <div className="label">Sender</div>
                  <div className="value"><code>{selected.sender}</code></div>
                </div>
                <div className="detail-item">
                  <div className="label">Receiver</div>
                  <div className="value"><code>{selected.receiver}</code></div>
                </div>
                <div className="detail-item">
                  <div className="label">Direction</div>
                  <div className="value">{selected.direction}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Timestamp</div>
                  <div className="value">{formatDate(selected.timestamp)}</div>
                </div>
              </div>
              {selected.parsed && (
                <div style={{ marginBottom: 14 }}>
                  <strong style={{ fontSize: 12 }}>Parsed Fields</strong>
                  <div className="detail-grid" style={{ marginTop: 8 }}>
                    {Object.entries(selected.parsed).map(([k, v]) => (
                      <div className="detail-item" key={k}>
                        <div className="label">{k}</div>
                        <div className="value">{String(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <pre className="swift-raw">{selected.raw}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
