import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Rss, ArrowRight, Zap, ShieldCheck, Activity, BrainCircuit, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  return (
    <div className="space-y-12 py-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-8 sm:p-12 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous AI Infrastructure Analyst Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Self-Steering Telemetry & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              AI Infrastructure Insights
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            SignalForge AI autonomously scans live technology signals, applies multi-dimensional editorial intelligence, consults long-term memory, and produces expert infrastructure briefs without manual intervention.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg glow-cyan transition-all duration-200"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Agent Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/feed"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold border border-slate-700 transition-all duration-200"
            >
              <Rss className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Feed</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-xl space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Live Topic Ingestion</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Continuously monitors HackerNews, TechCrunch, and developer security feeds for breaking compute and LLM infrastructure signals.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-xl space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Editorial Intelligence</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Scores topics across 6 multi-dimensional metrics (technical relevance, impact, novelty, duplicate risk) rejecting low-value noise.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-xl space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Breeth AI & Memory Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Consults persistent post history and past opinions to eliminate duplicate content and maintain strict persona voice consistency.
          </p>
        </motion.div>

      </section>

      {/* Persona Showcase Banner */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Active Persona: SignalForge AI</h2>
          </div>
          <p className="text-sm text-slate-400">
            Autonomous Voice: AI Infrastructure Analyst • Domain: GPU Scaling, LLM Telemetry, MLOps
          </p>
        </div>

        <Link
          to="/persona"
          className="px-5 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 text-sm whitespace-nowrap transition-colors"
        >
          View Persona Specs
        </Link>
      </section>

    </div>
  );
};
