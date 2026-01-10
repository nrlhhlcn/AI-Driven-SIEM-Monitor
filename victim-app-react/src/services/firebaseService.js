import { collection, addDoc, Timestamp, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firebase'e event kaydeder
 */
export const saveEventToFirebase = async (eventData) => {
  try {
    // SIEM database kullan - siem_events collection'ına kaydet
    const docRef = await addDoc(collection(db, 'siem_events'), {
      ...eventData,
      createdAt: Timestamp.now(),
      receivedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    // Firebase permissions hatası için daha açıklayıcı mesaj
    if (error.code === 'permission-denied') {
      console.error('Firebase izin hatası: Firestore Security Rules güncellenmeli!');
      console.error('Lütfen FIREBASE_SETUP.md dosyasındaki adımları takip edin.');
    } else {
      console.error('Firebase event kaydetme hatası:', error);
    }
    // Hata fırlatma, sadece logla (site çalışmaya devam etsin)
  }
};

/**
 * Kullanıcı istatistiklerini günceller (giriş sayısı)
 */
export const updateUserStats = async (username, success) => {
  try {
    if (!success) return; // Sadece başarılı girişlerde say
    
    const userStatsRef = doc(db, 'siem_user_stats', username);
    const userStatsSnap = await getDoc(userStatsRef);
    
    if (userStatsSnap.exists()) {
      // Mevcut kullanıcı - login count'u artır
      await setDoc(userStatsRef, {
        loginCount: increment(1),
        lastLogin: Timestamp.now(),
        username: username,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } else {
      // Yeni kullanıcı - ilk giriş
      await setDoc(userStatsRef, {
        username: username,
        loginCount: 1,
        firstLogin: Timestamp.now(),
        lastLogin: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.warn('Kullanıcı istatistikleri güncellenemedi:', error);
  }
};

/**
 * Alarm oluşturur (siem_alarms collection'ına)
 */
export const createAlarm = async (alarmData) => {
  try {
    const docRef = await addDoc(collection(db, 'siem_alarms'), {
      ...alarmData,
      status: 'open',
      createdAt: Timestamp.now(),
      detectedAt: Timestamp.now(),
    });
    console.log('✅ Alarm oluşturuldu:', alarmData.type, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Alarm oluşturma hatası:', error);
    return null;
  }
};

/**
 * Login event'ini Firebase'e kaydeder
 */
export const logLoginEvent = async (username, success, eventType, severity) => {
  // Event başlığını belirle
  let title = success 
    ? `Başarılı giriş: ${username}`
    : `Başarısız giriş denemesi: ${username}`;
  
  // SQL Injection için özel başlık
  if (eventType === 'SQL_INJECTION') {
    title = `SQL Injection denemesi tespit edildi: "${username.substring(0, 50)}..."`;
  }

  const eventData = {
    type: eventType,
    title: title,
    severity: severity,
    category: 'Auth',
    sourceIP: '127.0.0.1', // Client-side'da gerçek IP almak zor
    destIP: window.location.hostname,
    username: username,
    success: success,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  };

  // Event'i kaydet
  await saveEventToFirebase(eventData);
  
  // Kritik eventler için alarm oluştur (SQL_INJECTION, BRUTE_FORCE)
  if (eventType === 'SQL_INJECTION' || eventType === 'BRUTE_FORCE') {
    await createAlarm({
      type: eventType,
      title: eventType === 'SQL_INJECTION' 
        ? `SQL Injection Tespit Edildi` 
        : `Brute Force Saldırısı Tespit Edildi`,
      description: title,
      severity: severity,
      sourceIP: '127.0.0.1',
    });
  }
  
  // Başarılı girişse kullanıcı istatistiklerini güncelle
  if (success && eventType === 'LOGIN_SUCCESS') {
    await updateUserStats(username, true);
  }
  
  return true;
};

/**
 * Web trafiği event'ini Firebase'e kaydeder
 */
export const logWebTraffic = async (path) => {
  return await saveEventToFirebase({
    type: 'WEB_TRAFFIC',
    title: `Web trafiği: ${path}`,
    severity: 'info',
    category: 'Web',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    path: path,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * Dosya yükleme event'ini Firebase'e kaydeder
 */
export const logFileUpload = async (filename, fileType) => {
  const isSuspicious = fileType.includes('exe') || fileType.includes('php') || 
                       filename.toLowerCase().endsWith('.exe') || 
                       filename.toLowerCase().endsWith('.php');
  
  return await saveEventToFirebase({
    type: 'FILE_UPLOAD',
    title: `Dosya yükleme: ${filename} (${fileType})`,
    severity: isSuspicious ? 'high' : 'info',
    category: 'Web',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    filename: filename,
    fileType: fileType,
    suspicious: isSuspicious,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * Yetkisiz erişim event'ini Firebase'e kaydeder
 */
export const logUnauthorizedAccess = async (path) => {
  return await saveEventToFirebase({
    type: 'UNAUTHORIZED_ACCESS',
    title: `Yetkisiz erişim denemesi: ${path}`,
    severity: 'high',
    category: 'System',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    path: path,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * API isteği event'ini Firebase'e kaydeder
 */
export const logApiRequest = async (method, endpoint, apiKey, severity = 'info') => {
  return await saveEventToFirebase({
    type: 'API_REQUEST',
    title: `API isteği: ${method} ${endpoint}`,
    severity: severity,
    category: 'Web',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    method: method,
    endpoint: endpoint,
    apiKey: apiKey ? 'provided' : 'none',
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * API kötüye kullanımı event'ini Firebase'e kaydeder
 */
export const logApiAbuse = async (requestCount, endpoint, method) => {
  return await saveEventToFirebase({
    type: 'API_ABUSE',
    title: `API kötüye kullanımı tespit edildi: ${requestCount} istek`,
    severity: 'high',
    category: 'Web',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    endpoint: endpoint,
    method: method,
    requestCount: requestCount,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * Geçersiz API key event'ini Firebase'e kaydeder
 */
export const logInvalidApiKey = async (apiKey, endpoint, method) => {
  return await saveEventToFirebase({
    type: 'INVALID_API_KEY',
    title: `Geçersiz API key kullanımı: ${apiKey.substring(0, 10)}...`,
    severity: 'medium',
    category: 'Auth',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    endpoint: endpoint,
    method: method,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * Hassas API erişimi event'ini Firebase'e kaydeder
 */
export const logSensitiveApiAccess = async (method, endpoint) => {
  return await saveEventToFirebase({
    type: 'SENSITIVE_API_ACCESS',
    title: `Hassas API endpoint erişimi: ${method} ${endpoint}`,
    severity: 'high',
    category: 'System',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    method: method,
    endpoint: endpoint,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

/**
 * Çıkış yapma event'ini Firebase'e kaydeder
 */
export const logLogoutEvent = async (email) => {
  return await saveEventToFirebase({
    type: 'LOGOUT',
    title: `Çıkış yapıldı: ${email}`,
    severity: 'info',
    category: 'Auth',
    sourceIP: '127.0.0.1',
    destIP: window.location.hostname,
    username: email,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  });
};

