import React from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { ShieldAlert, Globe, Zap } from 'lucide-react';

// Harita Verisi (Dünya Ülkeleri Sınırları)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Saldırı Verileri (Koordinatlar: [Boylam, Enlem])
const attacks = [
  { name: "China", coordinates: [104.1954, 35.8617], target: [35.2433, 38.9637] }, // Çin -> Türkiye
  { name: "Russia", coordinates: [105.3188, 61.5240], target: [35.2433, 38.9637] }, // Rusya -> Türkiye
  { name: "USA", coordinates: [-95.7129, 37.0902], target: [35.2433, 38.9637] },   // ABD -> Türkiye
  { name: "Brazil", coordinates: [-51.9253, -14.2350], target: [35.2433, 38.9637] }, // Brezilya -> Türkiye
];

const topAttackers = [
  { country: "China", count: 1240, risk: "Critical", flag: "🇨🇳" },
  { country: "Russia", count: 850, risk: "High", flag: "🇷🇺" },
  { country: "USA", count: 620, risk: "Medium", flag: "🇺🇸" },
  { country: "North Korea", count: 150, risk: "High", flag: "🇰🇵" },
];

const ThreatMap = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700">
      
      {/* ÜST BİLGİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><Globe size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Global Tehdit Seviyesi</p>
                <h3 className="text-xl font-bold text-white">YÜKSEK</h3>
            </div>
        </div>
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Zap size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Anlık Saldırı Vektörü</p>
                <h3 className="text-xl font-bold text-white">7 Bölge</h3>
            </div>
        </div>
      </div>

      {/* ANA İÇERİK: HARİTA VE LİSTE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* SOL: DÜNYA HARİTASI */}
        <div className="lg:col-span-2 bg-siem-card border border-siem-border rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-siem-bg/80 backdrop-blur p-2 rounded-lg border border-siem-border">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Canlı Saldırı Haritası
                </h3>
            </div>
            
            <div className="flex-1 w-full h-full">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 110, center: [20, 30] }}
                    style={{ width: "100%", height: "100%" }}
                >
                    {/* Ülkelerin Çizimi */}
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#1e293b"
                            stroke="#334155"
                            strokeWidth={0.5}
                            style={{
                                default: { outline: "none" },
                                hover: { fill: "#2a3b55", outline: "none", transition: "all 0.3s" },
                                pressed: { outline: "none" },
                            }}
                            />
                        ))
                        }
                    </Geographies>

                    {/* Saldırı Çizgileri (Arcs) */}
                    {attacks.map((attack, index) => (
                        <React.Fragment key={index}>
                            {/* Kaynak Nokta */}
                            <Marker coordinates={attack.coordinates}>
                                <circle r={4} fill="#ef4444" className="animate-ping opacity-75" />
                                <circle r={2} fill="#fff" />
                            </Marker>

                            {/* Hedef Nokta (Türkiye) */}
                            <Marker coordinates={attack.target}>
                                <circle r={4} fill="#3b82f6" />
                                <g
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    transform="translate(-12, -24)"
                                >
                                    <circle cx="12" cy="10" r="3" />
                                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                                </g>
                            </Marker>

                            {/* Bağlantı Çizgisi */}
                            <Line
                                from={attack.coordinates}
                                to={attack.target}
                                stroke="#ef4444"
                                strokeWidth={1}
                                strokeLinecap="round"
                                strokeDasharray="4 4"
                                className="animate-[dash_1s_linear_infinite]"
                            />
                        </React.Fragment>
                    ))}
                </ComposableMap>
            </div>
        </div>

        {/* SAĞ: SALDIRGAN LİSTESİ */}
        <div className="bg-siem-card border border-siem-border rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-siem-alert" />
                En Çok Saldıran Kaynaklar
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-siem-border">
                {topAttackers.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-siem-bg/50 border border-siem-border hover:border-siem-accent/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.flag}</span>
                            <div>
                                <h4 className="text-sm font-medium text-gray-200">{item.country}</h4>
                                <div className="h-1.5 w-24 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                    <div 
                                        className="h-full bg-red-500 rounded-full" 
                                        style={{ width: `${(item.count / 1500) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-bold text-white">{item.count}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border 
                                ${item.risk === 'Critical' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 
                                  item.risk === 'High' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : 
                                  'text-blue-500 border-blue-500/30 bg-blue-500/10'}`}>
                                {item.risk}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Sahte IP Listesi */}
                <div className="mt-6 pt-4 border-t border-siem-border">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Son Engellenen IP'ler</h4>
                    <div className="space-y-2">
                        {[1,2,3].map(k => (
                            <div key={k} className="flex justify-between text-xs font-mono text-gray-500">
                                <span>192.168.1.{100+k}</span>
                                <span className="text-red-400">BLOCKED</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ThreatMap;