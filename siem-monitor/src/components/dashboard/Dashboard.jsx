import React from 'react';
import StatCard from './StatCard';
import TrafficChart from './TrafficChart';
import { Shield, Activity, Users, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* İSTATİSTİK KARTLARI SIRASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Toplam Olay (24s)" 
          value="84,392" 
          icon={Activity} 
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <StatCard 
          title="Kritik Tehditler" 
          value="3" 
          icon={AlertTriangle} 
          color="red"
          trend="up"
          trendValue="+1"
        />
        <StatCard 
          title="Sistem Sağlığı" 
          value="%98.4" 
          icon={Shield} 
          color="green"
          trend="down"
          trendValue="Stabil"
        />
        <StatCard 
          title="Aktif Kullanıcılar" 
          value="1,240" 
          icon={Users} 
          color="purple"
          trend="down"
          trendValue="-5%"
        />
      </div>

      {/* GRAFİK ve YAN PANEL BÖLÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol taraf: Geniş Grafik */}
        <div className="lg:col-span-2 min-w-0">
          <TrafficChart />
        </div>

        {/* Sağ Taraf: Son Alarmlar (Basit Liste) */}
        <div className="bg-siem-card border border-siem-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Son Alarmlar</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-siem-bg/50 border border-siem-border hover:border-siem-alert/50 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-siem-alert animate-pulse" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">Brute Force Tespit Edildi</h4>
                  <p className="text-xs text-gray-400">IP: 192.168.1.{100 + i} - SSH Servisi</p>
                </div>
                <span className="text-xs text-gray-500">10dk önce</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;