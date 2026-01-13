# AI-Driven-SIEM-Monitor

**Proje #3: Event-Driven Akıllı Bildirim ve İzleme Sistemi**

Bu proje, Sistem, olay tabanlı (event-driven) bir mimari ile çalışan, yapay zeka destekli güvenlik izleme ve bildirim sistemidir.

## 🎯 Proje Özeti

**AI-Driven SIEM Monitor**, güvenlik olaylarını gerçek zamanlı olarak izleyen, anormallikleri tespit eden ve yapay zeka destekli öneriler sunan kapsamlı bir güvenlik izleme ve bildirim sistemidir. Sistem, olay tabanlı (event-driven) mimari ile çalışır ve modern web teknolojileri kullanılarak geliştirilmiştir.

### Problem Tanımı

Günümüzde kurumlar ve organizasyonlar, sürekli artan siber güvenlik tehditleriyle karşı karşıyadır. Manuel güvenlik izleme süreçleri zaman alıcı, hata eğilimli ve ölçeklenebilir değildir. Ayrıca:
- Güvenlik olaylarının anında tespit edilmesi zordur
- Kritik tehditler zamanında fark edilmeyebilir
- Eşik değerleri ve kurallar statik kalır, dinamik olarak optimize edilmez
- Gereksiz alarmlar operasyonel verimliliği düşürür
- Coğrafi ve zaman bazlı anomaliler manuel olarak tespit edilemez

### Çözüm Yaklaşımı

Bu proje, yukarıdaki sorunları çözmek için geliştirilmiş bir SIEM (Security Information and Event Management) sistemidir. Sistem:

1. **Otomatik Tehdit Tespiti**: 7 farklı algoritma ile güvenlik tehditlerini otomatik olarak tespit eder
2. **Yapay Zeka Destekli Analiz**: Geçmiş verileri analiz ederek sistemin kendini optimize etmesini sağlar
3. **Gerçek Zamanlı İzleme**: Firebase Firestore ile anlık veri senkronizasyonu ve canlı izleme imkanı sunar
4. **Özelleştirilebilir Kurallar**: Her kurumun kendi güvenlik politikalarına göre tespit kuralları tanımlayabilmesini sağlar
5. **Kullanıcı Dostu Arayüz**: Modern React tabanlı dashboard ile kolay kullanım ve görselleştirme imkanı sunar

### Sistem Mimarisi

Sistem üç ana bileşenden oluşur:

- **Victim App (Test Uygulaması)**: Güvenlik olaylarını simüle eden React tabanlı web uygulaması. Üniversite teması ile gerçekçi senaryolar oluşturur.
- **SIEM Monitor Dashboard**: Güvenlik olaylarını izleyen, analiz eden ve alarm üreten ana izleme paneli. Modern React arayüzü ile gerçek zamanlı veri görselleştirmesi sunar.
- **Firebase Firestore**: Gerçek zamanlı veri senkronizasyonu sağlayan NoSQL veritabanı. Event-driven mimari ile anlık veri akışı sağlar.

### Teknik Özellikler

- **Event-Driven Architecture**: Olay tabanlı mimari ile yüksek performanslı ve ölçeklenebilir yapı
- **Real-time Data Processing**: Firebase Firestore ile anlık veri işleme ve senkronizasyon
- **Modüler Kod Yapısı**: Yeniden kullanılabilir ve test edilebilir modüler servis yapısı
- **Kapsamlı Test Coverage**: 40+ test case ile %80+ coverage hedefi
- **Modern Web Technologies**: React 19, Vite, Tailwind CSS gibi modern teknolojiler

### Kullanım Senaryoları

Sistem, aşağıdaki senaryolarda kullanılabilir:

- **Kurumsal Güvenlik İzleme**: Büyük kurumlar için merkezi güvenlik izleme ve yönetim platformu
- **Siber Güvenlik Operasyonları**: SOC (Security Operations Center) ekipleri için gerçek zamanlı tehdit tespiti
- **Güvenlik Araştırmaları**: Güvenlik araştırmacıları için farklı saldırı senaryolarını simüle etme
- **Eğitim ve Öğrenme**: Güvenlik eğitimi için pratik uygulama ortamı

