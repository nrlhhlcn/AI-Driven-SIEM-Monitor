import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, AlertTriangle, ShieldAlert, Lock, Globe, Code, Ban, Clock, MapPin } from 'lucide-react';
import { subscribeToAlarms } from '../../services/firebaseService';

const AlarmModal = () => {
  const [currentAlarm, setCurrentAlarm] = useState(null);
  
  // localStorage'dan görülen alarm ID'lerini yükle
  const getSeenAlarmIds = () => {
    try {
      const stored = localStorage.getItem('siem_seen_alarm_ids');
      if (!stored) return new Set();
      
      const parsed = JSON.parse(stored);
      // Sadece son 500 alarm ID'sini tut (localStorage boyutunu kontrol et)
      const ids = Array.isArray(parsed) ? parsed.slice(-500) : [];
      return new Set(ids);
    } catch {
      return new Set();
    }
  };

  // Görülen alarm ID'lerini localStorage'a kaydet
  const saveSeenAlarmIds = (ids) => {
    try {
      // Sadece son 500 alarm ID'sini kaydet
      const idsArray = Array.from(ids).slice(-500);
      localStorage.setItem('siem_seen_alarm_ids', JSON.stringify(idsArray));
    } catch (error) {
      console.warn('localStorage kayıt hatası:', error);
      // Eğer localStorage doluysa, eski kayıtları temizle
      try {
        const idsArray = Array.from(ids).slice(-100);
        localStorage.setItem('siem_seen_alarm_ids', JSON.stringify(idsArray));
      } catch {
        // localStorage tamamen doluysa, temizle
        localStorage.removeItem('siem_seen_alarm_ids');
      }
    }
  };

  const seenAlarmIdsRef = useRef(getSeenAlarmIds());

  useEffect(() => {
    const unsubscribe = subscribeToAlarms((alarms) => {
      // Sadece yeni ve açık (open) alarmları göster
      const newOpenAlarms = alarms.filter(
        alarm => 
          alarm.status === 'open' && 
          !seenAlarmIdsRef.current.has(alarm.id)
      );

      if (newOpenAlarms.length > 0) {
        // En yeni alarmı göster
        const latestAlarm = newOpenAlarms.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        })[0];

        setCurrentAlarm(latestAlarm);
        seenAlarmIdsRef.current.add(latestAlarm.id);
        saveSeenAlarmIds(seenAlarmIdsRef.current);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClose = useCallback(() => {
    setCurrentAlarm(null);
  }, []);

  // Modal açıkken body scroll'unu engelle ve ESC tuşu ile kapat
  useEffect(() => {
    if (currentAlarm) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [currentAlarm, handleClose]);

  const getAlarmIcon = (type) => {
    switch (type) {
      case 'BRUTE_FORCE':
        return { icon: Lock, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'SQL_INJECTION':
        return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'SUSPICIOUS_COUNTRY':
        return { icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/20' };
      case 'TRAFFIC_SPIKE':
        return { icon: Code, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      default:
        return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Az önce';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!currentAlarm) return null;

  const iconData = getAlarmIcon(currentAlarm.type);
  const Icon = iconData.icon;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-br from-siem-card via-siem-bg to-siem-card border border-siem-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 ${iconData.bg} opacity-50 blur-3xl`}></div>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-siem-bg/80 hover:bg-siem-bg border border-siem-border/50 text-gray-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-4 rounded-xl ${iconData.bg} border border-siem-border/50`}>
              <Icon size={32} className={iconData.color} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{currentAlarm.title}</h2>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getSeverityColor(currentAlarm.severity)}`}>
                  {currentAlarm.severity || 'HIGH'}
                </span>
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Clock size={14} />
                {formatDate(currentAlarm.createdAt || currentAlarm.detectedAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          {currentAlarm.description && (
            <div className="mb-6 p-4 rounded-xl bg-siem-bg/50 border border-siem-border/50">
              <p className="text-gray-300 leading-relaxed">{currentAlarm.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentAlarm.sourceIP && (
              <div className="p-4 rounded-xl bg-siem-bg/50 border border-siem-border/50">
                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Kaynak IP</p>
                <p className="text-white font-mono font-semibold">{currentAlarm.sourceIP}</p>
              </div>
            )}
            
            {currentAlarm.country && (
              <div className="p-4 rounded-xl bg-siem-bg/50 border border-siem-border/50">
                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold flex items-center gap-1">
                  <MapPin size={12} />
                  Konum
                </p>
                <p className="text-white font-semibold">{currentAlarm.country}</p>
                {currentAlarm.countryCode && (
                  <p className="text-xs text-gray-400">({currentAlarm.countryCode})</p>
                )}
              </div>
            )}

            {currentAlarm.type && (
              <div className="p-4 rounded-xl bg-siem-bg/50 border border-siem-border/50">
                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Alarm Tipi</p>
                <p className="text-white font-semibold">{currentAlarm.type}</p>
              </div>
            )}

            {currentAlarm.attempts && (
              <div className="p-4 rounded-xl bg-siem-bg/50 border border-siem-border/50">
                <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Deneme Sayısı</p>
                <p className="text-white font-semibold">{currentAlarm.attempts}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-siem-border/50">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-siem-bg/60 hover:bg-siem-bg border border-siem-border/50 text-gray-300 hover:text-white transition-all font-medium"
            >
              Kapat
            </button>
            <button
              onClick={() => {
                handleClose();
                // Alarm History sayfasına yönlendir
                const event = new CustomEvent('navigateToAlarms');
                window.dispatchEvent(event);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-siem-accent to-blue-600 hover:from-blue-600 hover:to-siem-accent text-white font-semibold transition-all shadow-lg shadow-siem-accent/30"
            >
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmModal;
