# DeDora / WorkHQ Demo — Presenter Cheat Sheet

Three scenarios on **SS&C TradeViz** mock. Use sidebar **Active scenario** switcher or deep links.

| Scenario | URL | Log page |
|----------|-----|----------|
| **A — Citadel** | `https://scportal.blueprism.com/TradeViz/?demo=citadel` | Pricing Inquiry Log |
| **B — Millennium** | `https://scportal.blueprism.com/TradeViz/?demo=millennium` | Investigation Log |
| **C — EOD** | `https://scportal.blueprism.com/TradeViz/?demo=eod` | EOD Commentary Log |

**Pre-flight (all):** Reset Demo → all steps **Pending** · WorkHQ workflow **published** · Delays 2–3s · Webhook ready (don't fire yet)

---

# Scenario B — Millennium Failing Trade

**Trade:** `TRD-2026-048291` · **Client:** Millennium Management · **Break:** SSI_MISMATCH

## Screen setup

| Screen | What to show |
|--------|----------------|
| **Main** | TradeViz **Investigation Log** (large) |
| **Second** | WorkHQ test trigger or Postman `/sync` |

## Live run (~60–90 sec)

1. **Set the scene** — Dashboard → "Post-trade ops desk monitoring breaks."
2. **The problem** — Failing Trades → point at `TRD-2026-048291` / `SSI_MISMATCH`. **Do not click Investigate.**
3. **Audit trail** — Investigation Log → all **Pending**, live polling.
4. **Fire WorkHQ** → narrate B1–B5 as steps complete.
5. **Payoff** — green **Workflow resolved** + Trade/Ops chips.

## Webhook payload

```json
{
  "eventId": "ALERT-2026-07-09-0042",
  "eventType": "failing_trade_alert",
  "trade": {
    "tradeId": "TRD-2026-048291",
    "client": "Millennium Management",
    "breakType": "SSI_MISMATCH",
    "status": "FAILED"
  },
  "request": {
    "priority": "high",
    "requiresApproval": false,
    "source": "workhq-test-harness"
  }
}
```

## One-liner

> "Millennium's Treasury trade failed settlement. WorkHQ receives the alert, investigates in TradeViz, and resolves it — full audit trail, no human in the loop."

---

# Scenario A — Citadel Pricing Inquiry

**Client:** Citadel Advisors · **Instrument:** US Treasury 10Y Note · **Human gate:** S5 before send

## Screen setup

| Screen | What to show |
|--------|----------------|
| **Main** | **Pricing Inquiry Log (A)** |
| **Second** | WorkHQ Citadel workflow trigger |

## Live run (~60–90 sec)

1. **Set the scene** — "Sales gets a pricing inquiry from Citadel on the 10-year Treasury."
2. **Audit trail** — Pricing Inquiry Log → S1–S6 all **Pending**.
3. **Fire WorkHQ** → narrate:
   - **S1** — inquiry received
   - **S2** — AI parses instrument
   - **S3** — price retrieved (98.4375 / 4.12% yield appears)
   - **S4** — draft reply prepared
   - **S5** — **Awaiting approval** (human gate — amber)
   - **S6** — reply sent after approval
4. **Payoff** — **Reply sent** banner + price/draft panels.

## Sample trigger

```json
{
  "inquiryId": "INQ-20260709-0042",
  "client": "Citadel Advisors",
  "instrument": "US Treasury 10Y Note",
  "channel": "email",
  "message": "Can you provide an indicative price on the 10-year Treasury?"
}
```

## One-liner

> "Citadel asks for a Treasury price. WorkHQ pulls pricing, drafts the reply — but a salesperson must approve before anything client-facing goes out."

See `WORKHQ-SCENARIO-A.md` for step-by-step HTTP URLs.

---

# Scenario C — EOD Commentary

**Client:** Millennium Management · **Human gate:** C4 before send

## Screen setup

| Screen | What to show |
|--------|----------------|
| **Main** | **EOD Commentary Log (C)** |
| **Second** | WorkHQ EOD workflow trigger |

## Live run (~60–90 sec)

1. **Set the scene** — "Market close — time for end-of-day client commentary."
2. **Audit trail** — EOD Commentary Log → C1–C5 all **Pending**.
3. **Fire WorkHQ** → narrate:
   - **C1** — market close signal
   - **C2** — activity pulled from TradeViz
   - **C3** — AI drafts commentary
   - **C4** — **Awaiting approval** (human gate)
   - **C5** — commentary sent and logged
4. **Payoff** — **Commentary sent** banner.

## One-liner

> "At 4 pm, WorkHQ pulls today's Millennium activity from TradeViz, drafts EOD commentary, and waits for sales approval before sending."

See `WORKHQ-SCENARIO-C.md` for step-by-step HTTP URLs.

---

# Do / Don't (all scenarios)

| ✓ Do | ✗ Don't |
|------|---------|
| **Reset Demo** before each run | Manually complete steps in TradeViz during auto flow |
| Stay on the log page while WorkHQ runs | Spam Refresh (live polling handles it) |
| Trigger from **WorkHQ / webhook** | Mix scenarios without resetting |

## If something stalls

1. **Request Log** — are webhook calls arriving?
2. **Refresh now** once
3. **Reset Demo** → re-run

## Reset between runs

1. TradeViz → **Reset Demo** (on active log page)
2. WorkHQ → fire webhook again
3. Watch steps fill left → right
