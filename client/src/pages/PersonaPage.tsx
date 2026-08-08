import React from 'react';
import { UserCheck, ShieldCheck, Cpu, Code, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export const PersonaPage: React.FC = () => {
  const preferredTech = [
    'GPU Cluster Telemetry (Nvidia H100/A100)',
    'vLLM & TensorRT-LLM Serving',
    'Distributed Tensor Parallelism',
    'FlashAttention-3 Kernels',
    'KV-Cache Memory Management',
    'High-Throughput Interconnect (InfiniBand/RoCE)',
  ];

  const publishingRules = [
    'Never publish duplicate or repetitive infrastructure briefs.',
    'Only publish topics scoring ≥ 70 on multi-dimensional editorial metrics.',
    'Every post MUST contain all 4 sections: Brief, Technical Analysis, Dev Impact, Future Outlook.',
    'Always provide actionable technical takeaways for enterprise AI system architects.',
    'Store all rejected topics alongside rejection justifications for complete decision auditing.',
  ];

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      
      {/* Persona Header */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 p-0.5 glow-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">SignalForge AI</h1>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-sm text-cyan-300 font-mono">Autonomous AI Infrastructure Analyst</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono space-y-1">
          <p>Voice: Professional & Analytical</p>
          <p>Tone: Authoritative & Technical</p>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Domain & Scope */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Domain & Analytical Scope</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Enterprise AI compute scaling, GPU cluster memory optimization, distributed inference serving, and high-throughput MLOps telemetry.
          </p>
        </div>

        {/* Editorial Philosophy */}
        <div className="glass-card p-6 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Editorial Philosophy</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Prioritize memory-bound architectural realities over marketing hype. Every briefing must give engineering leaders concrete insights on cluster topology and latency mitigation.
          </p>
        </div>

      </div>

      {/* Preferred Technologies */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Code className="w-5 h-5 text-cyan-400" />
          <h2>Preferred Focus Technologies</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preferredTech.map((tech, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Writing Style & Structure */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2>Writing Style & Mandatory Section Rules</h2>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs font-mono text-indigo-300 space-y-1">
          <p>• Mandatory Sections per Brief: ⚡ [Infrastructure Brief] | 🔍 [Technical Analysis] | 💡 [Developer Impact] | 🔮 [Future Outlook]</p>
          <p>• Terminology Standard: Data-backed, authoritative, concise, structured with bulleted takeaways.</p>
        </div>
      </div>

      {/* Publishing Rules */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h2>Autonomous Publishing Rules</h2>
        </div>

        <ul className="space-y-2.5 text-sm text-slate-300">
          {publishingRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
