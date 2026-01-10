/**
 * Firebase Authentication'a kullanıcı ekleme scripti
 * 
 * Kullanım:
 * 1. Bu dosyayı çalıştırmak için: node src/scripts/addUsers.js
 * 2. Veya browser console'da çalıştır
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Eklenecek kullanıcılar
const users = [
  { email: 'admin@corpbank.com', password: 'Admin123!' },
  { email: 'analyst@corpbank.com', password: 'Analyst123!' },
  { email: 'security@corpbank.com', password: 'Security123!' },
  { email: 'monitor@corpbank.com', password: 'Monitor123!' },
];

/**
 * Kullanıcıları Firebase Authentication'a ekler
 */
export const addUsersToFirebase = async () => {
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
      console.log(`✅ ${user.email} başarıyla eklendi`);
    } catch (error) {
      results.push({
        email: user.email,
        status: 'error',
        error: error.message
      });
      console.error(`❌ ${user.email} eklenirken hata:`, error.message);
    }
  }

  return results;
};

// Browser console'dan çalıştırmak için
if (typeof window !== 'undefined') {
  window.addUsersToFirebase = addUsersToFirebase;
}

export default addUsersToFirebase;