### Öne Çıkan Özellikler

- ✅ **7 Farklı Anomali Tespit Algoritması**: Brute force, SQL injection, coğrafi anomali, trafik artışı, anormal giriş saatleri, API abuse ve şüpheli ülke tespiti
- ✅ **4 Tip AI Destekli Öneri**: Eşik değeri optimizasyonu, IP engelleme, bildirim azaltma ve kullanıcı güvenlik önerileri
- ✅ **Gerçek Zamanlı Dashboard**: Canlı log akışı, dinamik istatistikler ve interaktif grafikler
- ✅ **Özelleştirilebilir Tespit Kuralları**: Kullanıcı tanımlı kurallar, eşik değerleri ve zaman pencereleri
- ✅ **Coğrafi Tehdit Görselleştirmesi**: Harita üzerinde ülke bazlı tehdit analizi
- ✅ **Kapsamlı Test Suite**: 40+ test case ile güvenilir ve sürdürülebilir kod

### Temel Özellikler

- ✅ **Olay (Event) Tanımlama**: Kullanıcılar güvenlik olaylarını tanımlayabilir
- ✅ **Tetikleyici Kurallar**: Olaylara bağlı özelleştirilebilir kurallar oluşturma
- ✅ **Otomatik Bildirimler**: Kurallar gerçekleştiğinde otomatik alarm üretimi
- ✅ **Anormal Durum Tespiti**: 7 farklı anomali tespit algoritması
  - Brute Force Saldırıları
  - SQL Injection Denemeleri
  - Anormal Giriş Saatleri
  - Trafik Artışları
  - Coğrafi Anomaliler
  - API Rate Limit Aşımı
  - Şüpheli Ülke Tespiti
- ✅ **AI Destekli Öneriler**: 
  - Eşik değeri optimizasyonu
  - IP engelleme önerileri
  - Bildirim azaltma önerileri
  - 2FA aktivasyon önerileri
- ✅ **Real-time İzleme**: Firebase Firestore ile gerçek zamanlı veri akışı
- ✅ **Web Tabanlı Dashboard**: Modern React arayüzü
- ✅ **Victim App (Test Uygulaması)**: Güvenlik olaylarını simüle eden test uygulaması

## 🛠️ Teknolojiler

### Frontend
- **React 19** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Firebase Firestore** - Real-time Database
- **Recharts** - Data Visualization
- **Lucide React** - Icons

### Backend
- **.NET 8** - API Framework
- **MassTransit** - Message Queue
- **Firebase Admin SDK** - Backend Firebase Integration

### Test
- **Vitest** - Test Framework
- **@testing-library/react** - Component Testing
- **jsdom** - DOM Environment

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- .NET 8 SDK
- Firebase Projesi (Firestore aktif)
- Firebase Authentication aktif

### SIEM Monitor Kurulumu

```bash
cd siem-monitor
npm install
npm run dev
```

SIEM Monitor `http://localhost:5173` adresinde çalışacaktır.

### Victim App Kurulumu

```bash
cd victim-app-react
npm install
npm run dev
```

Victim App `http://localhost:5174` (veya bir sonraki port) adresinde çalışacaktır.



### Firebase Yapılandırması

1. Firebase Console'dan Firestore Database'i aktif edin
2. `firestore.rules` dosyasındaki kuralları Firebase Console'a yükleyin
3. Firebase Authentication'ı aktif edin
4. Her iki uygulama için Firebase config dosyalarını güncelleyin

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# UI ile test çalıştır
npm run test:ui

