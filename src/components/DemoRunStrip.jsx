import './DemoRunStrip.css';

export default function DemoRunStrip({
  scenario,
  activePage,
  onNavigate,
  compact = false,
}) {
  if (!scenario?.beats?.length) return null;

  const activeIdx = scenario.beats.findIndex((b) => b.page === activePage);

  return (
    <nav className={`demo-run-strip ${compact ? 'demo-run-strip-compact' : ''}`} aria-label="Demo run of show">
      <div className="demo-run-strip-head">
        <span className="demo-run-strip-kicker">{scenario.label}</span>
        <span className="demo-run-strip-tagline">{scenario.tagline}</span>
      </div>
      <ol className="demo-run-beats">
        {scenario.beats.map((beat, index) => {
          const isActive = beat.page === activePage;
          const isDone = activeIdx >= 0 && index < activeIdx;
          const state = isActive ? 'active' : isDone ? 'done' : 'pending';

          return (
            <li key={beat.id} className={`demo-run-beat demo-run-beat-${state}`}>
              {index > 0 && <span className="demo-run-beat-arrow" aria-hidden="true">›</span>}
              <button
                type="button"
                className="demo-run-beat-btn"
                onClick={() => onNavigate(beat.page, beat.tradeId)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="demo-run-beat-step">{beat.step}</span>
                <span className="demo-run-beat-label">{beat.label}</span>
                {!compact && beat.hint && (
                  <span className="demo-run-beat-hint">{beat.hint}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
