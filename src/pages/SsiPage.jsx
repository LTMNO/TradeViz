import { StatusBadge, formatDate } from '../components/StatusBadge';

export default function SsiPage({ ssis }) {
  return (
    <div>
      <div className="page-header">
        <h1>Settlement Instructions</h1>
        <p>Standard settlement instruction master — {ssis.length} records</p>
      </div>

      <div className="panel">
        <div className="panel-body flush">
          <table>
            <thead>
              <tr>
                <th>SSI ID</th>
                <th>Client</th>
                <th>Custodian</th>
                <th>Account</th>
                <th>BIC</th>
                <th>Asset Class</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Last Validated</th>
              </tr>
            </thead>
            <tbody>
              {ssis.map((s) => (
                <tr key={s.id} className={s.status === 'STALE' ? 'highlight-row' : ''}>
                  <td><code>{s.id}</code></td>
                  <td>{s.client}</td>
                  <td>{s.custodian}</td>
                  <td>{s.account}</td>
                  <td><code>{s.bic}</code></td>
                  <td>{s.asset_class}</td>
                  <td>{s.currency}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.last_validated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
