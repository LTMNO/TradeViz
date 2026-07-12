import './TopBar.css';

export default function TopBar({
  onRefresh,
  exploreMode,
  onExploreModeChange,
  onStartDemo,
  startingDemo,
  scenarioLabel,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <span className="logo-ssc">SS&amp;C</span>
          <span className="logo-divider">|</span>
          <span className="logo-product">TradeViz</span>
        </div>
        <span className="topbar-env">
          {exploreMode ? 'Explore mode' : scenarioLabel ?? 'Demo mode'}
        </span>
      </div>
      <div className="topbar-right">
        {!exploreMode && onStartDemo && (
          <button
            type="button"
            className="btn btn-sm btn-topbar-primary"
            onClick={onStartDemo}
            disabled={startingDemo}
          >
            {startingDemo ? 'Starting…' : 'Start demo'}
          </button>
        )}
        {onExploreModeChange && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onExploreModeChange(!exploreMode)}
          >
            {exploreMode ? 'Demo mode' : 'Explore'}
          </button>
        )}
        {onRefresh && (
          <button type="button" className="btn btn-sm" onClick={onRefresh}>
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}
