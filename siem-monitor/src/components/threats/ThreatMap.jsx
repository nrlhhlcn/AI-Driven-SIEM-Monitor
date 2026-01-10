import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { ShieldAlert, Globe, Zap, Users } from 'lucide-react';
import { subscribeToEvents } from '../../services/firebaseService';

// Harita Verisi (Dünya Ülkeleri Sınırları)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Türkiye koordinatları (Hedef)
const TURKEY_COORDINATES = [35.2433, 38.9637];

// Ülke koordinatları mapping (Başkent koordinatları)
// Not: Tüm alternatif isimler de eklenmeli
const COUNTRY_COORDINATES = {
  // Amerika
  'United States': { coords: [-95.7129, 37.0902], flag: '🇺🇸' },
  'USA': { coords: [-95.7129, 37.0902], flag: '🇺🇸' },
  'US': { coords: [-95.7129, 37.0902], flag: '🇺🇸' },
  'United States of America': { coords: [-95.7129, 37.0902], flag: '🇺🇸' },
  
  // Çin
  'China': { coords: [104.1954, 35.8617], flag: '🇨🇳' },
  'People\'s Republic of China': { coords: [104.1954, 35.8617], flag: '🇨🇳' },
  
  // Rusya
  'Russia': { coords: [37.6173, 55.7558], flag: '🇷🇺' },
  'Russian Federation': { coords: [37.6173, 55.7558], flag: '🇷🇺' },
  
  // Türkiye
  'Turkey': { coords: [32.8597, 39.9334], flag: '🇹🇷' },
  'Türkiye': { coords: [32.8597, 39.9334], flag: '🇹🇷' },
  
  // Almanya
  'Germany': { coords: [13.4050, 52.5200], flag: '🇩🇪' },
  'Deutschland': { coords: [13.4050, 52.5200], flag: '🇩🇪' },
  
  // Diğer ülkeler
  'France': { coords: [2.3522, 48.8566], flag: '🇫🇷' },
  'United Kingdom': { coords: [-0.1276, 51.5074], flag: '🇬🇧' },
  'UK': { coords: [-0.1276, 51.5074], flag: '🇬🇧' },
  'Brazil': { coords: [-47.8825, -15.7942], flag: '🇧🇷' },
  'India': { coords: [77.2090, 28.6139], flag: '🇮🇳' },
  'Japan': { coords: [139.6917, 35.6895], flag: '🇯🇵' },
  'South Korea': { coords: [126.9780, 37.5665], flag: '🇰🇷' },
  'Korea, Republic of': { coords: [126.9780, 37.5665], flag: '🇰🇷' },
  'North Korea': { coords: [125.7625, 39.0392], flag: '🇰🇵' },
  'Iran': { coords: [51.3890, 35.6892], flag: '🇮🇷' },
  'Italy': { coords: [12.4964, 41.9028], flag: '🇮🇹' },
  'Spain': { coords: [-3.7038, 40.4168], flag: '🇪🇸' },
  'Canada': { coords: [-75.6972, 45.4215], flag: '🇨🇦' },
  'Australia': { coords: [151.2093, -33.8688], flag: '🇦🇺' },
  'Mexico': { coords: [-99.1332, 19.4326], flag: '🇲🇽' },
  'Netherlands': { coords: [4.9041, 52.3676], flag: '🇳🇱' },
  'Poland': { coords: [21.0122, 52.2297], flag: '🇵🇱' },
  'Sweden': { coords: [18.0686, 59.3293], flag: '🇸🇪' },
  'Norway': { coords: [10.7522, 59.9139], flag: '🇳🇴' },
  
  // Singapur ve çevre ülkeler
  'Singapore': { coords: [103.8198, 1.3521], flag: '🇸🇬' },
  'Malaysia': { coords: [101.6869, 3.1390], flag: '🇲🇾' },
  'Indonesia': { coords: [106.8451, -6.2088], flag: '🇮🇩' },
  'Thailand': { coords: [100.5018, 13.7563], flag: '🇹🇭' },
  'Vietnam': { coords: [105.8342, 21.0285], flag: '🇻🇳' },
  'Philippines': { coords: [120.9842, 14.5995], flag: '🇵🇭' },
  'Taiwan': { coords: [121.5654, 25.0330], flag: '🇹🇼' },
  'Hong Kong': { coords: [114.1694, 22.3193], flag: '🇭🇰' },
  
  // Diğer önemli ülkeler
  'Saudi Arabia': { coords: [46.6753, 24.7136], flag: '🇸🇦' },
  'United Arab Emirates': { coords: [54.3773, 24.4539], flag: '🇦🇪' },
  'UAE': { coords: [54.3773, 24.4539], flag: '🇦🇪' },
  'Israel': { coords: [35.2137, 31.7683], flag: '🇮🇱' },
  'Egypt': { coords: [31.2357, 30.0444], flag: '🇪🇬' },
  'South Africa': { coords: [28.0473, -26.2041], flag: '🇿🇦' },
  'Argentina': { coords: [-58.3816, -34.6037], flag: '🇦🇷' },
  'Chile': { coords: [-70.6693, -33.4489], flag: '🇨🇱' },
  'New Zealand': { coords: [174.7633, -41.2865], flag: '🇳🇿' },
  'Switzerland': { coords: [7.4474, 46.9481], flag: '🇨🇭' },
  'Austria': { coords: [16.3738, 48.2082], flag: '🇦🇹' },
  'Belgium': { coords: [4.3517, 50.8503], flag: '🇧🇪' },
  'Denmark': { coords: [12.5683, 55.6761], flag: '🇩🇰' },
  'Finland': { coords: [24.9384, 60.1699], flag: '🇫🇮' },
  'Greece': { coords: [23.7275, 37.9838], flag: '🇬🇷' },
  'Portugal': { coords: [-9.1393, 38.7223], flag: '🇵🇹' },
  'Czech Republic': { coords: [14.4378, 50.0755], flag: '🇨🇿' },
  'Romania': { coords: [26.1025, 44.4268], flag: '🇷🇴' },
  'Hungary': { coords: [19.0402, 47.4979], flag: '🇭🇺' },
  'Ukraine': { coords: [30.5234, 50.4501], flag: '🇺🇦' },
  'Pakistan': { coords: [73.0479, 33.6844], flag: '🇵🇰' },
  'Bangladesh': { coords: [90.4125, 23.8103], flag: '🇧🇩' },
  'Sri Lanka': { coords: [79.8612, 6.9271], flag: '🇱🇰' },
  'Nepal': { coords: [85.3240, 27.7172], flag: '🇳🇵' },
  'Myanmar': { coords: [96.1561, 19.7633], flag: '🇲🇲' },
  'Cambodia': { coords: [104.9160, 11.5564], flag: '🇰🇭' },
  'Laos': { coords: [102.6331, 17.9757], flag: '🇱🇦' },
  'Unknown': { coords: [0, 0], flag: '❓' },
};

