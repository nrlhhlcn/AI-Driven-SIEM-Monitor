import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import { Bell, Search, User } from 'lucide-react';

import Dashboard from './components/dashboard/Dashboard';
import LiveLogs from './components/logs/LiveLogs';
import ThreatMap from './components/threats/ThreatMap';
import Settings from './components/dashboard/Settings';
import AlarmHistory from './components/alarms/AlarmHistory';
import AlarmModal from './components/alarms/AlarmModal';
import AIAnalysis from './components/ai/AIAnalysis';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Alarm History sayfasına yönlendirme için event listener
  useEffect(() => {
    const handleNavigateToAlarms = () => {
      setActiveTab('alarms');
    };
    
    window.addEventListener('navigateToAlarms', handleNavigateToAlarms);
    return () => window.removeEventListener('navigateToAlarms', handleNavigateToAlarms);
  }, []);

  return (
    <div className="flex h-screen bg-siem-bg text-white">
      
      {/* SOL MENÜ */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* SAĞ ANA ALAN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER (ÜST BAR) */}
        <header className="h-20 bg-siem-bg/50 border-b border-siem-border flex items-center justify-between px-8 backdrop-blur-sm">
          
          {/* Sayfa Başlığı */}
          <h2 className="text-2xl font-semibold capitalize tracking-tight">
            {activeTab === 'dashboard' ? 'Güvenlik Paneli' : 
             activeTab === 'ai' ? 'Yapay Zeka Analizi' : 
             activeTab}
          </h2>

          {/* Sağ Araçlar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="IP veya Event ID Ara..." 
                className="bg-siem-card border border-siem-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-siem-accent w-64 text-gray-300"
              />
            </div>
            
            <button className="relative">
              <Bell size={20} className="text-gray-400 hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-siem-alert rounded-full"></span>
            </button>

            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center border border-white/10">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* İÇERİK ALANI */}
        <div className={`flex-1 p-8 ${activeTab === 'logs' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'logs' && <LiveLogs />}
          {activeTab === 'threats' && <ThreatMap />}
          {activeTab === 'alarms' && <AlarmHistory />}
          {activeTab === 'ai' && <AIAnalysis />}
          {activeTab === 'settings' && <Settings />}
          
          {/* Diğer sekmeler için geçici yer tutucu */}
          {activeTab !== 'dashboard' &&
            activeTab !== 'logs' &&
            activeTab !== 'threats' &&
            activeTab !== 'alarms' &&
            activeTab !== 'ai' &&
            activeTab !== 'settings' && (
            <div className="border-2 border-dashed border-siem-border rounded-2xl h-full flex items-center justify-center text-gray-500 animate-pulse">
              {activeTab.toUpperCase()} MODÜLÜ GELİŞTİRİLİYOR...
            </div>
          )}
        </div>
      </main>

      {/* Global Alarm Modal - Her sayfada görünür */}
      <AlarmModal />
    </div>
  );
}

export default App;