import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sahte veri (Şimdilik)
const data = [
  { time: '10:00', traffic: 4000, threat: 240 },
  { time: '10:05', traffic: 3000, threat: 139 },
  { time: '10:10', traffic: 2000, threat: 980 }, // Saldırı anı!
  { time: '10:15', traffic: 2780, threat: 390 },
  { time: '10:20', traffic: 1890, threat: 480 },
  { time: '10:25', traffic: 2390, threat: 380 },
  { time: '10:30', traffic: 3490, threat: 430 },
];

const TrafficChart = () => {
  return (
    <div className="bg-siem-card border border-siem-border rounded-xl p-6 h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Ağ Trafiği ve Tehdit Analizi</h3>
        <p className="text-xs text-gray-400">Gelen/Giden paketler ve tespit edilen anomaliler</p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" name="Normal Trafik" />
          <Area type="monotone" dataKey="threat" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" name="Tehdit Seviyesi" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;