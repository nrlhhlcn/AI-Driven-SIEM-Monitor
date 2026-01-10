# AI-Driven-SIEM-Monitor

**Proje #3: Event-Driven Akıllı Bildirim ve İzleme Sistemi**

Bu proje, BİL440 YZ Destekli Yazılım Geliştirme dersi final projesi kapsamında geliştirilmiştir. Sistem, olay tabanlı (event-driven) bir mimari ile çalışan, yapay zeka destekli güvenlik izleme ve bildirim sistemidir.

## 🎯 Proje Özeti

Sistem, güvenlik olaylarını gerçek zamanlı olarak izler, anormal durumları tespit eder ve yapay zeka destekli öneriler sunar. Kullanıcılar özel kurallar tanımlayabilir ve sistem bu kurallara göre otomatik alarmlar üretir.

### Temel Özellikler

- ✅ **Olay (Event) Tanımlama**: Kullanıcılar güvenlik olaylarını tanımlayabilir
- ✅ **Tetikleyici Kurallar**: Olaylara bağlı özelleştirilebilir kurallar oluşturma
- ✅ **Otomatik Bildirimler**: Kurallar gerçekleştiğinde otomatik alarm üretimi
- ✅ **Anormal Durum Tespiti**: 6 farklı anomali tespit algoritması
  - Brute Force Saldırıları
  - SQL Injection Denemeleri
  - Anormal Giriş Saatleri
  - Trafik Artışları
  - Coğrafi Anomaliler
  - API Rate Limit Aşımı
- ✅ **AI Destekli Öneriler**: 
  - Eşik değeri optimizasyonu
  - IP engelleme önerileri
  - Bildirim azaltma önerileri
  - 2FA aktivasyon önerileri
- ✅ **Real-time İzleme**: Firebase Firestore ile gerçek zamanlı veri akışı
- ✅ **Web Tabanlı Dashboard**: Modern React arayüzü

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

### Frontend Kurulumu

```bash
cd siem-monitor
npm install
npm run dev
```

### Backend Kurulumu

```bash
cd SIEM-Monitor-Backend
dotnet restore
dotnet run --project src/SiemMonitor.API
```

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
- ✅ Anomali tespit fonksiyonları (6 farklı algoritma)
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

## 📊 Test Sonuçları

Testler çalıştırıldığında aşağıdaki kategorilerde testler bulunur:

1. **Anomali Tespit Fonksiyonları** (30+ test)
   - Brute Force Detection
   - SQL Injection Detection
   - Traffic Spike Detection
   - Geo Anomaly Detection
   - API Abuse Detection
   - Abnormal Login Time Detection

2. **AI Öneri Sistemleri** (8+ test)
   - Threshold Recommendations
   - IP Block Recommendations
   - Notification Reduction
   - User Security Recommendations

3. **Edge Cases** (5+ test)
   - Null/undefined handling
   - Missing configuration
   - Large data sets
   - Concurrent operations

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

### 1. Event Gönderme

Victim app üzerinden güvenlik olayları gönderilir:

```javascript
import { logEvent } from './services/siemLogger';

// Brute Force tespiti
logEvent.bruteForce('username');

// SQL Injection tespiti
logEvent.sqlInjection("admin' OR '1'='1");

// Başarılı giriş
logEvent.loginSuccess('username');
```

### 2. Kural Tanımlama

Settings sayfasından yeni tespit kuralları eklenebilir:

- Event Tipi seçimi
- Eşik değeri belirleme
- Zaman aralığı ayarlama
- Önem derecesi seçimi

### 3. AI Önerilerini İnceleme

Dashboard'da AI destekli öneriler görüntülenir:
- Eşik değeri optimizasyonları
- IP engelleme önerileri
- Bildirim azaltma önerileri

## 🔒 Güvenlik

- Firebase Security Rules ile veri erişim kontrolü
- API key tabanlı authentication
- Rate limiting koruması
- SQL Injection koruması

## 📈 Geliştirme Notları

### AI Kullanımı

Bu projede aşağıdaki YZ araçları kullanılmıştır:

- **GitHub Copilot**: Component geliştirme ve kod tamamlama
- **Claude Code**: Test yazımı ve algoritma geliştirme
- **Cursor AI**: Kod refactoring ve optimizasyon

Detaylı AI kullanım logu için `AI_DECISION_LOG.md` dosyasına bakınız.

### Commit Etiketleri

- `[AI-generated]`: Tamamen AI tarafından üretilen kod
- `[AI-assisted]`: AI yardımı ile yazılan kod
- `[Human-written]`: İnsan tarafından yazılan kod

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👥 Geliştiriciler

- Final Proje - BİL440
- 2025-26 Güz Dönemi

## 📚 Referanslar

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vitest Documentation](https://vitest.dev)

---

**Not**: Bu proje, yapay zeka kod asistanları kullanılarak geliştirilmiştir. Detaylı AI kullanım logu ve karar süreçleri teknik raporda belgelenmiştir.
