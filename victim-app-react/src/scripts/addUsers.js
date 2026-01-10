/**
 * Firebase Authentication'a kullanıcı ekleme scripti
 * 
 * Kullanım:
 * 1. Browser Console'dan: 
 *    - Login sayfasını aç
 *    - F12 > Console
 *    - window.addUsersToFirebase() yaz ve Enter'a bas
 * 
 * 2. Veya bu dosyayı import edip kullan:
 *    import { addUsersToFirebase } from './scripts/addUsers';
 *    addUsersToFirebase();
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Eklenecek kullanıcılar - Demo Bakırçay Üniversitesi
const users = [
  { email: 'admin@bakircay.edu.tr', password: 'Admin123!' },
  { email: 'ogrenci@bakircay.edu.tr', password: 'Ogrenci123!' },
  { email: 'personel@bakircay.edu.tr', password: 'Personel123!' },
  { email: 'hoca@bakircay.edu.tr', password: 'Hoca123!' },
];

/**
 * Kullanıcıları Firebase Authentication'a ekler
 */
export const addUsersToFirebase = async () => {
  console.log('🚀 Firebase\'e kullanıcı ekleme başlatılıyor...\n');
  const results = [];

  for (const user of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      results.push({
        email: user.email,
        status: 'success',
        uid: userCredential.user.uid
      });
      console.log(`✅ ${user.email} başarıyla eklendi (UID: ${userCredential.user.uid})`);
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta zaten kayıtlı';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf (en az 6 karakter)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta formatı';
      }
      
      results.push({
        email: user.email,
        status: 'error',
        error: errorMessage
      });
      console.error(`❌ ${user.email} eklenirken hata: ${errorMessage}`);
    }
    
    // Her kullanıcı arasında kısa bir bekleme (rate limit önlemi)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Özet:');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log(`\n📋 Detaylı sonuçlar:`, results);

  return results;
};

// Browser console'dan çalıştırmak için global fonksiyon
if (typeof window !== 'undefined') {
  window.addUsersToFirebase = addUsersToFirebase;
  console.log('💡 Kullanım: window.addUsersToFirebase() yazarak kullanıcıları ekleyebilirsiniz.');
}

export default addUsersToFirebase;
