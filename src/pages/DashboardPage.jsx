import { StatusBadge } from '../components/StatusBadge';

export default function DashboardPage({ stats, trades, onNavigate }) {
  const recentFails = trades.filter((t) => t.status === 'FAILED').slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <p>Post-trade settlement monitoring — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card danger">
          <div className="label">Open Breaks</div>
          <div className="value">{stats?.open_breaks ?? '—'}</div>
        </div>
        <div className="stat-card danger">
          <div className="label">Failed Today</div>
          <div className="value">{stats?.failed_today ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Resolved Today</div>
          <div className="value">{stats?.resolved_today ?? '—'}</div>
        </div>
        <div className="stat-card warning">
          <div className="label">SSI Mismatches</div>
          <div className="value">{stats?.ssi_mismatches ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Settlement</div>
          <div className="value">{stats?.pending_settlement ?? '—'}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent Failing Trades</h2>
          <button className="btn btn-sm" onClick={() => onNavigate('failing')}>
            View All
          </button>
        </div>
        <div className="panel-body flush">
          <table>
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Client</th>
                <th>Instrument</th>
                <th>Break Type</th>
                <th>Settlement</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {recentFails.map((t) => (
                <tr
                  key={t.id}
                  className={`clickable-row ${t.id === 'TRD-2026-048291' ? 'highlight-row' : ''}`}
                  onClick={() => onNavigate('investigate', t.id)}
                >
                  <td><code>{t.id}</code></td>
                  <td>{t.client}</td>
                  <td>{t.instrument}</td>
                  <td>{t.break_type ?? '—'}</td>
                  <td>{t.settlement_date}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><StatusBadge status={t.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
