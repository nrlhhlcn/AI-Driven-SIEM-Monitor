# Firebase Kurulum ve Security Rules

## 🔥 Firebase Security Rules Güncelleme

Firebase'de "Missing or insufficient permissions" hatası alıyorsanız, Firestore Security Rules'ları güncellemeniz gerekiyor.

### Adımlar:

1. **Firebase Console'a Git**
   - https://console.firebase.google.com/
   - Projenizi seçin: `portfoy-de9a0`

2. **Firestore Database'e Git**
   - Sol menüden "Firestore Database" seçin
   - "Rules" sekmesine tıklayın

3. **Security Rules'ı Güncelle**
   - Aşağıdaki rules'ı yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // SIEM Events - Herkes yazabilir, okuyabilir (Development için)
    match /siem_events/{eventId} {
      allow read, write: if true;
    }
    
    // SIEM Alarms
    match /siem_alarms/{alarmId} {
      allow read, write: if true;
    }
    
    // SIEM Threat Intelligence
    match /siem_threat_intelligence/{threatId} {
      allow read, write: if true;
    }
    
    // SIEM User Stats - Kullanıcı giriş istatistikleri
    match /siem_user_stats/{userId} {
      allow read, write: if true;
    }
    
    // Diğer collection'lar için varsayılan kural
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **"Publish" Butonuna Tıklayın**
   - Rules'ları kaydedin

## ⚠️ Önemli Notlar

- **Development için:** Yukarıdaki rules tüm erişime izin verir (`if true`)
- **Production için:** Authentication kontrolü eklemelisiniz:

```javascript
// Production örneği
match /siem_events/{eventId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.token.admin == true;
}
```

## 🔧 Alternatif: Firebase CLI ile

Eğer Firebase CLI kuruluysa:

```bash
firebase deploy --only firestore:rules
```

## 📝 Hata Çözümü

"Missing or insufficient permissions" hatası alıyorsanız:
1. Firebase Console'da Rules'ları güncelleyin
2. Tarayıcıyı yenileyin
3. Tekrar deneyin