# Coverage raporu
npm run test:coverage
```

## 🧪 Test Kapsamı

Proje kapsamında aşağıdaki testler yazılmıştır:

### Unit Testler
- ✅ Anomali tespit fonksiyonları (7 farklı algoritma)
- ✅ AI öneri sistemleri (4 farklı öneri tipi)
- ✅ Edge-case senaryoları
- ✅ Hata durumu yönetimi
- ✅ Performans testleri

### Component Testler
- ✅ Dashboard render testleri
- ✅ State yönetimi testleri
- ✅ Event handling testleri

### Test İstatistikleri
- **Toplam Test Sayısı**: 40+ test case
- **Coverage Hedefi**: %80+
- **Edge Cases**: 10+ senaryo
- **Test Framework**: Vitest
- **Test Kütüphaneleri**: @testing-library/react, @testing-library/jest-dom

## 📊 Test Sonuçları

Testler çalıştırıldığında aşağıdaki kategorilerde testler bulunur:

1. **Anomali Tespit Fonksiyonları** (30+ test)
   - Brute Force Detection (6 test)
   - SQL Injection Detection (2 test)
   - Traffic Spike Detection (2 test)
   - Geo Anomaly Detection (2 test)
   - API Abuse Detection (2 test)
   - Abnormal Login Time Detection (3 test)
   - Suspicious Country Detection (2 test)
   - detectAllAnomalies (2 test)

2. **AI Öneri Sistemleri** (8+ test)
   - Threshold Recommendations (2 test)
   - IP Block Recommendations (2 test)
   - Notification Reduction (1 test)
   - User Security Recommendations (1 test)
   - generateAllAIRecommendations (1 test)

3. **Edge Cases** (5+ test)
   - Null/undefined handling
   - Missing configuration
   - Large data sets
   - Concurrent operations
   - Invalid timestamp handling

## 🏗️ Mimari

```
┌─────────────────┐
│  Victim App     │  →  Event Generation
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │  →  Event Processing
│  (.NET)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Firebase       │  →  Real-time Storage
│  Firestore      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SIEM Monitor   │  →  Detection & Alerts
│  (React)         │
└─────────────────┘
```

## 📝 Kullanım

### 1. Victim App ile Test Senaryoları

Victim app üzerinden çeşitli güvenlik olayları simüle edilebilir:

#### Login Sayfası (`/login`)
- **Brute Force Testi**: `root` kullanıcı adı ile giriş denemesi yapın
- **SQL Injection Testi**: `' OR '1'='1` gibi SQL injection pattern'leri deneyin
- **Coğrafi Test**: Sağ üstteki ülke seçici ile farklı ülkelerden giriş simüle edin
- **Test Kullanıcıları**: 
  - `admin@bakircay.edu.tr` / `Admin123!`
  - `ogrenci@bakircay.edu.tr` / `Ogrenci123!`

#### Admin Sayfası (`/admin`)
- Yetkisiz erişim denemeleri otomatik olarak loglanır
- 3+ yetkisiz erişim denemesi kritik alarm tetikler

#### API Test Sayfası (`/api`)
- 10+ istek gönderilirse rate limit uyarısı tetiklenir
- Geçersiz API key kullanımı loglanır
- DELETE ve PUT metodları hassas endpoint erişimi olarak işaretlenir

#### Dosya Yükleme Sayfası (`/upload`)
- `.exe`, `.php`, `.sh`, `.bat` gibi şüpheli dosyalar tespit edilir
- Şüpheli dosya tipleri yüksek seviye alarm tetikler

### 2. SIEM Monitor Dashboard

#### Dashboard Özellikleri
- **Gerçek Zamanlı İstatistikler**: Toplam eventler, kritik tehditler, sistem sağlığı
- **AI Önerileri Paneli**: Eşik değeri, IP engelleme, bildirim ve güvenlik önerileri
- **Trafik Grafikleri**: Zaman bazlı trafik görselleştirmesi
- **Aktif Alarmlar**: Son kritik ve yüksek öncelikli alarmlar

#### Live Logs Özellikleri
- Gerçek zamanlı log akışı
- Severity bazlı filtreleme (critical, high, medium, low, info)
- Text arama özelliği
- Pause/Play ile log akışını kontrol etme
- Detaylı log görüntüleme

#### Settings Özellikleri
- Tespit kuralı ekleme, düzenleme ve silme
- Eşik değeri ayarlama
- Zaman penceresi konfigürasyonu
- Kural aktif/pasif durumu yönetimi

#### Threat Map Özellikleri
- Coğrafi tehdit görselleştirmesi
- Ülke bazlı istatistikler
- IP lokasyon takibi

### 3. Kural Tanımlama

Settings sayfasından yeni tespit kuralları eklenebilir:

- Event Tipi seçimi (AUTH_FAIL, SQL_INJECTION, vb.)
- Eşik değeri belirleme (örn: 5 başarısız giriş)
- Zaman aralığı ayarlama (örn: 10 dakika)
- Önem derecesi seçimi (critical, high, medium, low)
- Kural aktif/pasif durumu

### 4. AI Önerilerini İnceleme

Dashboard'da AI destekli öneriler görüntülenir:
- **Eşik Değeri Optimizasyonları**: Geçmiş verilere dayalı optimal eşik önerileri
- **IP Engelleme Önerileri**: Yüksek riskli IP'ler için otomatik engelleme önerileri
- **Bildirim Azaltma Önerileri**: Gereksiz alarmları azaltmak için öneriler
- **Kullanıcı Güvenlik Önerileri**: 2FA aktivasyon önerileri

## 🔒 Güvenlik

### Güvenlik Özellikleri

- **Firebase Security Rules**: Veri erişim kontrolü ve yetkilendirme
- **API Key Authentication**: API endpoint'leri için kimlik doğrulama
- **Rate Limiting**: API kötüye kullanımına karşı koruma
- **SQL Injection Koruması**: Pattern matching ile SQL injection tespiti
- **Coğrafi Filtreleme**: Şüpheli ülke tespiti ve engelleme
- **IP Bazlı Takip**: Şüpheli IP adreslerinin takibi ve engelleme önerileri

### Güvenlik Best Practices

- Tüm güvenlik olayları loglanır ve analiz edilir
- Kritik olaylar için anında alarm üretilir
- AI destekli öneriler ile proaktif güvenlik yönetimi
- Gerçek zamanlı izleme ile hızlı müdahale imkanı

## 📈 Geliştirme Notları

### AI Kullanımı

Bu projede aşağıdaki YZ araçları kullanılmıştır:

- **GitHub Copilot**: Component geliştirme ve kod tamamlama
- **Claude Code**: Test yazımı ve algoritma geliştirme
- **Cursor AI**: Kod refactoring ve optimizasyon

### AI Karar Süreçleri

Proje geliştirme sürecinde AI araçlarından alınan öneriler değerlendirilmiş ve kararlar alınmıştır:

- ✅ **AI Önerisi Kabul Edildi**: 8 karar (React, Vite, Tailwind CSS, vb.)
- 🔄 **AI Önerisi Değiştirildi**: 6 karar (SQLite → Firestore, Redux → Context API, vb.)
- 📈 **AI Önerisi Genişletildi**: 18 karar (Basit öneriler gelişmiş özelliklere dönüştürüldü)

Detaylı AI karar tablosu için sunum dokümanlarına bakınız.

### AI Yanlış Çıktı Örnekleri

Bu bölüm, proje geliştirme sürecinde tespit edilen ve düzeltilen AI hatalarını belgelemektedir. Bu örnekler, AI'ın yanıltıcı olabileceği durumları ve insan müdahalesinin kritik önemini göstermektedir.

#### Örnek 1: Gemini API Event Type Yanlış Yorumlaması

**Sorun:**
- Gemini API, VPN ile giriş yapıldığında oluşan `GEO_ANOMALY` ve `SUSPICIOUS_COUNTRY` event'lerini "başarısız giriş denemesi" olarak yorumluyordu.
- Oysa bu event'ler coğrafi anomali/şüpheli ülke kategorisinde, başarısız giriş değil.
- Bu yanlış yorumlama, güvenlik analizinin yanlış kategorize edilmesine neden oluyordu.

**Tespit:**
- Test sırasında VPN ile giriş yapıldığında Gemini'nin analiz sonucu yanlış kategorize edildi.
- Kullanıcı geri bildirimi ile tespit edildi: "VPN ile giriş yapmayı denedim alert olarak geldi ama yapay zeka ile analiz ettiğimde bunu başarısız bir giriş denemesi olarak aldı."

**Kök Neden:**
- Gemini API'ye gönderilen prompt'ta event type'larının anlamları açıkça belirtilmemişti.
- AI, event type'larını görünce context'i tam anlamadan yorumlama yapıyordu.
- `GEO_ANOMALY` ve `SUSPICIOUS_COUNTRY` event'leri ile `AUTH_FAIL` event'leri arasındaki fark net değildi.

**Çözüm:**
- Prompt'a detaylı event type açıklamaları eklendi (`geminiService.js` satır 135-145).
- Analiz talimatları detaylandırıldı (satır 163-167).
- Event type'larının anlamları ve kategorileri açıkça belirtildi.
- Özel talimatlar eklendi: "Coğrafi anomaliler ile başarısız giriş denemelerini karıştırma."

**Ders:**
- AI modelleri context'i tam anlamadan yorumlama yapabilir.
- Prompt engineering kritik öneme sahip; her detay açıkça belirtilmelidir.
- Her AI çıktısı doğrulanmalı ve test edilmelidir.
- Kullanıcı geri bildirimleri AI hatalarını tespit etmede önemlidir.

**Kod Değişikliği:**
```javascript
// geminiService.js - Önceki prompt (eksik)
"Son 5 dakikadaki güvenlik olaylarını analiz et..."