// Ülke adını normalize et (büyük/küçük harf duyarsız, alternatif isimler)
const normalizeCountryName = (countryName) => {
  if (!countryName) return null;
  
  const normalized = countryName.trim();
  
  // Direkt eşleşme
  if (COUNTRY_COORDINATES[normalized]) {
    return normalized;
  }
  
  // Büyük/küçük harf duyarsız arama
  const found = Object.keys(COUNTRY_COORDINATES).find(
    key => key.toLowerCase() === normalized.toLowerCase()
  );
  
  if (found) return found;
  
  // Kısmi eşleşme (ör: "Singapore" -> "Singapore")
  const partialMatch = Object.keys(COUNTRY_COORDINATES).find(
    key => key.toLowerCase().includes(normalized.toLowerCase()) || 
           normalized.toLowerCase().includes(key.toLowerCase())
  );
  
  return partialMatch || null;
};

// Ülke koordinatlarını bul (event'teki latitude/longitude varsa onu kullan)
const getCountryCoordinates = (countryName, countryCode, event) => {
  // Önce event'teki koordinatları kontrol et
  if (event?.latitude && event?.longitude) {
    return {
      coords: [event.longitude, event.latitude],
      flag: getCountryFlag(countryCode) || '🌍',
    };
  }
  
  // Normalize edilmiş ülke adı ile ara
  const normalized = normalizeCountryName(countryName);
  if (normalized && COUNTRY_COORDINATES[normalized]) {
    return COUNTRY_COORDINATES[normalized];
  }
  
  // Bulunamadıysa null döndür (haritada gösterilmez)
  // Not: Eğer event'te latitude/longitude varsa yukarıda zaten kullanıldı
  return null;
};

