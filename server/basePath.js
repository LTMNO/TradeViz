function normalizeBasePath(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed === '/') return '';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/$/, '');
}

export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH);
