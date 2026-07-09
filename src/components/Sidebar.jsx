import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', section: 'main' },
  { id: 'failing', label: 'Failing Trades', section: 'main' },
  { id: 'investigate', label: 'Investigate', section: 'main' },
  { id: 'ssi', label: 'Settlement Instructions', section: 'data' },
  { id: 'swift', label: 'SWIFT Messages', section: 'data' },
  { id: 'log', label: 'Investigation Log', section: 'demo' },
  { id: 'api', label: 'API Endpoints', section: 'demo' },
  { id: 'debug', label: 'Request Log', section: 'demo' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const sections = [
    { key: 'main', label: 'Operations' },
    { key: 'data', label: 'Reference Data' },
    { key: 'demo', label: 'Demo / Integration' },
  ];

  return (
    <aside className="sidebar">
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
        <div className="sidebar-scenario">Scenario B — Millennium</div>
        <div className="sidebar-trade">TRD-2026-048291</div>
      </div>
    </aside>
  );
}