// Ülke kodundan bayrak emoji bul
const getCountryFlag = (countryCode) => {
  if (!countryCode) return '🌍';
  
  // Ülke kodlarına göre bayrak mapping (en yaygın olanlar)
  const flagMap = {
    'US': '🇺🇸', 'CN': '🇨🇳', 'RU': '🇷🇺', 'TR': '🇹🇷', 'DE': '🇩🇪',
    'FR': '🇫🇷', 'GB': '🇬🇧', 'BR': '🇧🇷', 'IN': '🇮🇳', 'JP': '🇯🇵',
    'KR': '🇰🇷', 'KP': '🇰🇵', 'IR': '🇮🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'CA': '🇨🇦', 'AU': '🇦🇺', 'MX': '🇲🇽', 'NL': '🇳🇱', 'PL': '🇵🇱',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'SG': '🇸🇬', 'MY': '🇲🇾', 'ID': '🇮🇩',
    'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'TW': '🇹🇼', 'HK': '🇭🇰',
  };
  
  return flagMap[countryCode.toUpperCase()] || '🌍';
};

// Risk seviyesi belirleme
const getRiskLevel = (count) => {
  if (count >= 50) return { level: 'Critical', color: 'red' };
  if (count >= 20) return { level: 'High', color: 'orange' };
  if (count >= 10) return { level: 'Medium', color: 'yellow' };
  return { level: 'Low', color: 'blue' };
};

