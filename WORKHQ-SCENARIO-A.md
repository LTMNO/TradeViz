# Scenario A — Citadel Pricing Inquiry (WorkHQ builder prompt)

Connect to TradeViz pricing mock at `https://scportal.blueprism.com/TradeViz`

## Resource type rules

| Step | Resource | Action |
|------|----------|--------|
| **S1** | Signal | Client inquiry arrives |
| **S2** | AI Agent | Read and interpret request |
| **S3** | HTTP Request | Retrieve pricing (`getPrice`) |
| **S4** | AI Agent | Draft client-facing reply |
| **S5** | Human | Salesperson approves (**human gate**) |
| **S6** | HTTP Request | Send reply and log |

**Governance:** Client-facing price → human approval **before** send (S5 gates S6).

---

## TradeViz endpoints

### S3 — Retrieve price
```
GET https://scportal.blueprism.com/TradeViz/functions/getPrice?instrument=US%20Treasury%2010Y%20Note&client=Citadel%20Advisors
```

Returns:
```json
{
  "success": true,
  "price": {
    "instrument": "US Treasury 10Y Note",
    "price": 98.4375,
    "yield_pct": 4.12,
    "client": "Citadel Advisors"
  },
  "log": { ... }
}
```

### S1 — Log inquiry (optional)
```
GET https://scportal.blueprism.com/TradeViz/functions/logClientInquiry?client=Citadel%20Advisors&instrument=US%20Treasury%2010Y%20Note
```

### S4 — Log draft
```
POST https://scportal.blueprism.com/TradeViz/api/inquiry-log/step?step_id=S4&detail=Draft%20ready
```

### S5 — Human approval
```
POST https://scportal.blueprism.com/TradeViz/api/inquiry-log/approve?approved_by=Alex%20Morgan
```

### S6 — Send and log
```
POST https://scportal.blueprism.com/TradeViz/api/inquiry-log/send?message_id=MSG-20260709-0042
```

### Reset
```
POST https://scportal.blueprism.com/TradeViz/api/inquiry-log/reset
```

---

## Suggested flow

```
S1  Webhook — Citadel inquiry trigger
    → optional GET logClientInquiry
S2  AI Agent — parse instrument (10Y Treasury)
S3  HTTP GET getPrice
S4  AI Agent — draft reply using {{step_S3.body.price}}
    → POST inquiry-log/step?step_id=S4
S5  Human approval (My Tasks)
    → POST inquiry-log/approve
S6  HTTP POST inquiry-log/send
    → Return Response
```

Add **Delay** steps (2–3s) between HTTP steps for live demo pacing.

---

## Demo UI

`https://scportal.blueprism.com/TradeViz/?demo=citadel`

- Sidebar → **A — Citadel Inquiry**
- **Pricing Inquiry Log (A)** — S1→S6 flow chart
- S5 shows amber **Awaiting approval** human gate
- S3 price snapshot + S4 draft appear when complete

---

## Sample trigger payload

```json
{
  "inquiryId": "INQ-20260709-0042",
  "client": "Citadel Advisors",
  "instrument": "US Treasury 10Y Note",
  "channel": "email",
  "message": "Can you provide an indicative price on the 10-year Treasury?"
}
```

---

## Narrative vs B and C

| | A — Citadel | B — Millennium | C — EOD |
|---|-------------|----------------|---------|
| Human gate | **S5 before client send** | None | **C4 before client send** |
| TradeViz role | S3 pricing | B3 investigate | C2 activity feed |
| Story | Sales controls client price | Ops auto-fixes break | EOD wrap-up |
