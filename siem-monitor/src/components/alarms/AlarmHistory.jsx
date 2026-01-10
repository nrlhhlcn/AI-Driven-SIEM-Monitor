import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Clock, Shield, CheckCircle2, XCircle,
  Filter, Search, ChevronDown, ChevronUp, RefreshCw,
  Eye, Ban, MessageSquare, X, Loader2, AlertCircle,
  Code, Globe, Activity, Zap, ShieldAlert
} from 'lucide-react';
import { subscribeToAlarms, updateAlarmStatus } from '../../services/firebaseService';

const AlarmHistory = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, investigating, resolved
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAlarm, setExpandedAlarm] = useState(null);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAlarms((alarmData) => {
      setAlarms(alarmData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtreleme
  const filteredAlarms = alarms.filter(alarm => {
    // Status filtresi
    if (filter !== 'all' && alarm.status !== filter) return false;
    
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alarm.title?.toLowerCase().includes(query) ||
        alarm.description?.toLowerCase().includes(query) ||
        alarm.sourceIP?.toLowerCase().includes(query) ||
        alarm.type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // İstatistikler
  const stats = {
    total: alarms.length,
    open: alarms.filter(a => a.status === 'open').length,
    investigating: alarms.filter(a => a.status === 'investigating').length,
    resolved: alarms.filter(a => a.status === 'resolved').length,
  };

  // Alarm durumu güncelle
  const handleStatusUpdate = async (alarmId, newStatus, notes = '') => {
    setUpdating(true);
    await updateAlarmStatus(alarmId, newStatus, notes);
    setUpdating(false);
    setSelectedAlarm(null);
  };

  // Alarm tipi için icon
  const getAlarmIcon = (type) => {
    switch (type) {
      case 'BRUTE_FORCE': return ShieldAlert;
      case 'SQL_INJECTION': return Code;
      case 'GEO_ANOMALY': return Globe;
      case 'TRAFFIC_SPIKE': return Zap;
      case 'API_RATE_LIMIT': return Activity;
      default: return AlertTriangle;
    }
  };

  // Severity renkleri
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Status renkleri
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'investigating': return 'İnceleniyor';
      case 'resolved': return 'Çözüldü';
      default: return status;
    }
  };

  // Tarih formatlama
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Bilinmiyor';
    const date = timestamp?.toDate 
      ? timestamp.toDate() 
      : timestamp?.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="text-orange-400" />
            Alarm Geçmişi
          </h2>
          <p className="text-gray-400 text-sm mt-1">Tüm güvenlik alarmlarını görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setLoading(true)}
          className="flex items-center gap-2 px-4 py-2 bg-siem-card border border-siem-border rounded-lg text-gray-300 hover:bg-siem-bg/50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-siem-card border border-siem-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-400">Toplam Alarm</p>
            </div>
          </div>
        </div>
        <div className="bg-siem-card border border-siem-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.open}</p>
              <p className="text-xs text-gray-400">Açık</p>
            </div>
          </div>
        </div>
        <div className="bg-siem-card border border-siem-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.investigating}</p>
              <p className="text-xs text-gray-400">İnceleniyor</p>
            </div>
          </div>
        </div>
        <div className="bg-siem-card border border-siem-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
              <p className="text-xs text-gray-400">Çözüldü</p>
            </div>
          </div>
        </div>
      </div>

      {/* FİLTRELER */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Arama */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Alarm ara (IP, başlık, tip...)"
            className="w-full pl-11 pr-4 py-3 bg-siem-card border border-siem-border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-siem-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filtre */}
        <div className="flex gap-2">
          {['all', 'open', 'investigating', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-siem-accent text-white'
                  : 'bg-siem-card border border-siem-border text-gray-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'Tümü' : getStatusLabel(status)}
              {status !== 'all' && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                  {stats[status]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ALARM LİSTESİ */}
      <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="text-siem-accent animate-spin" />
          </div>
        ) : filteredAlarms.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Alarm bulunamadı</p>
            <p className="text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
          </div>
        ) : (
          <div className="divide-y divide-siem-border">
            {filteredAlarms.map((alarm) => {
              const Icon = getAlarmIcon(alarm.type);
              const isExpanded = expandedAlarm === alarm.id;

              return (
                <div key={alarm.id} className="hover:bg-siem-bg/30 transition-colors">
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedAlarm(isExpanded ? null : alarm.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        alarm.severity === 'critical' ? 'bg-red-500/20' :
                        alarm.severity === 'high' ? 'bg-orange-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        <Icon size={24} className={
                          alarm.severity === 'critical' ? 'text-red-400' :
                          alarm.severity === 'high' ? 'text-orange-400' :
                          'text-yellow-400'
                        } />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-white font-semibold">{alarm.title}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(alarm.severity)}`}>
                            {alarm.severity?.toUpperCase()}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(alarm.status)}`}>
                            {getStatusLabel(alarm.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{alarm.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(alarm.createdAt)}
                          </span>
                          {alarm.sourceIP && (
                            <span className="flex items-center gap-1">
                              <Globe size={12} />
                              {alarm.sourceIP}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Shield size={12} />
                            {alarm.type}
                          </span>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button className="shrink-0 p-2 text-gray-400 hover:text-white">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                      <div className="ml-16 space-y-4">
                        {/* Detaylar */}
                        <div className="bg-siem-bg/50 rounded-xl p-4 border border-siem-border">
                          <h4 className="text-sm font-semibold text-gray-300 mb-3">Detaylar</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Alarm ID</p>
                              <p className="text-white font-mono text-xs">{alarm.id.slice(-12)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Tespit Zamanı</p>
                              <p className="text-white">{formatDate(alarm.detectedAt || alarm.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Kaynak IP</p>
                              <p className="text-white">{alarm.sourceIP || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Deneme Sayısı</p>
                              <p className="text-white">{alarm.attempts || 'N/A'}</p>
                            </div>
                          </div>
                          {alarm.description && (
                            <div className="mt-4 pt-4 border-t border-siem-border">
                              <p className="text-gray-500 text-xs mb-1">Açıklama</p>
                              <p className="text-gray-300 text-sm">{alarm.description}</p>
                            </div>
                          )}
                          {alarm.notes && (
                            <div className="mt-4 pt-4 border-t border-siem-border">
                              <p className="text-gray-500 text-xs mb-1">Notlar</p>
                              <p className="text-gray-300 text-sm">{alarm.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Aksiyonlar */}
                        <div className="flex flex-wrap gap-3">
                          {alarm.status !== 'investigating' && alarm.status !== 'resolved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(alarm.id, 'investigating');
                              }}
                              disabled={updating}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                            >
                              <Eye size={16} />
                              İncelemeye Al
                            </button>
                          )}
                          {alarm.status !== 'resolved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(alarm.id, 'resolved');
                              }}
                              disabled={updating}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={16} />
                              Çözüldü Olarak İşaretle
                            </button>
                          )}
                          {alarm.sourceIP && alarm.sourceIP !== '127.0.0.1' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // IP engelleme işlemi
                                alert(`${alarm.sourceIP} IP adresi engellenecek`);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                            >
                              <Ban size={16} />
                              IP'yi Engelle
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlarm(alarm);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-siem-bg border border-siem-border text-gray-300 rounded-lg text-sm hover:bg-siem-border/50 transition-colors"
                          >
                            <MessageSquare size={16} />
                            Not Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOT EKLEME MODAL */}
      {selectedAlarm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-siem-card border border-siem-border rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-siem-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Not Ekle</h3>
              <button onClick={() => setSelectedAlarm(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-4">
                Alarm: <span className="text-white">{selectedAlarm.title}</span>
              </p>
              <textarea
                id="alarmNotes"
                rows={4}
                placeholder="Notunuzu yazın..."
                className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-siem-accent"
              />
            </div>
            <div className="p-6 border-t border-siem-border flex gap-3 justify-end">
              <button
                onClick={() => setSelectedAlarm(null)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const notes = document.getElementById('alarmNotes').value;
                  handleStatusUpdate(selectedAlarm.id, selectedAlarm.status, notes);
                }}
                disabled={updating}
                className="flex items-center gap-2 px-6 py-2 bg-siem-accent hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmHistory;

