# Firebase Kullanıcı Ekleme Rehberi

Bu rehber, Demo Bakırçay Üniversitesi uygulamasına Firebase Authentication üzerinden kullanıcı ekleme işlemini açıklar.

## 📋 Eklenecek Kullanıcılar

- `admin@bakircay.edu.tr` / `Admin123!`
- `ogrenci@bakircay.edu.tr` / `Ogrenci123!`
- `personel@bakircay.edu.tr` / `Personel123!`
- `hoca@bakircay.edu.tr` / `Hoca123!`

## 🚀 Yöntem 1: Browser Console'dan (Önerilen)

### Adımlar:

1. **Victim uygulamasını çalıştırın:**
   ```bash
   cd victim-app-react
   npm run dev
   ```

2. **Login sayfasını açın** (genellikle `http://localhost:5173/login`)

3. **Browser Console'u açın:**
   - Chrome/Edge: `F12` veya `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` veya `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

4. **Console'da şu komutu çalıştırın:**
   ```javascript
   window.addUsersToFirebase()
   ```

5. **Sonuçları kontrol edin:**
   - Console'da her kullanıcı için başarı/hata mesajları görünecek
   - ✅ işareti = Kullanıcı başarıyla eklendi
   - ❌ işareti = Hata oluştu (genellikle kullanıcı zaten mevcut)

### Örnek Çıktı:
```
🚀 Firebase'e kullanıcı ekleme başlatılıyor...

✅ admin@bakircay.edu.tr başarıyla eklendi (UID: abc123...)
✅ ogrenci@bakircay.edu.tr başarıyla eklendi (UID: def456...)
❌ personel@bakircay.edu.tr eklenirken hata: Bu e-posta zaten kayıtlı
✅ hoca@bakircay.edu.tr başarıyla eklendi (UID: ghi789...)

📊 Özet:
✅ Başarılı: 3
❌ Hatalı: 1
```

## 🔧 Yöntem 2: Firebase Console'dan (Manuel)

### Adımlar:

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com/
   - Projenizi seçin (`portfoy-de9a0`)

2. **Authentication'a gidin:**
   - Sol menüden `Authentication` > `Users` seçin

3. **Kullanıcı ekleyin:**
   - `Add user` butonuna tıklayın
   - Email ve şifre girin
   - `Add user` butonuna tıklayın

4. **Her kullanıcı için tekrarlayın**

## ⚠️ Önemli Notlar

- **Email zaten kayıtlıysa:** Hata alırsınız ama bu normaldir. Kullanıcı zaten mevcut demektir.
- **Şifre gereksinimleri:** Firebase en az 6 karakter ister. Script'teki şifreler bu gereksinimi karşılar.
- **Rate Limiting:** Firebase çok fazla istek gönderirseniz geçici olarak engelleyebilir. Script her kullanıcı arasında 500ms bekler.

## 🧪 Test Etme

Kullanıcıları ekledikten sonra:

1. Login sayfasına gidin
2. Test kullanıcılarından biriyle giriş yapmayı deneyin:
   - Email: `admin@bakircay.edu.tr`
   - Şifre: `Admin123!`
3. Başarılı giriş yapabilmelisiniz

## 🔍 Sorun Giderme

### "window.addUsersToFirebase is not a function" hatası
- Login sayfasının yüklendiğinden emin olun
- Sayfayı yenileyin (F5)
- Console'da `window.addUsersToFirebase` yazıp fonksiyonun tanımlı olup olmadığını kontrol edin

### "Firebase: Error (auth/email-already-in-use)"
- Bu normal bir durumdur, kullanıcı zaten mevcut demektir
- Firebase Console'dan kontrol edebilirsiniz

### "Firebase: Error (auth/network-request-failed)"
- İnternet bağlantınızı kontrol edin
- Firebase projenizin aktif olduğundan emin olun

## 📝 Script'i Özelleştirme

Kullanıcı listesini değiştirmek için `src/scripts/addUsers.js` dosyasını düzenleyin:

```javascript
const users = [
  { email: 'yeni@bakircay.edu.tr', password: 'YeniSifre123!' },
  // Daha fazla kullanıcı ekleyebilirsiniz
];
```
