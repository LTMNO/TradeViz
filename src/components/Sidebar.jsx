import './Sidebar.css';

const NAV_ITEMS = [
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

const DEMO_SCENARIOS = [
  { id: 'citadel', label: 'A — Citadel Inquiry', page: 'inquirylog', footer: 'US Treasury 10Y Note' },
  { id: 'millennium', label: 'B — Millennium', page: 'log', footer: 'TRD-2026-048291' },
  { id: 'eod', label: 'C — EOD Commentary', page: 'eodlog', footer: 'Millennium Management' },
];

export default function Sidebar({ activePage, onNavigate, demoMode, onSwitchDemo }) {
  const sections = [
    { key: 'main', label: 'Operations' },
    { key: 'data', label: 'Reference Data' },
    { key: 'demo', label: 'Demo / Integration' },
  ];

  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === demoMode) ?? DEMO_SCENARIOS[1];

  return (
    <aside className="sidebar">
      <div className="sidebar-demo-switcher">
        <div className="sidebar-section-label">Active scenario</div>
        <div className="demo-switcher-buttons">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`demo-switcher-btn ${demoMode === scenario.id ? 'active' : ''}`}
              onClick={() => {
                onSwitchDemo?.(scenario.id);
                onNavigate(scenario.page);
              }}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.key} className="sidebar-section">
          <div className="sidebar-section-label">{section.label}</div>
          <nav>
            {NAV_ITEMS.filter((item) => item.section === section.key).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      ))}
      <div className="sidebar-footer">
        <div className="sidebar-scenario">{activeScenario.label}</div>
        <div className="sidebar-trade">{activeScenario.footer}</div>
      </div>
    </aside>
  );
}
