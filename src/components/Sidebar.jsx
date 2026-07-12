import './Sidebar.css';
import { SCENARIO_LIST, getScenario } from '../demoConfig';

const EXPLORE_NAV = [
  { id: 'dashboard', label: 'Dashboard', section: 'main' },
  { id: 'failing', label: 'Failing Trades', section: 'main' },
  { id: 'investigate', label: 'Investigate', section: 'main' },
  { id: 'ssi', label: 'Settlement Instructions', section: 'data' },
  { id: 'swift', label: 'SWIFT Messages', section: 'data' },
  { id: 'inquirylog', label: 'Pricing Inquiry Log (A)', section: 'demo' },
  { id: 'log', label: 'Investigation Log (B)', section: 'demo' },
  { id: 'eodlog', label: 'EOD Commentary Log (C)', section: 'demo' },
  { id: 'api', label: 'API Endpoints', section: 'demo' },
  { id: 'debug', label: 'Request Log', section: 'demo' },
];

const EXPLORE_SECTIONS = [
  { key: 'main', label: 'Operations' },
  { key: 'data', label: 'Reference Data' },
  { key: 'demo', label: 'Demo / Integration' },
];

export default function Sidebar({
  activePage,
  onNavigate,
  demoMode,
  onSwitchDemo,
  exploreMode,
  onExploreModeChange,
  onStartDemo,
  startingDemo,
}) {
  const activeScenario = demoMode ? getScenario(demoMode) : getScenario('millennium');

  if (!exploreMode) {
    return (
      <aside className="sidebar sidebar-demo">
        <div className="sidebar-demo-hero">
          <div className="sidebar-section-label">Demo console</div>
          <p className="sidebar-demo-tagline">{activeScenario.tagline}</p>
          <button
            type="button"
            className="btn btn-sm btn-start-demo"
            onClick={onStartDemo}
            disabled={startingDemo}
          >
            {startingDemo ? 'Starting…' : 'Start demo'}
          </button>
        </div>

        <div className="sidebar-demo-switcher">
          <div className="sidebar-section-label">Scenario</div>
          <div className="demo-switcher-buttons">
            {SCENARIO_LIST.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`demo-switcher-btn ${demoMode === scenario.id ? 'active' : ''}`}
                onClick={() => onSwitchDemo?.(scenario.id)}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Run of show</div>
          <nav>
            {activeScenario.beats.map((beat) => (
              <button
                key={beat.id}
                type="button"
                className={`nav-item nav-item-beat ${activePage === beat.page ? 'active' : ''}`}
                onClick={() => onNavigate(beat.page, beat.tradeId)}
              >
                <span className="nav-beat-step">{beat.step}</span>
                <span className="nav-beat-text">
                  <span className="nav-beat-label">{beat.label}</span>
                  <span className="nav-beat-hint">{beat.hint}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-scenario">{activeScenario.shortLabel}</div>
          <div className="sidebar-trade">{activeScenario.footer}</div>
          <button
            type="button"
            className="sidebar-explore-link"
            onClick={() => onExploreModeChange?.(true)}
          >
            Explore full app →
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {demoMode && (
        <div className="sidebar-explore-banner">
          <button
            type="button"
            className="sidebar-back-demo"
            onClick={() => onExploreModeChange?.(false)}
          >
            ← Back to demo mode
          </button>
        </div>
      )}

      {demoMode && (
        <div className="sidebar-demo-switcher">
          <div className="sidebar-section-label">Active scenario</div>
          <div className="demo-switcher-buttons">
            {SCENARIO_LIST.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`demo-switcher-btn ${demoMode === scenario.id ? 'active' : ''}`}
                onClick={() => {
                  onSwitchDemo?.(scenario.id);
                }}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {EXPLORE_SECTIONS.map((section) => (
        <div key={section.key} className="sidebar-section">
          <div className="sidebar-section-label">{section.label}</div>
          <nav>
            {EXPLORE_NAV.filter((item) => item.section === section.key).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      ))}

      {demoMode && (
        <div className="sidebar-footer">
          <div className="sidebar-scenario">{activeScenario.label}</div>
          <div className="sidebar-trade">{activeScenario.footer}</div>
        </div>
      )}
    </aside>
  );
}
