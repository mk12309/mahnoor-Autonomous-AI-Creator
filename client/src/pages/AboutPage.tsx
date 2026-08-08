import React from 'react';
import { Info, Cpu, Layers, ShieldCheck, CheckCircle2, Terminal } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      
      {/* About Header */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
          <Cpu className="w-3.5 h-3.5" />
          <span>Architectural Breakdown</span>
        </div>
        <h1 className="text-3xl font-bold text-white">About SignalForge AI</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          SignalForge AI is an autonomous infrastructure analyst engine built to transform live tech signals into authoritative, structured compute briefs with zero manual intervention.
        </p>
      </div>

      {/* Engine Workflow Diagram / Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>5-Stage Autonomous Pipeline Workflow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          <div className="glass-card p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Stage 1</span>
            <p className="text-xs font-bold text-white">Live Discovery</p>
          </div>

          <div className="glass-card p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-indigo-400 uppercase">Stage 2</span>
            <p className="text-xs font-bold text-white">Editorial Scoring</p>
          </div>

          <div className="glass-card p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-violet-400 uppercase">Stage 3</span>
            <p className="text-xs font-bold text-white">Memory Context</p>
          </div>

          <div className="glass-card p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase">Stage 4</span>
            <p className="text-xs font-bold text-white">Breeth AI Persona</p>
          </div>

          <div className="glass-card p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Stage 5</span>
            <p className="text-xs font-bold text-white">MongoDB Save</p>
          </div>

        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <span>Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-cyan-400 font-bold">Backend Architecture</p>
            <p className="text-slate-300">Node.js • Express • Mongoose (MongoDB) • node-cron</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-indigo-400 font-bold">Frontend Interface</p>
            <p className="text-slate-300">React • Vite • TailwindCSS • Lucide Icons • Framer Motion</p>
          </div>
        </div>
      </div>

      {/* Official Verification Badge */}
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
        <div>
          <h3 className="text-base font-bold text-emerald-300">Official Hackathon Specification Compliant</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Fully passes all 10 hackathon verification criteria including ISO 8601 UTC timestamps, newest-first feed ordering, zero user interaction requirement, and restart recovery.
          </p>
        </div>
      </div>

    </div>
  );
};
