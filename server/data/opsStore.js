import { v4 as uuidv4 } from 'uuid';

const opsRequests = [];

export function listOpsRequests() {
  return [...opsRequests].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
}

export function createOpsRequest({ trade_id, action, ssi_id, source = 'api' }) {
  const record = {
    id: `OPS-${uuidv4().slice(0, 8).toUpperCase()}`,
    trade_id,
    action,
    ssi_id,
    status: 'OPEN',
    source,
    created_at: new Date().toISOString(),
  };
  opsRequests.unshift(record);
  return record;
}

export function getOpsRequest(id) {
  return opsRequests.find((r) => r.id === id) ?? null;
}
