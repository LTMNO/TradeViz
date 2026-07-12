# Scenario C — EOD Commentary (WorkHQ builder prompt)

Connect to TradeViz at `https://scportal.blueprism.com/TradeViz`

## Resource type rules

| Step | Resource | Action |
|------|----------|--------|
| **C1** | Signal | Market close (4 pm trigger) |
| **C2** | HTTP Request | Pull client activity from TradeViz |
| **C3** | AI Agent | Draft end-of-day commentary |
| **C4** | Human | Salesperson reviews and approves (**human gate**) |
| **C5** | HTTP Request | Send commentary and log |

**Governance:** Client-facing output → human approval **before** send (C4 gates C5).

---

## TradeViz endpoints

### C2 — Pull client activity
```
GET https://scportal.blueprism.com/TradeViz/functions/pullClientActivity?client=Millennium%20Management
```
Returns `summary` (trades, breaks, highlights) and updates EOD log step C2.

Or read-only:
```
GET https://scportal.blueprism.com/TradeViz/api/eod-summary?client=Millennium%20Management
```

### C1 — Log market close (optional)
```
GET https://scportal.blueprism.com/TradeViz/functions/logMarketClose?client=Millennium%20Management
```

### C3 — Log draft (after agent step)
```
POST https://scportal.blueprism.com/TradeViz/api/eod-log/step?step_id=C3&detail=Draft%20ready
```

### C4 — Human approval
```
POST https://scportal.blueprism.com/TradeViz/api/eod-log/approve?approved_by=Alex%20Morgan&detail=Approved%20for%20send
```

### C5 — Send and log
```
POST https://scportal.blueprism.com/TradeViz/api/eod-log/send?commentary_id=EOD-20260709-001
```

### Reset demo
```
POST https://scportal.blueprism.com/TradeViz/api/eod-log/reset
```

---

## Import workflow JSON

**File:** `workflows/Scenario C — EOD Commentary.json` (also in Downloads)

WorkHQ → **Import** → select file → **Publish**

After import:
1. Add **Delay** steps (2–3s) between HTTP steps for demo pacing (same as Scenario B)
2. For live human pause at **C4**: insert **Create User Task & Wait for Response** *before* the "Log C4" HTTP step; assign to your salesperson; complete the task in **My WorkHQ → Tasks** before the workflow continues

---

## Suggested flow

```
C1  Schedule/webhook trigger (4 pm) OR manual test trigger
    → optional GET logMarketClose
C2  HTTP GET pullClientActivity
C3  AI Agent — draft commentary using {{step_C2.body.summary}}
    → POST eod-log/step?step_id=C3
C4  Human approval (WorkHQ My Tasks / human step)
    → POST eod-log/approve
C5  HTTP POST eod-log/send
    → Return Response with commentary_id
```

Add **Delay** steps (2–3s) between HTTP steps for live demo pacing.

---

## Demo UI

Open: `https://scportal.blueprism.com/TradeViz/?demo=eod`

- Sidebar → **C — EOD Commentary**
- Watch **EOD Commentary Log (C)** fill C1→C5
- C4 shows **Awaiting approval** (amber human gate)
- C2 snapshot and C3 draft appear below the flow when complete

---

## Narrative vs Scenario B

| | Scenario B | Scenario C |
|---|------------|------------|
| Trigger | Failing-trade alert | 4 pm market close |
| TradeViz role | B3 investigate (hero) | C2 data feed |
| Human gate | None | **C4 before client send** |
| Story | Auto-fix internal ops | Salesperson controls client-facing output |

Run Scenario B earlier in the day demo; Scenario C wraps up EOD for the same client (Millennium).
