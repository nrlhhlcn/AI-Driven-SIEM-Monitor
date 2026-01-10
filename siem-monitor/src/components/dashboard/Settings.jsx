import React, { useState, useEffect } from 'react';
import { 
  Save, Bell, Shield, Server, Mail, Smartphone, 
  RefreshCw, Database, Plus,
  Trash2, Edit2, Check, X, AlertTriangle, Zap,
  Clock, Globe, Code, Activity, Loader2
} from 'lucide-react';
import { 
  subscribeToRules, 
  addDetectionRule, 
  updateDetectionRule, 
  deleteDetectionRule,
  initializeDefaultRules
} from '../../services/firebaseService';

// Varsayılan kurallar - Firebase'e kaydedilecek
const DEFAULT_RULES = [
  { 
    id: 'brute-force',
    name: 'Brute Force Koruması', 
    description: 'Belirli süre içinde çok sayıda başarısız giriş denemesinde alarm oluştur.',
    eventType: 'AUTH_FAIL',
    threshold: 5,
    timeWindow: 3,
    timeUnit: 'minutes',
    action: 'alert',
    severity: 'critical',
    isActive: true,
    isDefault: true
  },
  { 
    id: 'sql-injection',
    name: 'SQL Injection Tespiti', 
    description: 'SQL injection pattern\'leri içeren giriş denemelerini tespit et.',
    eventType: 'SQL_INJECTION',
    threshold: 1,
    timeWindow: 1,
    timeUnit: 'minutes',
    action: 'alert',
    severity: 'critical',
    isActive: true,
    isDefault: true
  },
  { 
    id: 'abnormal-login-time',
    name: 'Anormal Giriş Saati', 
    description: '00:00-06:00 arası yapılan giriş işlemlerini izle.',
    eventType: 'LOGIN_SUCCESS',
    threshold: 1,
    timeWindow: 6,
    timeUnit: 'hours',
    action: 'alert',
    severity: 'medium',
    isActive: true,
    isDefault: true
  },
  { 
    id: 'api-rate-limit',
    name: 'API Rate Limit', 
    description: 'Belirli süre içinde aşırı API isteği yapılmasını tespit et.',
    eventType: 'API_REQUEST',
    threshold: 100,
    timeWindow: 1,
    timeUnit: 'minutes',
    action: 'alert',
    severity: 'high',
    isActive: true,
    isDefault: true
  },
  { 
    id: 'suspicious-country',
    name: 'Şüpheli Ülke Tespiti', 
    description: 'Tanımlı olmayan ülkelerden (Türkiye, Almanya dışı) giriş denemelerini tespit et.',
    eventType: 'LOGIN_SUCCESS',
    allowedCountries: ['Turkey', 'Germany', 'TR', 'DE', 'Türkiye', 'Almanya'],
    action: 'alert',
    severity: 'high',
    isActive: true,
    isDefault: true
  },
];

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    eventType: 'AUTH_FAIL',
    threshold: 5,
    timeWindow: 3,
    timeUnit: 'minutes',
    action: 'alert',
    severity: 'high',
    isActive: true
  });

  // Firebase'den kuralları çek veya eksik varsayılanları yükle
  useEffect(() => {
    let isInitializing = false;
    
    const unsubscribe = subscribeToRules(async (firebaseRules) => {
      // Eksik varsayılan kuralları bul
      const existingIds = firebaseRules.map(r => r.id);
      const missingRules = DEFAULT_RULES.filter(r => !existingIds.includes(r.id));
      
      if (missingRules.length > 0 && !isInitializing) {
        isInitializing = true;
        console.log('Eksik kurallar yükleniyor:', missingRules.map(r => r.name));
        await initializeDefaultRules(missingRules);
        // initializeDefaultRules yeni snapshot tetikleyecek, o zaman rules güncellenecek
      } else {
        // Tüm kurallar var, state'i güncelle
        setRules(firebaseRules);
        setRulesLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    setLoading(true);
    setSaveStatus('Kaydediliyor...');
    setTimeout(() => {
      setLoading(false);
      setSaveStatus('Kaydedildi!');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1500);
  };

  const toggleRule = async (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    // Firebase'de güncelle
    const success = await updateDetectionRule(ruleId, { isActive: !rule.isActive });
    if (success) {
      console.log('✅ Kural durumu güncellendi:', ruleId);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.name) return;
    
    setLoading(true);
    const ruleId = await addDetectionRule(newRule);
    setLoading(false);
    
    if (ruleId) {
      setShowRuleModal(false);
      setNewRule({
        name: '',
        description: '',
        eventType: 'AUTH_FAIL',
        threshold: 5,
        timeWindow: 3,
        timeUnit: 'minutes',
        action: 'alert',
        severity: 'high',
        isActive: true
      });
    }
  };

  const handleDeleteRule = async (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule?.isDefault) {
      alert('Varsayılan kurallar silinemez, sadece devre dışı bırakılabilir.');
      return;
    }
    
    if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
      await deleteDetectionRule(ruleId);
    }
  };

  const handleEditRule = async () => {
    if (!editingRule?.name) return;
    
    setLoading(true);
    const success = await updateDetectionRule(editingRule.id, {
      name: editingRule.name,
      description: editingRule.description,
      eventType: editingRule.eventType,
      threshold: editingRule.threshold,
      timeWindow: editingRule.timeWindow,
      timeUnit: editingRule.timeUnit,
      action: editingRule.action,
      severity: editingRule.severity,
      isActive: editingRule.isActive,
    });
    setLoading(false);
    
    if (success) {
      console.log('✅ Kural güncellendi:', editingRule.id);
      setEditingRule(null);
    }
  };

  const eventTypeOptions = [
    { value: 'AUTH_FAIL', label: 'Başarısız Giriş' },
    { value: 'LOGIN_SUCCESS', label: 'Başarılı Giriş' },
    { value: 'SQL_INJECTION', label: 'SQL Injection' },
    { value: 'API_REQUEST', label: 'API İsteği' },
    { value: 'FILE_UPLOAD', label: 'Dosya Yükleme' },
    { value: 'UNAUTHORIZED_ACCESS', label: 'Yetkisiz Erişim' },
    { value: 'WEB_TRAFFIC', label: 'Web Trafiği' },
  ];

  const severityOptions = [
    { value: 'critical', label: 'Kritik', color: 'text-red-400' },
    { value: 'high', label: 'Yüksek', color: 'text-orange-400' },
    { value: 'medium', label: 'Orta', color: 'text-yellow-400' },
    { value: 'low', label: 'Düşük', color: 'text-blue-400' },
  ];

  const actionOptions = [
    { value: 'alert', label: 'Alarm Oluştur' },
    { value: 'email', label: 'E-posta Gönder' },
    { value: 'block', label: 'IP Engelle' },
    { value: 'log', label: 'Sadece Logla' },
  ];

  const getRuleIcon = (eventType) => {
    switch (eventType) {
      case 'AUTH_FAIL': return Shield;
      case 'SQL_INJECTION': return Code;
      case 'LOGIN_SUCCESS': return Clock;
      case 'API_REQUEST': return Activity;
      case 'UNAUTHORIZED_ACCESS': return AlertTriangle;
      default: return Zap;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* SAYFA BAŞLIĞI */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sistem Yapılandırması</h2>
          <p className="text-gray-400 text-sm mt-1">SIEM kurallarını ve bildirimleri yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-sm text-green-400 animate-pulse">{saveStatus}</span>
          )}
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-siem-accent hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-all shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      {/* TESPİT KURALLARI YÖNETİMİ */}
      <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden mb-8">
        <div className="p-5 border-b border-siem-border bg-siem-bg/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-siem-accent" size={20} />
            <div>
              <h3 className="font-semibold text-white">Tespit Kuralları (Detection Rules)</h3>
              <p className="text-xs text-gray-400 mt-1">
                Olay tabanlı tetikleyici kurallar • 
                <span className="text-green-400 ml-1">Firebase'e otomatik kaydedilir</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-siem-accent hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
          >
            <Plus size={18} />
            Yeni Kural
          </button>
        </div>
        
        {rulesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-siem-accent animate-spin" />
            <span className="ml-3 text-gray-400">Kurallar yükleniyor...</span>
          </div>
        ) : (
          <div className="divide-y divide-siem-border">
            {rules.map((rule) => {
              const Icon = getRuleIcon(rule.eventType);
              const isEditing = editingRule?.id === rule.id;
              
              return (
                <div key={rule.id} className="p-5 hover:bg-siem-bg/30 transition-colors">
                  {isEditing ? (
                    // Düzenleme Modu
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Kural Adı</label>
                          <input
                            type="text"
                            value={editingRule.name}
                            onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Event Tipi</label>
                          <select
                            value={editingRule.eventType}
                            onChange={(e) => setEditingRule({ ...editingRule, eventType: e.target.value })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {eventTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Eşik Değeri</label>
                          <input
                            type="number"
                            value={editingRule.threshold}
                            onChange={(e) => setEditingRule({ ...editingRule, threshold: parseInt(e.target.value) })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Zaman Aralığı</label>
                          <input
                            type="number"
                            value={editingRule.timeWindow}
                            onChange={(e) => setEditingRule({ ...editingRule, timeWindow: parseInt(e.target.value) })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Birim</label>
                          <select
                            value={editingRule.timeUnit}
                            onChange={(e) => setEditingRule({ ...editingRule, timeUnit: e.target.value })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="seconds">Saniye</option>
                            <option value="minutes">Dakika</option>
                            <option value="hours">Saat</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Önem Derecesi</label>
                          <select
                            value={editingRule.severity}
                            onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value })}
                            className="w-full bg-siem-bg border border-siem-border rounded-lg px-3 py-2 text-white text-sm"
                          >
                            {severityOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingRule(null)}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleEditRule}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-siem-success text-white rounded-lg text-sm disabled:opacity-50"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          Firebase'e Kaydet
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal Görünüm
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rule.isActive ? 'bg-siem-accent/20' : 'bg-gray-700/50'
                        }`}>
                          <Icon size={20} className={rule.isActive ? 'text-siem-accent' : 'text-gray-500'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{rule.name}</h4>
                            {rule.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Sistem</span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              rule.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              rule.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              rule.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {severityOptions.find(s => s.value === rule.severity)?.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{rule.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Event: {eventTypeOptions.find(e => e.value === rule.eventType)?.label}</span>
                            <span>•</span>
                            <span className="text-yellow-400 font-semibold">Eşik: {rule.threshold}</span>
                            <span>•</span>
                            <span>Süre: {rule.timeWindow} {rule.timeUnit === 'minutes' ? 'dk' : rule.timeUnit === 'hours' ? 'saat' : 'sn'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingRule({...rule})}
                          className="p-2 text-gray-500 hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 size={18} />
                        </button>
                        {!rule.isDefault && (
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={rule.isActive} 
                            onChange={() => toggleRule(rule.id)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL KOLON: BİLDİRİM AYARLARI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bildirim Ayarları */}
          <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-siem-border bg-siem-bg/50 flex items-center gap-3">
              <Bell className="text-orange-400" size={20} />
              <h3 className="font-semibold text-white">Alarm Bildirimleri</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Mail size={16} /> Kritik Alarmlar (E-Posta)
                  </label>
                  <input type="email" defaultValue="admin@sirket.com" className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white focus:border-siem-accent outline-none" />
               </div>
               <div className="space-y-3">
                  <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Smartphone size={16} /> SMS Bildirimi
                  </label>
                  <input type="tel" placeholder="+90 555 ..." className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white focus:border-siem-accent outline-none" />
               </div>
            </div>
          </div>

        </div>

        {/* SAĞ KOLON: SİSTEM */}
        <div className="space-y-6">
          
          {/* Sistem Durumu */}
          <div className="bg-siem-card border border-siem-border rounded-xl p-6">
             <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <Server size={20} className="text-purple-500" />
                Sistem Kaynakları
             </div>
             
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>CPU Kullanımı</span>
                      <span>%45</span>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>RAM (16GB)</span>
                      <span>%72</span>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Disk (Log Depolama)</span>
                      <span>1.2TB / 2TB</span>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* YENİ KURAL MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-siem-card border border-siem-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-siem-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Yeni Tespit Kuralı</h3>
              <button onClick={() => setShowRuleModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Kural Adı *</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Örn: Port Tarama Tespiti"
                  className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Açıklama</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Bu kural ne yapar?"
                  rows={2}
                  className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Event Tipi</label>
                  <select
                    value={newRule.eventType}
                    onChange={(e) => setNewRule({ ...newRule, eventType: e.target.value })}
                    className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                  >
                    {eventTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Önem Derecesi</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                  >
                    {severityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Eşik Değeri</label>
                  <input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Zaman Aralığı</label>
                  <input
                    type="number"
                    value={newRule.timeWindow}
                    onChange={(e) => setNewRule({ ...newRule, timeWindow: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Birim</label>
                  <select
                    value={newRule.timeUnit}
                    onChange={(e) => setNewRule({ ...newRule, timeUnit: e.target.value })}
                    className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                  >
                    <option value="seconds">Saniye</option>
                    <option value="minutes">Dakika</option>
                    <option value="hours">Saat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Aksiyon</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white"
                >
                  {actionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-siem-border flex gap-3 justify-end">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddRule}
                disabled={!newRule.name || loading}
                className="flex items-center gap-2 px-6 py-2 bg-siem-accent hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Kural Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
