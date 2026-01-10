import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Activity, ArrowUp, ArrowDown, Globe, Server, ShieldCheck, Wifi } from 'lucide-react';

// --- MOCK VERİLER ---

// 1. Trafik Grafiği Verisi
const trafficData = [
  { time: '14:00', upload: 400, download: 2400 },
  { time: '14:05', upload: 300, download: 1398 },
  { time: '14:10', upload: 200, download: 9800 }, // Spike (Anormal artış)
  { time: '14:15', upload: 278, download: 3908 },
  { time: '14:20', upload: 189, download: 4800 },
  { time: '14:25', upload: 239, download: 3800 },
  { time: '14:30', upload: 349, download: 4300 },
  { time: '14:35', upload: 500, download: 2400 },
  { time: '14:40', upload: 450, download: 1200 },
  { time: '14:45', upload: 600, download: 3500 },
];

// 2. Protokol Pasta Grafiği Verisi
const protocolData = [
  { name: 'HTTPS (Web)', value: 65, color: '#3b82f6' }, // Mavi
  { name: 'SSH (Secure)', value: 15, color: '#10b981' }, // Yeşil
  { name: 'DNS (Lookup)', value: 10, color: '#f59e0b' }, // Sarı
  { name: 'Unknown/UDP', value: 10, color: '#ef4444' },  // Kırmızı
];

// 3. Aktif Bağlantılar Tablosu
const connections = [
  { id: 1, proto: 'TCP', local: '192.168.1.10:443', remote: '104.21.55.2:58922', state: 'ESTABLISHED', process: 'nginx' },
  { id: 2, proto: 'TCP', local: '192.168.1.10:22', remote: '10.0.0.5:51022', state: 'ESTABLISHED', process: 'sshd' },
  { id: 3, proto: 'UDP', local: '0.0.0.0:123', remote: '*:*', state: 'LISTEN', process: 'ntpd' },
  { id: 4, proto: 'TCP', local: '127.0.0.1:3306', remote: '127.0.0.1:48210', state: 'TIME_WAIT', process: 'mysqld' },
  { id: 5, proto: 'TCP', local: '192.168.1.10:80', remote: '45.33.22.11:4401', state: 'SYN_RECV', process: 'apache2' },
];

const NetworkTraffic = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-siem-border">
      
      {/* ÜST BİLGİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-siem-card border border-siem-border p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Toplam Bant Genişliği</p>
            <h3 className="text-2xl font-bold text-white mt-1 flex items-end gap-2">
              1.2 <span className="text-sm text-gray-500 font-medium mb-1">Gbps</span>
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Activity size={24} /></div>
        </div>

        <div className="bg-siem-card border border-siem-border p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">Aktif Portlar</p>
            <h3 className="text-2xl font-bold text-white mt-1">24</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Server size={24} /></div>
        </div>

        <div className="bg-siem-card border border-siem-border p-5 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Paket Kaybı</p>
                <h3 className="text-2xl font-bold text-white mt-1 flex items-end gap-2">
                %0.02 <span className="text-xs text-siem-success mb-1 font-medium bg-siem-success/10 px-2 py-0.5 rounded">Stabil</span>
                </h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><Wifi size={24} /></div>
        </div>
      </div>

      {/* GRAFİKLER BÖLÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol: Trafik Akışı (Area Chart) */}
        <div className="lg:col-span-2 bg-siem-card border border-siem-border rounded-xl p-6 min-h-[350px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-siem-accent" />
            Network I/O Analizi
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3b55" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="download" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDown)" strokeWidth={2} name="Download" />
                <Area type="monotone" dataKey="upload" stroke="#10b981" fillOpacity={1} fill="url(#colorUp)" strokeWidth={2} name="Upload" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sağ: Protokol Dağılımı (Pie Chart) */}
        <div className="bg-siem-card border border-siem-border rounded-xl p-6 min-h-[350px]">
          <h3 className="text-lg font-bold text-white mb-2">Protokol Dağılımı</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={protocolData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {protocolData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
          </div>
          {/* Ek Açıklama */}
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">
                HTTPS trafiği normalin %15 üzerinde seyrediyor.
            </span>
          </div>
        </div>
      </div>

      {/* ALT: AKTİF BAĞLANTILAR TABLOSU */}
      <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-siem-border flex justify-between items-center bg-siem-card/50">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Globe size={18} className="text-siem-accent" />
                Aktif Soket Bağlantıları (Active Sockets)
            </h3>
            <button className="text-xs bg-siem-bg border border-siem-border px-3 py-1 rounded hover:bg-siem-hover transition-colors text-gray-300">
                Tümünü Gör
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-gray-500 border-b border-siem-border bg-siem-bg/30">
                        <th className="px-6 py-3 font-medium uppercase">Proto</th>
                        <th className="px-6 py-3 font-medium uppercase">Local Address</th>
                        <th className="px-6 py-3 font-medium uppercase">Remote Address</th>
                        <th className="px-6 py-3 font-medium uppercase">Process</th>
                        <th className="px-6 py-3 font-medium uppercase">State</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                    {connections.map((conn) => (
                        <tr key={conn.id} className="border-b border-siem-border/50 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-siem-accent font-bold">{conn.proto}</td>
                            <td className="px-6 py-4 font-mono text-xs">{conn.local}</td>
                            <td className="px-6 py-4 font-mono text-xs">{conn.remote}</td>
                            <td className="px-6 py-4">
                                <span className="flex items-center gap-2">
                                    <Server size={14} className="text-gray-500" />
                                    {conn.process}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider
                                    ${conn.state === 'ESTABLISHED' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 
                                      conn.state === 'LISTEN' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' :
                                      conn.state === 'SYN_RECV' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10 animate-pulse' :
                                      'text-gray-500 border-gray-500/20' }`}>
                                    {conn.state}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default NetworkTraffic;