import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { LiveFeed } from './pages/LiveFeed';
import { PersonaPage } from './pages/PersonaPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { triggerPipelineRun } from './api/client';
import toast from 'react-hot-toast';

export const App: React.FC = () => {
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const handleTriggerRun = async () => {
    try {
      setIsTriggering(true);
      toast.loading('Triggering autonomous cycle...', { id: 'global-run' });
      const res = await triggerPipelineRun();
      toast.success(
        res.data?.published
          ? 'Autonomous Cycle Complete: New Brief Published!'
          : 'Autonomous Cycle Complete: Evaluated topics.',
        { id: 'global-run' }
      );
    } catch (err: any) {
      toast.error('Cycle execution failed', { id: 'global-run' });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        
        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />

        {/* Global Navigation Bar */}
        <Navbar onTriggerRun={handleTriggerRun} isTriggering={isTriggering} />

        {/* Main Route Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<LiveFeed />} />
            <Route path="/persona" element={<PersonaPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-slate-800/80 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <p>© 2026 SignalForge AI • Autonomous Infrastructure Analyst Engine</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SignalForge Engine Operational</span>
            </p>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
};

export default App;
