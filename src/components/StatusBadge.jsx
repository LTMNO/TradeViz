const RESOURCE_COLORS = {
  Signal: 'signal',
  'AI Agent': 'agent',
  'Digital Worker': 'worker',
  Human: 'human',
};

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
  return <span className={`step-badge ${cls}`} style={{ width: 'auto', height: 'auto', padding: '2px 8px', borderRadius: '3px', fontSize: '10px' }}>{type}</span>;
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
