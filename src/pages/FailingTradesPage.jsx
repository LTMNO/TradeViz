import { StatusBadge } from '../components/StatusBadge';
import DemoRunStrip from '../components/DemoRunStrip';

export default function FailingTradesPage({ trades, onNavigate, activeScenario }) {
  const failing = trades.filter((t) => t.status === 'FAILED');

  return (
    <div>
      {activeScenario && (
        <DemoRunStrip
          scenario={activeScenario}
          activePage="failing"
          onNavigate={onNavigate}
        />
      )}

      <div className="page-header">
        <h1>Failing Trades</h1>
        <p>{failing.length} trade{failing.length !== 1 ? 's' : ''} requiring investigation</p>
      </div>

      <div className="panel">
        <div className="panel-body flush">
          <table>
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Client</th>
                <th>Counterparty</th>
                <th>Instrument</th>
                <th>Break Type</th>
                <th>Trade Date</th>
                <th>Settlement</th>
                <th>Priority</th>
                <th>Alert</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {failing.map((t) => (
                <tr
                  key={t.id}
                  className={t.id === 'TRD-2026-048291' ? 'highlight-row' : ''}
                >
                  <td><code>{t.id}</code></td>
                  <td>{t.client}</td>
                  <td>{t.counterparty}</td>
                  <td>{t.instrument}</td>
                  <td><StatusBadge status={t.break_type} /></td>
                  <td>{t.trade_date}</td>
                  <td>{t.settlement_date}</td>
                  <td><StatusBadge status={t.priority} /></td>
                  <td>{t.alert_id ? <code>{t.alert_id}</code> : '—'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigate('investigate', t.id)}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
