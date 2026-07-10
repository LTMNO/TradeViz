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
  api: ApiEndpointsPage,
  debug: DebugPage,
};

function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === 'millennium') return 'log';
  return 'dashboard';
}

function getInitialTradeId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === 'millennium' ? 'TRD-2026-048291' : null;
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [selectedTradeId, setSelectedTradeId] = useState(getInitialTradeId);
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [ssis, setSsis] = useState([]);
  const [log, setLog] = useState(null);
  const [logUpdatedAt, setLogUpdatedAt] = useState(null);
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

  const refresh = useCallback(async () => {
    const [statsRes, tradesRes, ssiRes, logRes, epRes] = await Promise.all([
      fetch(appPath('/api/stats')),
      fetch(appPath('/api/trades')),
      fetch(appPath('/api/ssi')),
      fetch(appPath('/api/investigation-log')),
      fetch(appPath('/api/endpoints')),
    ]);
    setStats(await statsRes.json());
    const tradesData = await tradesRes.json();
    setTrades(tradesData.trades ?? []);
    const ssiData = await ssiRes.json();
    setSsis(ssiData.ssis ?? []);
    setLog(await logRes.json());
    setEndpoints(await epRes.json());
  }, []);

  useEffect(() => {
    refresh();
    refreshLog();
  }, [refresh, refreshLog]);

  // Always keep investigation log fresh in the background (demo side-by-side with WorkHQ).
  useEffect(() => {
    const interval = setInterval(refreshLog, page === 'log' ? 500 : 2000);
    return () => clearInterval(interval);
  }, [page, refreshLog]);

  function navigate(targetPage, tradeId) {
    if (tradeId) setSelectedTradeId(tradeId);
    setPage(targetPage);
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

  const topBarRefresh = page === 'log' ? refreshLog : refresh;

  const PageComponent = PAGES[page] || DashboardPage;

  return (
    <div className="app">
      <TopBar onRefresh={topBarRefresh} />
      <div className="app-body">
        <Sidebar activePage={page} onNavigate={navigate} />
        <main className="main-content">
          <PageComponent
            stats={stats}
            trades={trades}
            ssis={ssis}
            log={log}
            endpoints={endpoints}
            selectedTradeId={selectedTradeId}
            onNavigate={navigate}
            onReset={resetDemo}
            onRefresh={refreshLog}
            logUpdatedAt={logUpdatedAt}
            resetting={resetting}
          />
        </main>
      </div>
    </div>
  );
}
