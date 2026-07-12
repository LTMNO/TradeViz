import DemoRunStrip from '../components/DemoRunStrip';

export default function CitadelSetupPage({ activeScenario, onNavigate }) {
  return (
    <div>
      {activeScenario && (
        <DemoRunStrip
          scenario={activeScenario}
          activePage="citadelsetup"
          onNavigate={onNavigate}
        />
      )}

      <div className="page-header">
        <h1>Client Inquiries</h1>
        <p>Sales coverage — pricing requests awaiting response</p>
      </div>

      <div className="panel demo-setup-panel">
        <div className="panel-header">
          <h2>Inbox</h2>
          <span className="demo-setup-badge">New</span>
        </div>
        <div className="panel-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inquiry ID</th>
                <th>Client</th>
                <th>Instrument</th>
                <th>Channel</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-highlight">
                <td><code>INQ-20260709-0042</code></td>
                <td>Citadel Advisors</td>
                <td>US Treasury 10Y Note</td>
                <td>Email</td>
                <td>Today · 3:12 PM</td>
                <td><span className="status-pill status-open">Awaiting price</span></td>
              </tr>
            </tbody>
          </table>
          <div className="demo-setup-quote">
            <div className="demo-setup-quote-label">Message</div>
            <p>
              Can you provide an indicative price on the 10-year Treasury?
            </p>
          </div>
          <p className="demo-setup-next">
            Next: open <strong>Run WorkHQ</strong> in the strip above, turn <strong>Live</strong> on,
            then fire the Citadel workflow from WorkHQ.
          </p>
        </div>
      </div>
    </div>
  );
}
