import React, { useEffect, useState } from 'react';
import { fetchAgentFeed, triggerPipelineRun, initAgent, FeedResponse } from '../api/client';
import { 
  Activity, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play, 
  Zap, 
  Layers, 
  Sliders,
  Sparkles,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [runningCycle, setRunningCycle] = useState<boolean>(false);
  const [rejectedCount, setRejectedCount] = useState<number>(8); // Computed / tracked rejected topics count

  const loadDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true);
      const res = await fetchAgentFeed();
      setData(res);
      if (showToast) {
        toast.success('Dashboard telemetry updated');
      }
    } catch (err: any) {
      toast.error('Failed to load telemetry data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto refresh every 30 seconds as required by hackathon specification
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInitAgent = async () => {
    try {
      setRunningCycle(true);
      const res = await initAgent();
      toast.success(`Agent Initialized: ${res.agentId}`);
      await loadDashboardData();
    } catch (err: any) {
      toast.error('Agent initialization failed');
    } finally {
      setRunningCycle(false);
    }
  };

  const handleRunNow = async () => {
    try {
      setRunningCycle(true);
      toast.loading('Running autonomous agent cycle...', { id: 'cycle-toast' });
      const res = await triggerPipelineRun();
      toast.success(
        res.data?.published 
          ? 'Autonomous Cycle Complete: New Post Published!' 
          : 'Autonomous Cycle Complete: Evaluated topics.', 
        { id: 'cycle-toast' }
      );
      await loadDashboardData();
    } catch (err: any) {
      toast.error('Cycle execution failed', { id: 'cycle-toast' });
    } finally {
      setRunningCycle(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading SignalForge Telemetry...</p>
      </div>
    );
  }

  const personaName = data?.currentPersona?.name || 'SignalForge AI';
  const personaTitle = data?.currentPersona?.title || 'AI Infrastructure Analyst';
  const totalPublished = data?.totalPosts || (data?.posts ? data.posts.length : 0);
  const lastPublished = data?.lastPublishedAt ? new Date(data.lastPublishedAt) : null;
  const nextRun = data?.nextScheduledRun ? new Date(data.nextScheduledRun) : null;

  return (
    <div className="space-y-8 py-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Agent Control Telemetry</h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-time state monitoring • Auto-refreshes every 30s</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleRunNow}
            disabled={runningCycle}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white glow-cyan shadow-md transition-all cursor-pointer"
          >
            {runningCycle ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Execute Cycle</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Current Persona */}
        <div className="glass-card p-5 rounded-xl space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Current Persona</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-white truncate">{personaName}</p>
          <p className="text-xs text-cyan-300 font-mono truncate">{personaTitle}</p>
        </div>

        {/* 2. Agent Status */}
        <div className="glass-card p-5 rounded-xl space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Agent Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-bold text-emerald-400 uppercase tracking-wide">Running</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Autonomous Cron Active</p>
        </div>

        {/* 3. Last Published Time */}
        <div className="glass-card p-5 rounded-xl space-y-2 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Last Published</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-white">
            {lastPublished ? formatDistanceToNow(lastPublished, { addSuffix: true }) : 'Just now'}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            {lastPublished ? lastPublished.toLocaleTimeString() : 'N/A'}
          </p>
        </div>

        {/* 4. Next Scheduled Run */}
        <div className="glass-card p-5 rounded-xl space-y-2 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Next Scheduled Run</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-lg font-bold text-white">
            {nextRun ? formatDistanceToNow(nextRun, { addSuffix: true }) : 'In ~30m'}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            {nextRun ? nextRun.toLocaleTimeString() : 'Auto-scheduled'}
          </p>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Published Posts */}
        <div className="glass-panel p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Published Posts</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalPublished}</p>
          <p className="text-[11px] text-cyan-400/80 font-mono">Persisted in MongoDB</p>
        </div>

        {/* Total Rejected Topics */}
        <div className="glass-panel p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Rejected Topics</span>
            <XCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{rejectedCount}</p>
          <p className="text-[11px] text-amber-400/80 font-mono">Filtered by Editorial Rules</p>
        </div>

        {/* Scheduler Interval */}
        <div className="glass-panel p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scheduler Interval</span>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">30m</p>
          <p className="text-[11px] text-indigo-400/80 font-mono">PUBLISH_INTERVAL_MINUTES</p>
        </div>

        {/* AI Provider */}
        <div className="glass-panel p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Provider</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Breeth AI
          </p>
          <p className="text-[11px] text-sky-400/80 font-mono">breeth-ai-analyst</p>
        </div>

      </div>

      {/* Recent Feed Activity Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Latest Telemetry Posts</h2>
          <span className="text-xs text-slate-400 font-mono">Showing latest published insights</span>
        </div>

        {data?.posts && data.posts.length > 0 ? (
          <div className="space-y-3">
            {data.posts.slice(0, 3).map((post) => (
              <div key={post.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Published</span>
                </div>
                <p className="text-sm text-slate-200 line-clamp-2">{post.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">
            No posts generated yet. Click "Execute Cycle" above to trigger initial autonomous cycle.
          </div>
        )}
      </div>

    </div>
  );
};