const ThreatMap = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase'den event'leri çek
  useEffect(() => {
    const unsubscribe = subscribeToEvents((eventsList) => {
      setEvents(eventsList);
      setLoading(false);
    }, 1000); // Son 1000 event

    return () => unsubscribe();
  }, []);

  // Ülkelere göre giriş sayılarını hesapla
  const countryStats = useMemo(() => {
    const stats = {};
    
    events.forEach(event => {
      // Sadece login eventlerini say
      if (!['LOGIN_SUCCESS', 'AUTH_FAIL', 'SUSPICIOUS_COUNTRY'].includes(event.type)) return;
      if (!event.country || event.country === 'Unknown') return;
      
      const country = event.country;
      const countryCode = event.countryCode || 'XX';
      
      // Ülke koordinatlarını bul (event'teki lat/lng varsa onu kullan)
      const coordsData = getCountryCoordinates(country, countryCode, event);
      
      // Eğer koordinat bulunamadıysa ve event'te lat/lng yoksa atla
      if (!coordsData) {
        console.warn(`Ülke koordinatları bulunamadı: ${country} (${countryCode})`);
        return; // Bu ülkeyi haritada gösterme
      }
      
      if (!stats[country]) {
        stats[country] = {
          country: country,
          countryCode: countryCode,
          count: 0,
          users: new Set(),
          coordinates: coordsData.coords,
          flag: coordsData.flag,
        };
      }
      
      stats[country].count++;
      if (event.username) {
        stats[country].users.add(event.username);
      }
    });
    
    // Array'e çevir ve sırala
    return Object.values(stats)
      .map(stat => ({
        ...stat,
        uniqueUsers: stat.users.size,
        users: Array.from(stat.users),
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Harita için saldırı verileri
  const attacks = useMemo(() => {
    return countryStats
      .filter(stat => stat.country !== 'Turkey' && stat.country !== 'Germany') // İzin verilen ülkeleri filtrele
      .map(stat => ({
        name: stat.country,
        coordinates: stat.coordinates,
        target: TURKEY_COORDINATES,
        count: stat.count,
      }));
  }, [countryStats]);

  // Top attackers listesi
  const topAttackers = useMemo(() => {
    return countryStats
      .map(stat => {
        const risk = getRiskLevel(stat.count);
        return {
          country: stat.country,
          count: stat.count,
          uniqueUsers: stat.uniqueUsers,
          risk: risk.level,
          flag: stat.flag,
          countryCode: stat.countryCode,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // En çok saldıran 10 ülke
  }, [countryStats]);

  // Toplam istatistikler
  const totalStats = useMemo(() => {
    const totalLogins = countryStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalCountries = countryStats.length;
    const suspiciousCountries = countryStats.filter(stat => 
      stat.country !== 'Turkey' && stat.country !== 'Germany'
    ).length;
    
    return {
      totalLogins,
      totalCountries,
      suspiciousCountries,
    };
  }, [countryStats]);
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700">
      
      {/* ÜST BİLGİ KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><Globe size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Toplam Giriş Denemesi</p>
                <h3 className="text-xl font-bold text-white">{totalStats.totalLogins}</h3>
            </div>
        </div>
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Zap size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Farklı Ülke Sayısı</p>
                <h3 className="text-xl font-bold text-white">{totalStats.totalCountries}</h3>
            </div>
        </div>
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><ShieldAlert size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Şüpheli Ülke</p>
                <h3 className="text-xl font-bold text-white">{totalStats.suspiciousCountries}</h3>
            </div>
        </div>
        <div className="bg-siem-card border border-siem-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><Users size={24} /></div>
            <div>
                <p className="text-xs text-gray-400">Benzersiz Kullanıcı</p>
                <h3 className="text-xl font-bold text-white">
                  {countryStats.reduce((sum, stat) => sum + stat.uniqueUsers, 0)}
                </h3>
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

                    {/* Saldırı Çizgileri (Arcs) - Gerçek Verilerden */}
                    {attacks.map((attack, index) => {
                      const risk = getRiskLevel(attack.count);
                      const markerSize = Math.min(8, Math.max(4, attack.count / 10));
                      
                      return (
                        <React.Fragment key={`${attack.name}-${index}`}>
                            {/* Kaynak Nokta (Saldırgan Ülke) */}
                            <Marker coordinates={attack.coordinates}>
                                <g>
                                    <circle 
                                      r={markerSize + 2} 
                                      fill={risk.color === 'red' ? '#ef4444' : risk.color === 'orange' ? '#f97316' : '#eab308'} 
                                      className="animate-ping opacity-75" 
                                    />
                                    <circle r={markerSize} fill="#fff" />
                                    <text
                                        textAnchor="middle"
                                        y={markerSize + 12}
                                        style={{ fontFamily: 'system-ui', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                    >
                                        {attack.count}
                                    </text>
                                </g>
                            </Marker>

                            {/* Hedef Nokta (Türkiye) */}
                            {index === 0 && (
                              <Marker coordinates={attack.target}>
                                  <circle r={6} fill="#3b82f6" />
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
                            )}

                            {/* Bağlantı Çizgisi */}
                            <Line
                                from={attack.coordinates}
                                to={attack.target}
                                stroke={risk.color === 'red' ? '#ef4444' : risk.color === 'orange' ? '#f97316' : '#eab308'}
                                strokeWidth={Math.min(3, Math.max(1, attack.count / 20))}
                                strokeLinecap="round"
                                strokeDasharray="4 4"
                                className="animate-[dash_1s_linear_infinite]"
                                opacity={0.6}
                            />
                        </React.Fragment>
                      );
                    })}
                </ComposableMap>
            </div>
        </div>

        {/* SAĞ: SALDIRGAN LİSTESİ */}
        <div className="bg-siem-card border border-siem-border rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert size={20} className="text-siem-alert" />
                    Ülke Bazlı Girişler
                </h3>
                {loading && (
                    <div className="text-xs text-gray-400 animate-pulse">Yükleniyor...</div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-siem-border">
                {topAttackers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Globe size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Henüz ülke verisi yok</p>
                        <p className="text-xs mt-1">Giriş yapıldıkça burada görünecek</p>
                    </div>
                ) : (
                    topAttackers.map((item, i) => {
                        const maxCount = topAttackers[0]?.count || 1;
                        const percentage = (item.count / maxCount) * 100;
                        
                        return (
                            <div key={`${item.country}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-siem-bg/50 border border-siem-border hover:border-siem-accent/50 transition-colors group">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xl shrink-0">{item.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-gray-200 truncate">{item.country}</h4>
                                            <span className="text-xs text-gray-500">({item.countryCode})</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    item.risk === 'Critical' ? 'bg-red-500' : 
                                                    item.risk === 'High' ? 'bg-orange-500' : 
                                                    item.risk === 'Medium' ? 'bg-yellow-500' : 
                                                    'bg-blue-500'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">
                                                {item.uniqueUsers} kullanıcı
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <span className="block text-sm font-bold text-white">{item.count}</span>
                                    <span className="text-[10px] text-gray-400">giriş</span>
                                    <span className={`block text-[10px] px-1.5 py-0.5 rounded border mt-1
                                        ${item.risk === 'Critical' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 
                                          item.risk === 'High' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : 
                                          item.risk === 'Medium' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' : 
                                          'text-blue-500 border-blue-500/30 bg-blue-500/10'}`}>
                                        {item.risk}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Son Girişler */}
                {countryStats.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-siem-border">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Son Giriş Yapan Ülkeler</h4>
                        <div className="space-y-2">
                            {countryStats
                                .sort((a, b) => {
                                    // En son giriş yapan ülkeyi bul
                                    const aLastEvent = events
                                        .filter(e => e.country === a.country && ['LOGIN_SUCCESS', 'AUTH_FAIL'].includes(e.type))
                                        .sort((e1, e2) => {
                                            const t1 = e1.createdAt?.toDate ? e1.createdAt.toDate().getTime() : 0;
                                            const t2 = e2.createdAt?.toDate ? e2.createdAt.toDate().getTime() : 0;
                                            return t2 - t1;
                                        })[0];
                                    const bLastEvent = events
                                        .filter(e => e.country === b.country && ['LOGIN_SUCCESS', 'AUTH_FAIL'].includes(e.type))
                                        .sort((e1, e2) => {
                                            const t1 = e1.createdAt?.toDate ? e1.createdAt.toDate().getTime() : 0;
                                            const t2 = e2.createdAt?.toDate ? e2.createdAt.toDate().getTime() : 0;
                                            return t2 - t1;
                                        })[0];
                                    const aTime = aLastEvent?.createdAt?.toDate ? aLastEvent.createdAt.toDate().getTime() : 0;
                                    const bTime = bLastEvent?.createdAt?.toDate ? bLastEvent.createdAt.toDate().getTime() : 0;
                                    return bTime - aTime;
                                })
                                .slice(0, 5)
                                .map((stat, idx) => {
                                    const lastEvent = events
                                        .filter(e => e.country === stat.country && ['LOGIN_SUCCESS', 'AUTH_FAIL'].includes(e.type))
                                        .sort((e1, e2) => {
                                            const t1 = e1.createdAt?.toDate ? e1.createdAt.toDate().getTime() : 0;
                                            const t2 = e2.createdAt?.toDate ? e2.createdAt.toDate().getTime() : 0;
                                            return t2 - t1;
                                        })[0];
                                    
                                    const timeStr = lastEvent?.createdAt?.toDate 
                                        ? lastEvent.createdAt.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                                        : 'Bilinmiyor';
                                    
                                    return (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span>{stat.flag}</span>
                                                <span className="text-gray-300 font-medium">{stat.country}</span>
                                            </div>
                                            <span className="text-gray-500">{timeStr}</span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ThreatMap;