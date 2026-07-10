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
import ApiEndpointsPage from './pages/ApiEndpointsPage';
import DebugPage from './pages/DebugPage';
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
  api: ApiEndpointsPage,
  debug: DebugPage,
};

const DEMO_PAGES = {
  millennium: 'log',
  citadel: 'inquirylog',
  eod: 'eodlog',
};

const LOG_PAGES = new Set(['log', 'inquirylog', 'eodlog']);

function getDemoMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('demo');
}

function getInitialPage() {
  const demo = getDemoMode();
  return DEMO_PAGES[demo] ?? 'dashboard';
}

function getInitialTradeId() {
  const demo = getDemoMode();
  return demo === 'millennium' ? 'TRD-2026-048291' : null;
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [selectedTradeId, setSelectedTradeId] = useState(getInitialTradeId);
  const [demoMode, setDemoMode] = useState(getDemoMode);
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

  useEffect(() => {
    refresh();
    refreshLog();
    refreshInquiryLog();
    refreshEodLog();
  }, [refresh, refreshLog, refreshInquiryLog, refreshEodLog]);

  useEffect(() => {
    const pollMs = LOG_PAGES.has(page) ? 500 : 2000;
    const interval = setInterval(() => {
      refreshLog();
      refreshInquiryLog();
      refreshEodLog();
    }, pollMs);
    return () => clearInterval(interval);
  }, [page, refreshLog, refreshInquiryLog, refreshEodLog]);

  function navigate(targetPage, tradeId) {
    if (tradeId) setSelectedTradeId(tradeId);
    setPage(targetPage);
  }

  function switchDemo(mode) {
    setDemoMode(mode);
    const url = new URL(window.location.href);
    if (mode) url.searchParams.set('demo', mode);
    else url.searchParams.delete('demo');
    window.history.replaceState({}, '', url);
    if (mode === 'millennium') {
      setSelectedTradeId('TRD-2026-048291');
      setPage('log');
    } else if (mode === 'citadel') {
      setPage('inquirylog');
    } else if (mode === 'eod') {
      setPage('eodlog');
    }
  }

  async function resetDemo() {
    setResetting(true);
    try {
      const res = await fetch(appPath('/api/investigation-log/reset'), { method: 'POST' });
      const data = await res.json();
      if (data.log) setLog(data.log);
      else await refreshLog();
    } finally {
      setResetting(false);
    }
  }

  async function resetInquiryDemo() {
    setResetting(true);
    try {
      const res = await fetch(appPath('/api/inquiry-log/reset'), { method: 'POST' });
      const data = await res.json();
      if (data.log) setInquiryLog(data.log);
      else await refreshInquiryLog();
    } finally {
      setResetting(false);
    }
  }

  async function resetEodDemo() {
    setResetting(true);
    try {
      const res = await fetch(appPath('/api/eod-log/reset'), { method: 'POST' });
      const data = await res.json();
      if (data.log) setEodLog(data.log);
      else await refreshEodLog();
    } finally {
      setResetting(false);
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
  };

  if (page === 'log') {
    Object.assign(pageProps, {
      log,
      onReset: resetDemo,
      onRefresh: refreshLog,
      logUpdatedAt,
      resetting,
    });
  } else if (page === 'inquirylog') {
    Object.assign(pageProps, {
      log: inquiryLog,
      onReset: resetInquiryDemo,
      onRefresh: refreshInquiryLog,
      logUpdatedAt: inquiryLogUpdatedAt,
      resetting,
    });
  } else if (page === 'eodlog') {
    Object.assign(pageProps, {
      log: eodLog,
      onReset: resetEodDemo,
      onRefresh: refreshEodLog,
      logUpdatedAt: eodLogUpdatedAt,
      resetting,
    });
  }

  return (
    <div className="app">
      <TopBar onRefresh={topBarRefresh} />
      <div className="app-body">
        <Sidebar activePage={page} onNavigate={navigate} demoMode={demoMode} onSwitchDemo={switchDemo} />
        <main className="main-content">
          <PageComponent {...pageProps} />
        </main>
      </div>
    </div>
  );
}
