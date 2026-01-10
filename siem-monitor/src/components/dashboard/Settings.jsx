import React, { useState } from 'react';
import { 
  Save, Bell, Shield, Server, Mail, Smartphone, 
  Lock, RefreshCw, Database, Eye, EyeOff 
} from 'lucide-react';

const Settings = () => {
  // Basit state yönetimi (UI tepkileri için)
  const [apiKey, setApiKey] = useState('sk_live_51M0...x4B2');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kaydetme animasyonu
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      
      {/* SAYFA BAŞLIĞI */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sistem Yapılandırması</h2>
          <p className="text-gray-400 text-sm mt-1">SIEM kurallarını, bildirimleri ve API erişimlerini yönetin.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-siem-accent hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-all shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL KOLON: GENEL AYARLAR */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Güvenlik Kuralları (Switchler) */}
          <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-siem-border bg-siem-bg/50 flex items-center gap-3">
              <Shield className="text-siem-accent" size={20} />
              <h3 className="font-semibold text-white">Tespit Kuralları (Detection Rules)</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                { title: 'Brute Force Koruması', desc: '5 başarısız giriş denemesinde IP adresini 30dk engelle.', active: true },
                { title: 'Malware İmzası Tarama', desc: 'Gelen paketlerde bilinen trojan/virüs imzalarını ara.', active: true },
                { title: 'Port Tarama Tespiti', desc: 'Hızlı ardışık port taramalarını (Nmap vb.) tespit et.', active: true },
                { title: 'Anormal Trafik Analizi (AI)', desc: 'Yapay zeka ile standart dışı veri akışlarını izle.', active: false },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{rule.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{rule.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={rule.active} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-siem-success"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Bildirim Ayarları */}
          <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-siem-border bg-siem-bg/50 flex items-center gap-3">
              <Bell className="text-orange-400" size={20} />
              <h3 className="font-semibold text-white">Alarm Bildirimleri</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Email */}
               <div className="space-y-3">
                  <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Mail size={16} /> Kritik Alarmlar (E-Posta)
                  </label>
                  <input type="email" defaultValue="admin@sirket.com" className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white focus:border-siem-accent outline-none" />
               </div>
               {/* SMS */}
               <div className="space-y-3">
                  <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Smartphone size={16} /> SMS Bildirimi
                  </label>
                  <input type="tel" placeholder="+90 555 ..." className="w-full bg-siem-bg border border-siem-border rounded-lg px-4 py-2 text-white focus:border-siem-accent outline-none" />
               </div>
            </div>
          </div>

        </div>

        {/* SAĞ KOLON: SİSTEM & API */}
        <div className="space-y-6">
          
          {/* 1. Sistem Durumu */}
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
             
             <button className="w-full mt-6 py-2 border border-siem-border rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors">
                Logları Temizle / Arşivle
             </button>
          </div>

          {/* 2. API Erişimi */}
          <div className="bg-siem-card border border-siem-border rounded-xl p-6">
             <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <Lock size={20} className="text-yellow-500" />
                API Entegrasyonu
             </div>
             <p className="text-xs text-gray-400 mb-4">
                Agent'ların (Ajanların) log göndermek için kullandığı gizli anahtar.
             </p>
             
             <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKey} 
                  readOnly
                  className="w-full bg-siem-bg border border-siem-border rounded-lg pl-3 pr-10 py-2 text-sm text-gray-300 font-mono"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-white"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
             </div>
             <button className="w-full mt-3 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors">
                Yeni Anahtar Oluştur
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
