import { useState, useEffect, useCallback } from 'react';
import { appPath } from './appPath';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import FailingTradesPage from './pages/FailingTradesPage';
import InvestigatePage from './pages/InvestigatePage';
import SsiPage from './pages/SsiPage';
import SwiftPage from './pages/SwiftPage';
import InvestigationLogPage from './pages/InvestigationLogPage';
import InquiryLogPage from './pages/InquiryLogPage';
import EodLogPage from './pages/EodLogPage';
import CitadelSetupPage from './pages/CitadelSetupPage';
import EodSetupPage from './pages/EodSetupPage';
import ApiEndpointsPage from './pages/ApiEndpointsPage';
import DebugPage from './pages/DebugPage';
import { getScenario, getFirstBeatPage } from './demoConfig';
import './App.css';

const PAGES = {
  dashboard: DashboardPage,
  failing: FailingTradesPage,
  investigate: InvestigatePage,
  ssi: SsiPage,
  swift: SwiftPage,
  log: InvestigationLogPage,
  inquirylog: InquiryLogPage,
  eodlog: EodLogPage,
  citadelsetup: CitadelSetupPage,
  eodsetup: EodSetupPage,
  api: ApiEndpointsPage,
  debug: DebugPage,
};

const LOG_PAGES = new Set(['log', 'inquirylog', 'eodlog']);
const LIVE_POLL_KEY = 'tradeviz-live-polling';
const EXPLORE_KEY = 'tradeviz-explore-mode';
const LIVE_POLL_MS = 500;
const DEFAULT_SCENARIO = 'millennium';

function getDemoMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('demo');
}

function getInitialLivePolling() {
  try {
    const saved = localStorage.getItem(LIVE_POLL_KEY);
    if (saved !== null) return saved === 'true';
  } catch {
    /* ignore */
  }
  return !!getDemoMode();
}

function getInitialExploreMode() {
  try {
    const saved = localStorage.getItem(EXPLORE_KEY);
    if (saved !== null) return saved === 'true';
  } catch {
    /* ignore */
  }
  return !getDemoMode();
}

function getInitialPage() {
  const demo = getDemoMode();
  if (demo) return getFirstBeatPage(demo);
  return 'dashboard';
}

