/** Presenter run-of-show: scenario beats and copy. */

export const SCENARIOS = {
  millennium: {
    id: 'millennium',
    label: 'B — Millennium',
    shortLabel: 'Millennium failing trade',
    tagline: 'Auto-resolve settlement break — no human in the loop',
    footer: 'TRD-2026-048291',
    logPage: 'log',
    beats: [
      {
        id: 'scene',
        step: 1,
        label: 'Set the scene',
        page: 'dashboard',
        hint: 'Post-trade ops desk',
      },
      {
        id: 'problem',
        step: 2,
        label: 'The problem',
        page: 'failing',
        hint: 'TRD-2026-048291 · SSI_MISMATCH',
      },
      {
        id: 'run',
        step: 3,
        label: 'Run WorkHQ',
        page: 'log',
        hint: 'Investigation Log — fire webhook',
        primary: true,
      },
      {
        id: 'proof',
        step: 4,
        label: 'Proof (optional)',
        page: 'investigate',
        tradeId: 'TRD-2026-048291',
        hint: 'SSI comparison',
        optional: true,
      },
    ],
  },
  citadel: {
    id: 'citadel',
    label: 'A — Citadel',
    shortLabel: 'Citadel pricing inquiry',
    tagline: 'Human approves before any client-facing price is sent',
    footer: 'US Treasury 10Y Note',
    logPage: 'inquirylog',
    beats: [
      {
        id: 'scene',
        step: 1,
        label: 'Set the scene',
        page: 'citadelsetup',
        hint: 'Pricing inquiry arrives',
      },
      {
        id: 'run',
        step: 2,
        label: 'Run WorkHQ',
        page: 'inquirylog',
        hint: 'Pricing Inquiry Log — fire webhook',
        primary: true,
      },
    ],
  },
  eod: {
    id: 'eod',
    label: 'C — EOD',
    shortLabel: 'EOD commentary',
    tagline: 'Sales approves before client commentary goes out',
    footer: 'Millennium Management',
    logPage: 'eodlog',
    beats: [
      {
        id: 'scene',
        step: 1,
        label: 'Set the scene',
        page: 'eodsetup',
        hint: '4 pm market close',
      },
      {
        id: 'run',
        step: 2,
        label: 'Run WorkHQ',
        page: 'eodlog',
        hint: 'EOD Commentary Log — fire webhook',
        primary: true,
      },
    ],
  },
};

export const SCENARIO_LIST = Object.values(SCENARIOS);

export const DEMO_DEEP_LINKS = {
  millennium: 'log',
  citadel: 'inquirylog',
  eod: 'eodlog',
};

export function getScenario(id) {
  return SCENARIOS[id] ?? SCENARIOS.millennium;
}

export function getFirstBeatPage(scenarioId) {
  return getScenario(scenarioId).beats[0]?.page ?? 'dashboard';
}

export function findBeatForPage(scenarioId, pageId) {
  const beats = getScenario(scenarioId).beats;
  return beats.find((b) => b.page === pageId) ?? null;
}

export function getBeatIndex(scenarioId, pageId) {
  const beats = getScenario(scenarioId).beats;
  const idx = beats.findIndex((b) => b.page === pageId);
  return idx >= 0 ? idx : 0;
}
