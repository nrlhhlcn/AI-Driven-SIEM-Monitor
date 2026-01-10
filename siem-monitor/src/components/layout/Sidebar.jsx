import React from 'react';
import { LayoutDashboard, ShieldAlert, Activity, FileText, Settings, Ghost, AlertTriangle } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  
  // Menü Elemanları
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış' },
    { id: 'threats', icon: ShieldAlert, label: 'Tehdit Analizi' },
    { id: 'logs', icon: FileText, label: 'Canlı Loglar' },
    { id: 'alarms', icon: AlertTriangle, label: 'Alarm Geçmişi' },
    { id: 'network', icon: Activity, label: 'Ağ Trafiği' },
    { id: 'settings', icon: Settings, label: 'Sistem Ayarları' },
  ];

  return (
    <div className="h-screen w-64 bg-siem-sidebar border-r border-siem-border flex flex-col">
      
      {/* 1. LOGO ALANI */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-siem-border">
        <div className="w-10 h-10 bg-siem-accent/10 rounded-lg flex items-center justify-center border border-siem-accent/20">
          <Ghost size={24} className="text-siem-accent" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide">SENTINEL</h1>
          <p className="text-[10px] text-gray-400 tracking-wider">AI SIEM SYSTEM</p>
        </div>
      </div>

      {/* 2. MENÜ */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
              ${activeTab === item.id 
                ? 'bg-siem-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'text-gray-400 hover:bg-siem-card hover:text-white'
              }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 3. ALT BİLGİ */}
      <div className="p-4 border-t border-siem-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-siem-success animate-pulse"></div>
          <span className="text-xs text-gray-500">Sistem: Çevrimiçi</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;