function getInitialTradeId() {
  const demo = getDemoMode();
  return demo === 'millennium' ? 'TRD-2026-048291' : null;
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [selectedTradeId, setSelectedTradeId] = useState(getInitialTradeId);
  const [demoMode, setDemoMode] = useState(getDemoMode() || DEFAULT_SCENARIO);
  const [exploreMode, setExploreMode] = useState(getInitialExploreMode);
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [ssis, setSsis] = useState([]);
  const [log, setLog] = useState(null);
  const [inquiryLog, setInquiryLog] = useState(null);
  const [eodLog, setEodLog] = useState(null);
  const [logUpdatedAt, setLogUpdatedAt] = useState(null);
  const [inquiryLogUpdatedAt, setInquiryLogUpdatedAt] = useState(null);
  const [eodLogUpdatedAt, setEodLogUpdatedAt] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [startingDemo, setStartingDemo] = useState(false);
  const [livePolling, setLivePolling] = useState(getInitialLivePolling);

  const activeScenario = getScenario(demoMode);

  const refreshLog = useCallback(async () => {
    const res = await fetch(appPath(`/api/investigation-log?_=${Date.now()}`), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return;
    setLog(await res.json());
    setLogUpdatedAt(Date.now());
  }, []);

  const refreshInquiryLog = useCallback(async () => {
    const res = await fetch(appPath(`/api/inquiry-log?_=${Date.now()}`), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return;
    setInquiryLog(await res.json());
    setInquiryLogUpdatedAt(Date.now());
  }, []);

  const refreshEodLog = useCallback(async () => {
    const res = await fetch(appPath(`/api/eod-log?_=${Date.now()}`), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return;
    setEodLog(await res.json());
    setEodLogUpdatedAt(Date.now());
  }, []);

  const refresh = useCallback(async () => {
    const [statsRes, tradesRes, ssiRes, logRes, inquiryRes, eodRes, epRes] = await Promise.all([
      fetch(appPath('/api/stats')),
      fetch(appPath('/api/trades')),
      fetch(appPath('/api/ssi')),
      fetch(appPath('/api/investigation-log')),
      fetch(appPath('/api/inquiry-log')),
      fetch(appPath('/api/eod-log')),
      fetch(appPath('/api/endpoints')),
    ]);
    setStats(await statsRes.json());
    const tradesData = await tradesRes.json();
    setTrades(tradesData.trades ?? []);
    const ssiData = await ssiRes.json();
    setSsis(ssiData.ssis ?? []);
    setLog(await logRes.json());
    setInquiryLog(await inquiryRes.json());
    setEodLog(await eodRes.json());
    setEndpoints(await epRes.json());
  }, []);

  function setLivePollingEnabled(enabled) {
    setLivePolling(enabled);
    try {
      localStorage.setItem(LIVE_POLL_KEY, String(enabled));
    } catch {
      /* ignore */
    }
    if (enabled && LOG_PAGES.has(page)) {
      refreshLog();
      refreshInquiryLog();
      refreshEodLog();
    }
  }

  function setExploreModeEnabled(enabled) {
    setExploreMode(enabled);
    try {
      localStorage.setItem(EXPLORE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
    if (!enabled) {
      const beat = activeScenario.beats[0];
      if (beat) navigateToBeat(beat.page, beat.tradeId);
    }
  }

  useEffect(() => {
    refresh();
    refreshLog();
    refreshInquiryLog();
    refreshEodLog();
  }, [refresh, refreshLog, refreshInquiryLog, refreshEodLog]);

  useEffect(() => {
    if (!livePolling) return undefined;
    if (!LOG_PAGES.has(page)) return undefined;

    const interval = setInterval(() => {
      refreshLog();
      refreshInquiryLog();
      refreshEodLog();
    }, LIVE_POLL_MS);
    return () => clearInterval(interval);
  }, [page, livePolling, refreshLog, refreshInquiryLog, refreshEodLog]);

  function navigateToBeat(targetPage, tradeId) {
    if (tradeId) setSelectedTradeId(tradeId);
    setPage(targetPage);
  }

  function navigate(targetPage, tradeId) {
    navigateToBeat(targetPage, tradeId);
  }

  function switchDemo(mode) {
    setDemoMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set('demo', mode);
    window.history.replaceState({}, '', url);
    if (mode === 'millennium') {
      setSelectedTradeId('TRD-2026-048291');
    }
    if (!exploreMode) {
      navigateToBeat(getFirstBeatPage(mode));
    }
  }

  async function resetAllDemos() {
    setResetting(true);
    try {
      const [invRes, inqRes, eodRes] = await Promise.all([
        fetch(appPath('/api/investigation-log/reset'), { method: 'POST' }),
        fetch(appPath('/api/inquiry-log/reset'), { method: 'POST' }),
        fetch(appPath('/api/eod-log/reset'), { method: 'POST' }),
      ]);
      const [invData, inqData, eodData] = await Promise.all([
        invRes.json(),
        inqRes.json(),
        eodRes.json(),
      ]);
      if (invData.log) setLog(invData.log);
      else await refreshLog();
      if (inqData.log) setInquiryLog(inqData.log);
      else await refreshInquiryLog();
      if (eodData.log) setEodLog(eodData.log);
      else await refreshEodLog();
      const now = Date.now();
      setLogUpdatedAt(now);
      setInquiryLogUpdatedAt(now);
      setEodLogUpdatedAt(now);
    } finally {
      setResetting(false);
    }
  }

  async function startDemo() {
    setStartingDemo(true);
    try {
      await resetAllDemos();
      setLivePollingEnabled(true);
      setExploreMode(false);
      try {
        localStorage.setItem(EXPLORE_KEY, 'false');
      } catch {
        /* ignore */
      }
      const beat = activeScenario.beats[0];
      if (beat) navigateToBeat(beat.page, beat.tradeId);
    } finally {
      setStartingDemo(false);
    }
  }

  const topBarRefresh = page === 'log'
    ? refreshLog
    : page === 'inquirylog'
      ? refreshInquiryLog
      : page === 'eodlog'
        ? refreshEodLog
        : refresh;

  const PageComponent = PAGES[page] || DashboardPage;

  const pageProps = {
    stats,
    trades,
    ssis,
    endpoints,
    selectedTradeId,
    onNavigate: navigate,
    demoMode,
    onSwitchDemo: switchDemo,
    exploreMode,
    activeScenario: exploreMode ? null : activeScenario,
  };

  if (page === 'log') {
    Object.assign(pageProps, {
      log,
      onReset: resetAllDemos,
      onRefresh: refreshLog,
      logUpdatedAt,
      resetting,
      livePolling,
      onLivePollingChange: setLivePollingEnabled,
      startingDemo,
    });
  } else if (page === 'inquirylog') {
    Object.assign(pageProps, {
      log: inquiryLog,
      onReset: resetAllDemos,
      onRefresh: refreshInquiryLog,
      logUpdatedAt: inquiryLogUpdatedAt,
      resetting,
      livePolling,
      onLivePollingChange: setLivePollingEnabled,
      startingDemo,
    });
  } else if (page === 'eodlog') {
    Object.assign(pageProps, {
      log: eodLog,
      onReset: resetAllDemos,
      onRefresh: refreshEodLog,
      logUpdatedAt: eodLogUpdatedAt,
      resetting,
      livePolling,
      onLivePollingChange: setLivePollingEnabled,
      startingDemo,
    });
  }

  return (
    <div className="app">
      <TopBar
        onRefresh={topBarRefresh}
        exploreMode={exploreMode}
        onExploreModeChange={setExploreModeEnabled}
        onStartDemo={startDemo}
        startingDemo={startingDemo || resetting}
        scenarioLabel={activeScenario.shortLabel}
      />
      <div className="app-body">
        <Sidebar
          activePage={page}
          onNavigate={navigate}
          demoMode={demoMode}
          onSwitchDemo={switchDemo}
          exploreMode={exploreMode}
          onExploreModeChange={setExploreModeEnabled}
          onStartDemo={startDemo}
          startingDemo={startingDemo || resetting}
        />
        <main className="main-content">
          <PageComponent {...pageProps} />
        </main>
      </div>
    </div>
  );
}
