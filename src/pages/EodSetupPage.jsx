import DemoRunStrip from '../components/DemoRunStrip';

export default function EodSetupPage({ activeScenario, onNavigate }) {
  return (
    <div>
      {activeScenario && (
        <DemoRunStrip
          scenario={activeScenario}
          activePage="eodsetup"
          onNavigate={onNavigate}
        />
      )}

      <div className="demo-market-close-banner">
        <div className="demo-market-close-time">4:00 PM ET</div>
        <div>
          <h2>Market close</h2>
          <p>End-of-day client commentary workflows are ready to run.</p>
        </div>
      </div>

      <div className="page-header">
        <h1>EOD Commentary Queue</h1>
        <p>Clients scheduled for end-of-day wrap-up</p>
      </div>

      <div className="panel demo-setup-panel">
        <div className="panel-header">
          <h2>Today&apos;s clients</h2>
        </div>
        <div className="panel-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Trades today</th>
                <th>Open breaks</th>
                <th>Commentary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-highlight">
                <td>Millennium Management</td>
                <td>4</td>
                <td>0</td>
                <td>EOD wrap-up</td>
                <td><span className="status-pill status-ready">Ready at close</span></td>
              </tr>
            </tbody>
          </table>
          <p className="demo-setup-next">
            Next: open <strong>Run WorkHQ</strong> in the strip above, turn <strong>Live</strong> on,
            then fire the EOD workflow from WorkHQ.
          </p>
        </div>
      </div>
    </div>
  );
}
