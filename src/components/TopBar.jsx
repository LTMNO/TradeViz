import './TopBar.css';

export default function TopBar({ onRefresh }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <span className="logo-ssc">SS&amp;C</span>
          <span className="logo-divider">|</span>
          <span className="logo-product">TradeViz</span>
        </div>
        <span className="topbar-env">Post-Trade Operations</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-user">Ops Desk — Morgan Stanley Demo</span>
        {onRefresh && (
          <button className="btn btn-sm" onClick={onRefresh}>
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}
