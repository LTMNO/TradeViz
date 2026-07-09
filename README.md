# SS&C TradeViz Mock

A mock post-trade operations platform for the DeDora / WorkHQ demo — specifically **Scenario B (Millennium failing trade)**, step **B3: Investigate in TradeViz**.

Traditional ops UI with SSI tables, SWIFT message viewers, and deterministic API/webhook endpoints for Blue Prism digital worker integration.

## Quick Start

```bash
cd TradeViz
npm install
npm run dev
```

- **Frontend:** http://localhost:5174
- **API / Webhooks:** http://localhost:3002

Millennium demo deep-link: http://localhost:5174/?demo=millennium

## Scenario B — Millennium Failing Trade

| Step | Resource | Action |
|------|----------|--------|
| B1 | Signal | Failing-trade alert arrives |
| B2 | AI Agent | Review the break, interpret the issue |
| B3 | **Digital Worker** | **Investigate in TradeViz** — identify SSI fix |
| B4 | Digital Worker | Auto-create Ops request (no human gate) |
| B5 | AI Agent | Notify salesperson — status only |

**Demo trade:** `TRD-2026-048291` — US Treasury 10Y, SSI mismatch (BONY stale vs JPM expected).

## API Endpoints

All endpoints are public (no auth) for digital worker / webhook access.

### B3 — Investigate (Digital Worker)

```bash
# List failing trades for Millennium
curl "http://localhost:3002/api/trades?status=failed&client=millennium"

# Investigate — returns SSI comparison + recommended fix
curl "http://localhost:3002/api/trades/TRD-2026-048291/investigate"

# Webhook alias
curl "http://localhost:3002/functions/investigateTrade?trade_id=TRD-2026-048291"
```

### B4 — Create Ops Request (Digital Worker)

```bash
curl -X POST "http://localhost:3002/api/ops-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "trade_id": "TRD-2026-048291",
    "action": "UPDATE_SETTLEMENT_INSTRUCTION",
    "ssi_id": "SSI-JPM-4872"
  }'

# Webhook alias
curl -X POST "http://localhost:3002/functions/createOpsRequest" \
  -H "Content-Type: application/json" \
  -d '{
    "trade_id": "TRD-2026-048291",
    "action": "UPDATE_SETTLEMENT_INSTRUCTION",
    "ssi_id": "SSI-JPM-4872"
  }'
```

### Reference Data

```bash
# Settlement instructions
curl "http://localhost:3002/api/ssi?client=millennium"

# SWIFT messages for a trade
curl "http://localhost:3002/api/trades/TRD-2026-048291/swift"

# Investigation log (audit trail)
curl "http://localhost:3002/api/investigation-log"

# Reset demo state
curl -X POST "http://localhost:3002/api/investigation-log/reset"
```

## UI Pages

| Page | Purpose |
|------|---------|
| Dashboard | Ops KPIs, recent failing trades |
| Failing Trades | Queue of trades needing investigation |
| Investigate | SSI comparison, root cause, fix recommendation |
| Settlement Instructions | SSI master table |
| SWIFT Messages | MT548/MT515 message viewer |
| Investigation Log | Scenario B step-by-step audit trail |
| API Endpoints | Copy-ready URLs for Blue Prism |
| Request Log | Live API request monitor |

## Production Build

```bash
npm run build
npm start
```

Serves the built React app and API from port 3002.

## Environment

Copy `.env.example` to `.env`:

```
PORT=3002
BASE_PATH=/TradeViz
PUBLIC_BASE_URL=https://scportal.blueprism.com/TradeViz
```

Set `BASE_PATH` when serving under a subpath (e.g. `/TradeViz` on scportal). Set `PUBLIC_BASE_URL` for correct API endpoint URLs in the UI.

## Architecture

```
TradeViz/
├── src/           # React ops UI
├── server/
│   ├── data/      # Millennium scenario + ops request store
│   ├── routes/    # API + webhook endpoints
│   └── index.js   # Express server
```

Standalone app — no dependency on SC-Portal. Citadel (Scenario A) and EOD commentary (Scenario C) can be added as secondary data in a future phase.
