const RESOURCE_COLORS = {
  Signal: 'signal',
  'AI Agent': 'agent',
  'Digital Worker': 'worker',
  Human: 'human',
};

function ResourceIcon({ type }) {
  const icons = {
    Signal: (
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <circle cx="8" cy="12" r="1.2" fill="currentColor" />
        <path d="M8 11V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5.5 7.5a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M3.5 5.5a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    'AI Agent': (
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          d="M8 1.5l.9 2.7 2.7.9-2.7.9L8 8.9 7.1 6.1 4.4 5.1l2.7-.9L8 1.5z"
          fill="currentColor"
        />
        <path
          d="M12.5 9l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
          fill="currentColor"
        />
      </svg>
    ),
    'Digital Worker': (
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <rect x="3" y="5" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="6" cy="8.5" r="0.9" fill="currentColor" />
        <circle cx="10" cy="8.5" r="0.9" fill="currentColor" />
        <path d="M8 5V3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8" cy="2.3" r="0.9" fill="currentColor" />
      </svg>
    ),
    Human: (
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <circle cx="8" cy="5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return <span className="resource-badge-icon">{icons[type] ?? icons.Signal}</span>;
}

export function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  const styles = {
    FAILED: { bg: 'var(--tv-red-bg)', color: 'var(--tv-red)' },
    MATCHED: { bg: 'var(--tv-green-bg)', color: 'var(--tv-green)' },
    PENDING: { bg: 'var(--tv-amber-bg)', color: 'var(--tv-amber)' },
    ACTIVE: { bg: 'var(--tv-green-bg)', color: 'var(--tv-green)' },
    STALE: { bg: 'var(--tv-red-bg)', color: 'var(--tv-red)' },
    INVESTIGATED: { bg: 'var(--tv-blue-light)', color: 'var(--tv-blue)' },
    OPEN: { bg: 'var(--tv-amber-bg)', color: 'var(--tv-amber)' },
    HIGH: { bg: 'var(--tv-red-bg)', color: 'var(--tv-red)' },
    MEDIUM: { bg: 'var(--tv-amber-bg)', color: 'var(--tv-amber)' },
    NORMAL: { bg: 'var(--tv-gray-20)', color: 'var(--tv-gray-70)' },
    SENT: { bg: 'var(--tv-blue-light)', color: 'var(--tv-blue)' },
    FAIL: { bg: 'var(--tv-red-bg)', color: 'var(--tv-red)' },
  };

  const style = styles[s] ?? { bg: 'var(--tv-gray-20)', color: 'var(--tv-gray-70)' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {s}
    </span>
  );
}

export function ResourceBadge({ type }) {
  const cls = RESOURCE_COLORS[type] ?? 'signal';
  return (
    <span className={`resource-badge step-badge ${cls}`}>
      <ResourceIcon type={type} />
      <span>{type}</span>
    </span>
  );
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
