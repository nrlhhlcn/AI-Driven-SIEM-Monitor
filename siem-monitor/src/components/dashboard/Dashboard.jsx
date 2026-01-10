import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import TrafficChart from './TrafficChart';
import { 
  Shield, Activity, Users, AlertTriangle, X, AlertCircle, 
  Clock, Zap, Globe, Code, Brain, Lightbulb, ShieldAlert,
  Ban, BellOff, Lock, ChevronRight, Sparkles
} from 'lucide-react';
import { 
  subscribeToEvents, 
  subscribeToUserStats, 
  subscribeToRules,
  detectBruteForce, 
  createBruteForceAlarm,
  detectAllAnomalies,
  generateAllAIRecommendations,
  createAlarm
} from '../../services/firebaseService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalThreats: 0,
    systemHealth: 0,
    activeUsers: 0,
    recentAlarms: []
  });
  const [userStats, setUserStats] = useState([]);
  const [allAlerts, setAllAlerts] = useState({
    bruteForce: [],
    abnormalLoginTime: [],
    sqlInjection: [],
    trafficSpike: [],
    geoAnomaly: [],
    apiAbuse: [],
    suspiciousCountry: []
  });
  const [aiRecommendations, setAIRecommendations] = useState({
    thresholds: [],
    blockIPs: [],
    notifications: [],
    userSecurity: []
  });
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());
  const [detectionRules, setDetectionRules] = useState([]);

  // Kuralları dinle
  useEffect(() => {
    const unsubscribeRules = subscribeToRules((rules) => {
      setDetectionRules(rules);
    });
    return () => unsubscribeRules();
  }, []);

  useEffect(() => {
    // Firebase'den real-time veri çek
    const unsubscribe = subscribeToEvents((events) => {
      // Son 24 saatteki eventler
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      
      const recentEvents = events.filter(event => {
        if (!event.createdAt) return false;
        const eventDate = event.createdAt?.toDate 
          ? event.createdAt.toDate() 
          : event.createdAt?.seconds 
          ? new Date(event.createdAt.seconds * 1000)
          : new Date(event.createdAt);
        return eventDate >= last24Hours;
      });

      // İstatistikleri hesapla
      const totalEvents = recentEvents.length;
      const criticalThreats = recentEvents.filter(e => 
        e.severity === 'high' || e.severity === 'critical'
      ).length;

      const loginEvents = recentEvents.filter(e => 
        e.type === 'LOGIN_SUCCESS' || e.type === 'AUTH_FAIL'
      );
      const successfulLogins = loginEvents.filter(e => e.type === 'LOGIN_SUCCESS').length;
      const totalLogins = loginEvents.length;
      const systemHealth = totalLogins > 0 
        ? Math.round((successfulLogins / totalLogins) * 100 * 10) / 10
        : 100;

      const uniqueUsers = new Set(
        recentEvents
          .filter(e => e.username)
          .map(e => e.username)
      );
      const activeUsers = uniqueUsers.size;

      const recentAlarms = recentEvents
        .filter(e => e.severity === 'high' || e.severity === 'critical')
        .slice(0, 4)
        .map(e => ({
          title: e.title,
          ip: e.sourceIP || 'N/A',
          time: e.timestamp || 'Az önce',
          severity: e.severity
        }));

      setStats({
        totalEvents,
        criticalThreats,
        systemHealth,
        activeUsers,
        recentAlarms
      });

      // TÜM ANORMALLİKLERİ TESPİT ET (Firebase kurallarını kullanarak)
      const anomalies = detectAllAnomalies(events, detectionRules);
      setAllAlerts(anomalies);

      // Brute Force için alarm oluştur (cache kontrolü firebaseService'de yapılıyor)
      anomalies.bruteForce.forEach(detection => {
        createBruteForceAlarm(detection.ip, detection.attempts).catch(() => {});
      });

      // Şüpheli Ülke için alarm oluştur
      anomalies.suspiciousCountry.forEach(detection => {
        createAlarm({
          type: 'SUSPICIOUS_COUNTRY',
          title: `Şüpheli Ülkeden Giriş: ${detection.country}`,
          description: detection.message,
          severity: detection.severity || 'high',
          sourceIP: detection.ip,
          country: detection.country,
          countryCode: detection.countryCode,
          username: detection.username,
        }).catch(() => {});
      });

      // NOT: SQL Injection alarmları victim-app tarafından oluşturuluyor
      // Dashboard sadece tespit ve gösterim yapar, çift kayıt önlenir

      // AI ÖNERİLERİNİ OLUŞTUR
      const recommendations = generateAllAIRecommendations(events);
      setAIRecommendations(recommendations);

    }, 200);

    return () => unsubscribe();
  }, [detectionRules]); // Kurallar değiştiğinde anomali tespitini yeniden yap

  // Kullanıcı istatistiklerini çek
  useEffect(() => {
    const unsubscribe = subscribeToUserStats((userStatsList) => {
      const sorted = userStatsList
        .filter(user => user.loginCount > 0)
        .sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0));
      setUserStats(sorted);
    });

    return () => unsubscribe();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Alert sayısını hesapla
  const totalAlerts = 
    allAlerts.bruteForce.length +
    allAlerts.abnormalLoginTime.length +
    allAlerts.sqlInjection.length +
    allAlerts.trafficSpike.length +
    allAlerts.geoAnomaly.length +
    allAlerts.apiAbuse.length +
    allAlerts.suspiciousCountry.length;

  // AI öneri sayısını hesapla
  const totalRecommendations = 
    aiRecommendations.thresholds.length +
    aiRecommendations.blockIPs.length +
    aiRecommendations.notifications.length +
    aiRecommendations.userSecurity.length;

  // Alert'i kapat
  const dismissAlert = (type, index) => {
    setDismissedAlerts(prev => new Set([...prev, `${type}-${index}`]));
  };

  // Öneriyi kapat
  const dismissRecommendation = (type, index) => {
    setDismissedRecommendations(prev => new Set([...prev, `${type}-${index}`]));
  };

  // Alert kartı komponenti
  const AlertCard = ({ alert, type, index, icon: Icon, color, bgColor }) => {
    const key = `${type}-${index}`;
    if (dismissedAlerts.has(key)) return null;

    return (
      <div className={`${bgColor} border-l-4 ${color} rounded-xl p-4 backdrop-blur-sm animate-in slide-in-from-top duration-300`}>
        <div className="flex items-start gap-3">
          <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg ${bgColor.replace('/10', '/20')} border ${color.replace('border-l-', 'border-')}/30`}>
            <Icon size={20} className={color.replace('border-l-', 'text-').replace('-500', '-400')} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">{alert.message || alert.type}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              {alert.ip && <span>IP: {alert.ip}</span>}
              {alert.username && <span>• Kullanıcı: {alert.username}</span>}
              {alert.time && <span>• {alert.time.toLocaleTimeString('tr-TR')}</span>}
            </div>
          </div>
          <button onClick={() => dismissAlert(type, index)} className="p-1 hover:bg-white/10 rounded">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  };

  // AI Öneri kartı komponenti
  const RecommendationCard = ({ rec, type, index }) => {
    const key = `${type}-${index}`;
    if (dismissedRecommendations.has(key)) return null;

    const priorityColors = {
      critical: 'border-red-500 bg-red-500/10',
      high: 'border-orange-500 bg-orange-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10'
    };

    const icons = {
      THRESHOLD: Zap,
      BLOCK_IP: Ban,
      REDUCE_NOTIFICATIONS: BellOff,
      ENABLE_2FA: Lock
    };

    const Icon = icons[rec.type] || Lightbulb;

    return (
      <div className={`border-l-4 rounded-xl p-4 backdrop-blur-sm ${priorityColors[rec.priority] || priorityColors.medium}`}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Icon size={20} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-medium text-purple-400">AI Önerisi</span>
              <span className="text-xs text-gray-500">• %{rec.confidence} güven</span>
            </div>
            <p className="text-sm text-gray-200">{rec.reason}</p>
            {rec.suggested && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-gray-400">Mevcut: {rec.current}</span>
                <ChevronRight size={14} className="text-gray-500" />
                <span className="text-green-400 font-semibold">Önerilen: {rec.suggested}</span>
              </div>
            )}
            {rec.ip && (
              <div className="mt-2">
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
                  {rec.ip} IP'sini Engelle
                </button>
              </div>
            )}
          </div>
          <button onClick={() => dismissRecommendation(type, index)} className="p-1 hover:bg-white/10 rounded">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* AI ÖNERİLERİ BANNER */}
      {totalRecommendations > 0 && (
        <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Brain size={24} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                AI Destekli Öneriler
              </h3>
              <p className="text-sm text-gray-400">{totalRecommendations} akıllı öneri mevcut</p>
            </div>
          </div>
          <div className="grid gap-3">
            {aiRecommendations.thresholds.map((rec, i) => (
              <RecommendationCard key={`threshold-${i}`} rec={rec} type="thresholds" index={i} />
            ))}
            {aiRecommendations.blockIPs.map((rec, i) => (
              <RecommendationCard key={`block-${i}`} rec={rec} type="blockIPs" index={i} />
            ))}
            {aiRecommendations.notifications.map((rec, i) => (
              <RecommendationCard key={`notif-${i}`} rec={rec} type="notifications" index={i} />
            ))}
            {aiRecommendations.userSecurity.map((rec, i) => (
              <RecommendationCard key={`user-${i}`} rec={rec} type="userSecurity" index={i} />
            ))}
          </div>
        </div>
      )}

      {/* GÜVENLİK ALERTLERI */}
      {totalAlerts > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldAlert size={20} className="text-red-400" />
            <span>Güvenlik Uyarıları ({totalAlerts})</span>
          </div>
          
          {/* Brute Force Alerts */}
          {allAlerts.bruteForce.map((alert, i) => (
            <AlertCard 
              key={`bf-${i}`}
              alert={{
                ...alert,
                message: `Brute Force: ${alert.ip} - ${alert.attempts} başarısız deneme (3 dk içinde)`,
                time: alert.lastAttempt
              }}
              type="bruteForce"
              index={i}
              icon={ShieldAlert}
              color="border-l-red-500"
              bgColor="bg-red-500/10"
            />
          ))}
          
          {/* SQL Injection Alerts */}
          {allAlerts.sqlInjection.map((alert, i) => (
            <AlertCard 
              key={`sql-${i}`}
              alert={alert}
              type="sqlInjection"
              index={i}
              icon={Code}
              color="border-l-red-500"
              bgColor="bg-red-500/10"
            />
          ))}
          
          {/* Abnormal Login Time */}
          {allAlerts.abnormalLoginTime.map((alert, i) => (
            <AlertCard 
              key={`time-${i}`}
              alert={alert}
              type="abnormalLoginTime"
              index={i}
              icon={Clock}
              color="border-l-yellow-500"
              bgColor="bg-yellow-500/10"
            />
          ))}
          
          {/* Traffic Spike */}
          {allAlerts.trafficSpike.map((alert, i) => (
            <AlertCard 
              key={`traffic-${i}`}
              alert={alert}
              type="trafficSpike"
              index={i}
              icon={Zap}
              color="border-l-orange-500"
              bgColor="bg-orange-500/10"
            />
          ))}
          
          {/* Geo Anomaly */}
          {allAlerts.geoAnomaly.map((alert, i) => (
            <AlertCard 
              key={`geo-${i}`}
              alert={alert}
              type="geoAnomaly"
              index={i}
              icon={Globe}
              color="border-l-purple-500"
              bgColor="bg-purple-500/10"
            />
          ))}
          
          {/* API Abuse */}
          {allAlerts.apiAbuse.map((alert, i) => (
            <AlertCard 
              key={`api-${i}`}
              alert={alert}
              type="apiAbuse"
              index={i}
              icon={Activity}
              color="border-l-cyan-500"
              bgColor="bg-cyan-500/10"
            />
          ))}
          
          {/* Suspicious Country */}
          {allAlerts.suspiciousCountry.map((alert, i) => (
            <AlertCard 
              key={`country-${i}`}
              alert={alert}
              type="suspiciousCountry"
              index={i}
              icon={Globe}
              color="border-l-red-500"
              bgColor="bg-red-500/10"
            />
          ))}
        </div>
      )}

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Toplam Olay (24s)" 
          value={formatNumber(stats.totalEvents)} 
          icon={Activity} 
          color="blue"
          trend="up"
          trendValue="Canlı"
        />
        <StatCard 
          title="Kritik Tehditler" 
          value={stats.criticalThreats.toString()} 
          icon={AlertTriangle} 
          color="red"
          trend={stats.criticalThreats > 0 ? "up" : "down"}
          trendValue={stats.criticalThreats > 0 ? `+${stats.criticalThreats}` : "Temiz"}
        />
        <StatCard 
          title="Sistem Sağlığı" 
          value={`%${stats.systemHealth}`} 
          icon={Shield} 
          color="green"
          trend="down"
          trendValue={stats.systemHealth >= 95 ? "Mükemmel" : "İyi"}
        />
        <StatCard 
          title="Aktif Kullanıcılar" 
          value={stats.activeUsers.toString()} 
          icon={Users} 
          color="purple"
          trend="down"
          trendValue="Canlı"
        />
      </div>

      {/* GRAFİK ve YAN PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <TrafficChart />
        </div>

        <div className="bg-siem-card border border-siem-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Son Alarmlar</h3>
          <div className="space-y-4">
            {stats.recentAlarms.length > 0 ? (
              stats.recentAlarms.map((alarm, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-siem-bg/50 border border-siem-border hover:border-siem-alert/50 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    alarm.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{alarm.title}</h4>
                    <p className="text-xs text-gray-400">IP: {alarm.ip}</p>
                  </div>
                  <span className="text-xs text-gray-500">{alarm.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>Henüz alarm yok</p>
                <p className="text-xs mt-1">Sistem temiz</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KULLANICI GİRİŞ İSTATİSTİKLERİ */}
      <div className="bg-siem-card border border-siem-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} className="text-siem-accent" />
            Kullanıcı Giriş İstatistikleri
          </h3>
          <span className="text-xs text-gray-400">
            {userStats.length} aktif kullanıcı
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {userStats.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-siem-border">
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Giriş Sayısı</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Son Giriş</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-siem-border">
                {userStats.map((user) => {
                  const lastLogin = user.lastLogin?.toDate 
                    ? user.lastLogin.toDate() 
                    : user.lastLogin?.seconds 
                    ? new Date(user.lastLogin.seconds * 1000)
                    : null;
                  
                  const lastLoginStr = lastLogin 
                    ? lastLogin.toLocaleString('tr-TR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : 'Bilinmiyor';

                  return (
                    <tr key={user.username} className="hover:bg-siem-bg/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-siem-accent/10 text-siem-accent px-3 py-1 rounded-full text-sm font-bold">
                          {user.loginCount || 0}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-400 text-sm">
                        {lastLoginStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Henüz giriş yapan kullanıcı yok</p>
              <p className="text-xs mt-1 text-gray-600">Kullanıcılar giriş yaptıkça burada görünecek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
