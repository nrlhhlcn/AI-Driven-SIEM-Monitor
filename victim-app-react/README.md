# CorpBank Victim Site

SIEM sistemini test etmek için tasarlanmış bir "kurban site" uygulaması. Bu site, çeşitli güvenlik olaylarını simüle eder ve SIEM backend'ine log gönderir.

## Özellikler

### 🔐 Login Sayfası (`/login`)
- **Brute Force Tespiti**: `root` kullanıcı adı ile giriş denemeleri yüksek seviye alarm tetikler
- **SQL Injection Tespiti**: SQL injection pattern'leri tespit edilir ve kritik alarm gönderilir
- **Başarılı/Başarısız Giriş**: Her giriş denemesi loglanır
- **Doğru Bilgiler**: `admin` / `123456`

### 👨‍💼 Admin Paneli (`/admin`)
- **Yetkisiz Erişim Tespiti**: Giriş yapmadan erişim denemeleri loglanır
- **Kritik Alarm**: 3+ yetkisiz erişim denemesi kritik alarm tetikler
- Sistem metrikleri ve log görüntüleme

### 📤 Dosya Yükleme (`/upload`)
- **Şüpheli Dosya Tespiti**: `.exe`, `.php`, `.sh`, `.bat` gibi dosyalar tespit edilir
- **Malware Detection**: Şüpheli dosya tipleri yüksek seviye alarm tetikler
- Normal dosya yüklemeleri info seviyesinde loglanır

### 🔌 API Test Konsolu (`/api`)
- **API Abuse Tespiti**: 10+ istek gönderilirse rate limit uyarısı
- **Geçersiz API Key**: Yanlış API key kullanımı loglanır
- **Hassas Endpoint Erişimi**: DELETE ve PUT metodları yüksek seviye alarm
- **Geçerli API Key**: `valid-api-key-123`

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run dev
```

Site `http://localhost:5173` adresinde çalışacaktır.

## SIEM Backend Entegrasyonu

Tüm olaylar otomatik olarak `http://localhost:3001/api/logs` adresine gönderilir.

### Gönderilen Olay Tipleri

- `BRUTE_FORCE` - Brute force saldırıları
- `SQL_INJECTION` - SQL injection denemeleri
- `LOGIN_SUCCESS` - Başarılı girişler
- `AUTH_FAIL` - Başarısız giriş denemeleri
- `UNAUTHORIZED_ACCESS` - Yetkisiz erişim denemeleri
- `FILE_UPLOAD` - Dosya yükleme olayları
- `WEB_TRAFFIC` - Normal web trafiği
- `API_REQUEST` - API istekleri
- `API_ABUSE` - API kötüye kullanımı
- `INVALID_API_KEY` - Geçersiz API key kullanımı
- `SENSITIVE_API_ACCESS` - Hassas API endpoint erişimi

## Test Senaryoları

### 1. Brute Force Testi
- Login sayfasına git
- Kullanıcı adı: `root`, şifre: herhangi bir şey
- Yüksek seviye alarm tetiklenir

### 2. SQL Injection Testi
- Login sayfasına git
- Kullanıcı adı: `admin' OR '1'='1`, şifre: herhangi bir şey
- Kritik seviye alarm tetiklenir

### 3. Yetkisiz Erişim Testi
- Direkt `/admin` adresine git (giriş yapmadan)
- 3+ deneme sonrası kritik alarm tetiklenir

### 4. Malware Upload Testi
- Upload sayfasına git
- `.exe` veya `.php` dosyası yükle
- Yüksek seviye alarm tetiklenir

### 5. API Abuse Testi
- API sayfasına git
- 10+ istek gönder
- Rate limit uyarısı tetiklenir

## Teknolojiler

- React 19
- Vite
- Tailwind CSS
- Font Awesome Icons