// geminiService.js - Yeni prompt (düzeltilmiş)
"**ÖNEMLİ: EVENT TYPE AÇIKLAMALARI:**
- GEO_ANOMALY: Coğrafi anomali - VPN kullanımı veya hesap ele geçirme işareti
- SUSPICIOUS_COUNTRY: Şüpheli ülkeden giriş - VPN veya gerçek tehdit
...
**ANALİZ TALİMATLARI:**
1. Event type'larına dikkat et: GEO_ANOMALY ve SUSPICIOUS_COUNTRY 
   coğrafi anomali/şüpheli ülke anlamına gelir, başarısız giriş değil"
```

**Sonuç:**
- Düzeltme sonrası Gemini API, coğrafi anomalileri doğru kategorize ediyor.
- VPN ile giriş yapıldığında "coğrafi anomali" olarak yorumlanıyor, "başarısız giriş" değil.
- Bu örnek, AI'ın yanıltıcı olabileceği durumları ve prompt engineering'in önemini göstermektedir.

### Commit Etiketleri

- `[AI-generated]`: Tamamen AI tarafından üretilen kod
- `[AI-assisted]`: AI yardımı ile yazılan kod
- `[Human-written]`: İnsan tarafından yazılan kod

### Proje Yapısı

```
AI-Driven-SIEM-Monitor/
├── siem-monitor/              # SIEM Monitor Dashboard
│   ├── src/
│   │   ├── components/        # React component'leri
│   │   │   ├── dashboard/    # Dashboard, Settings, StatCard, TrafficChart
│   │   │   ├── logs/         # LiveLogs component
│   │   │   ├── alarms/        # AlarmHistory, AlarmModal
│   │   │   ├── threats/      # ThreatMap component
│   │   │   ├── admin/        # AddUsers component
│   │   │   └── layout/        # Sidebar component
│   │   ├── services/         # Firebase servisleri ve anomali tespit fonksiyonları
│   │   ├── config/           # Firebase konfigürasyonu
│   │   └── test/            # Test setup dosyaları
│   └── package.json
├── victim-app-react/          # Test uygulaması (Victim App)
│   ├── src/
│   │   ├── pages/           # LoginPage, AdminPage, ApiPage, UploadPage, vb.
│   │   ├── services/        # SIEM logger ve geolocation servisleri
│   │   └── config/          # Firebase konfigürasyonu
│   └── package.json
├── firestore.rules           # Firebase Security Rules
├── FIREBASE_SETUP.md         # Firebase kurulum rehberi
└── README.md                 # Bu dosya
```

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👥 Geliştiriciler

- Final Proje - BİL440
- 2025-26 Güz Dönemi

## 🚀 Gelecek Geliştirmeler

- [ ] Machine Learning model entegrasyonu
- [ ] Email/SMS bildirimleri
- [ ] Gelişmiş raporlama ve analitik
- [ ] Multi-tenant desteği
- [ ] Integration testleri
- [ ] E2E testleri (Playwright/Cypress)
- [ ] Performance benchmark testleri
- [ ] Load testing senaryoları

## 📚 Referanslar

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vitest Documentation](https://vitest.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)



**Not**: Bu proje, yapay zeka kod asistanları kullanılarak geliştirilmiştir. Detaylı AI kullanım logu ve karar süreçleri teknik raporda belgelenmiştir.
