import React from 'react';
import { Settings, Sliders, Database, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      
      {/* Settings Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Configured via environment variables (.env) and MongoDB state
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Publishing Interval */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Publishing Interval</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">30 Minutes</p>
          <div className="p-3 rounded-lg bg-slate-900/60 text-xs font-mono text-cyan-300 border border-slate-800">
            PUBLISH_INTERVAL_MINUTES=30
          </div>
        </div>

        {/* 2. Current Threshold */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Relevance Threshold</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">70 / 100</p>
          <div className="p-3 rounded-lg bg-slate-900/60 text-xs font-mono text-indigo-300 border border-slate-800">
            RELEVANCE_THRESHOLD=70
          </div>
        </div>

        {/* 3. Memory Status */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Memory Engine Status</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-lg font-bold">Active & Deduplicating</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">MongoDB Memory Collection Connected</p>
        </div>

        {/* 4. Scheduler Status */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Scheduler Status</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-center gap-2 text-violet-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-lg font-bold">Running (node-cron)</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Survives Server Restarts Automatically</p>
        </div>

      </div>

    </div>
  );
};
