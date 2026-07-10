# SS&C TradeViz Mock

A mock post-trade operations platform for the DeDora / WorkHQ demo — **Scenarios A, B, and C** with deterministic API/webhook endpoints for Blue Prism digital worker integration.

Traditional ops UI with SSI tables, SWIFT message viewers, pricing mock, EOD commentary, and live workflow audit logs.

## Quick Start

```bash
cd TradeViz
npm install
npm run dev
```

- **Frontend:** http://localhost:5174
- **API / Webhooks:** http://localhost:3002

| Scenario | Deep link |
|----------|-----------|
| A — Citadel pricing inquiry | `?demo=citadel` |
| B — Millennium failing trade | `?demo=millennium` |
| C — EOD commentary | `?demo=eod` |

Production: https://scportal.blueprism.com/TradeViz

## Scenario A — Citadel Pricing Inquiry

| Step | Resource | Action |
|------|----------|--------|
| S1 | Signal | Client inquiry received |
| S2 | AI Agent | Read and interpret request |
| S3 | Digital Worker | Retrieve pricing |
| S4 | AI Agent | Draft client-facing reply |
| S5 | Human | Salesperson approves (**human gate**) |
| S6 | Digital Worker | Send reply and log |

See `WORKHQ-SCENARIO-A.md` for WorkHQ wiring.

**Demo:** Citadel Advisors — US Treasury 10Y Note indicative price.

## Scenario B — Millennium Failing Trade

| Step | Resource | Action |
|------|----------|--------|
| B1 | Signal | Failing-trade alert arrives |
| B2 | AI Agent | Review the break, interpret the issue |
| B3 | **Digital Worker** | **Investigate in TradeViz** — identify SSI fix |
| B4 | Digital Worker | Auto-create Ops request (no human gate) |
| B5 | AI Agent | Notify salesperson — status only |

**Demo trade:** `TRD-2026-048291` — US Treasury 10Y, SSI mismatch (BONY stale vs JPM expected).

## Scenario C — EOD Commentary

| Step | Resource | Action |
|------|----------|--------|
| C1 | Signal | Market close (4 pm) |
| C2 | Digital Worker | Pull client activity from TradeViz |
| C3 | AI Agent | Draft end-of-day commentary |
| C4 | Human | Salesperson reviews and approves |
| C5 | Digital Worker | Send commentary and log |

See `WORKHQ-SCENARIO-C.md` for WorkHQ wiring.

## API Endpoints

All endpoints are public (no auth) for digital worker / webhook access. See **API Endpoints** page in the UI for copy-ready URLs.

### Scenario A — Pricing

```bash
curl "http://localhost:3002/functions/getPrice?instrument=US%20Treasury%2010Y%20Note"
curl "http://localhost:3002/api/inquiry-log"
curl -X POST "http://localhost:3002/api/inquiry-log/reset"
```

### Scenario B — Investigate

```bash
curl "http://localhost:3002/functions/investigateTrade?trade_id=TRD-2026-048291"
curl -X POST "http://localhost:3002/api/ops-requests" -H "Content-Type: application/json" \
  -d '{"trade_id":"TRD-2026-048291","action":"UPDATE_SETTLEMENT_INSTRUCTION","ssi_id":"SSI-JPM-4872"}'
curl "http://localhost:3002/api/investigation-log"
```

### Scenario C — EOD

```bash
curl "http://localhost:3002/functions/pullClientActivity?client=Millennium%20Management"
curl "http://localhost:3002/api/eod-log"
curl -X POST "http://localhost:3002/api/eod-log/reset"
```

## UI Pages

| Page | Purpose |
|------|---------|
| Dashboard | Ops KPIs, recent failing trades |
| Failing Trades | Queue of trades needing investigation |
| Investigate | SSI comparison, root cause, fix recommendation |
| Settlement Instructions | SSI master table |
| SWIFT Messages | MT548/MT515 message viewer |
| Pricing Inquiry Log (A) | Scenario A step-by-step audit trail |
| Investigation Log (B) | Scenario B step-by-step audit trail |
| EOD Commentary Log (C) | Scenario C step-by-step audit trail |
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
├── src/           # React ops UI + WorkflowLogView
├── server/
│   ├── data/      # Scenario seed data + log stores (A/B/C)
│   ├── routes/    # API + webhook endpoints
│   └── index.js   # Express server
```

Standalone app — no dependency on SC-Portal. Linked from SC Portal → **Tools → TradeViz Mock**.

## Demo docs

- `DEMO-CHEATSHEET.md` — presenter checklist for all three scenarios
- `WORKHQ-SCENARIO-A.md` — Citadel WorkHQ wiring
- `WORKHQ-SCENARIO-C.md` — EOD WorkHQ wiring
