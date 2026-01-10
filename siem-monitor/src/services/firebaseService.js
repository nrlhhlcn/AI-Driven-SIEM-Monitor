// Firebase servisleri için yardımcı fonksiyonlar
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections - SIEM Database
// Tüm collection'lar "siem" prefix'i ile
const COLLECTIONS = {
  EVENTS: 'siem_events',
  ALARMS: 'siem_alarms',
  THREAT_INTELLIGENCE: 'siem_threat_intelligence',
  NETWORK_TRAFFIC: 'siem_network_traffic',
  SYSTEM_METRICS: 'siem_system_metrics',
  IP_BLOCKS: 'siem_ip_blocks',
  USER_STATS: 'siem_user_stats',
};

/**
 * Yeni bir event kaydı ekler
 */
export const addEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      ...eventData,
      createdAt: Timestamp.now(),
      receivedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Event ekleme hatası:', error);
    throw error;
  }
};

/**
 * Son N event'i getirir
 */
export const getRecentEvents = async (count = 50) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Event getirme hatası:', error);
    throw error;
  }
};

/**
 * Real-time event dinleyicisi
 */
export const subscribeToEvents = (callback, count = 50) => {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
};

/**
 * Severity'ye göre event filtreleme
 */
export const getEventsBySeverity = async (severity) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      where('severity', '==', severity),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Event filtreleme hatası:', error);
    throw error;
  }
};

/**
 * Yeni alarm ekler
 */
export const addAlarm = async (alarmData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ALARMS), {
      ...alarmData,
      status: 'open',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Alarm ekleme hatası:', error);
    throw error;
  }
};

/**
 * Threat intelligence kaydı ekler/günceller
 */
export const updateThreatIntelligence = async (ipData) => {
  try {
    // IP'ye göre mevcut kaydı kontrol et
    const q = query(
      collection(db, COLLECTIONS.THREAT_INTELLIGENCE),
      where('sourceIP', '==', ipData.sourceIP)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Yeni kayıt
      await addDoc(collection(db, COLLECTIONS.THREAT_INTELLIGENCE), {
        ...ipData,
        attackCount: 1,
        lastSeen: Timestamp.now(),
      });
    } else {
      // Mevcut kaydı güncelle (bu örnekte sadece ekleme yapıyoruz)
      // Güncelleme için updateDoc kullanılabilir
      console.log('IP zaten kayıtlı:', ipData.sourceIP);
    }
  } catch (error) {
    console.error('Threat intelligence hatası:', error);
    throw error;
  }
};

/**
 * Sistem metrikleri ekler
 */
export const addSystemMetrics = async (metrics) => {
  try {
    await addDoc(collection(db, COLLECTIONS.SYSTEM_METRICS), {
      ...metrics,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Sistem metrikleri ekleme hatası:', error);
    throw error;
  }
};

/**
 * IP engelleme ekler
 */
export const blockIP = async (ipData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.IP_BLOCKS), {
      ...ipData,
      isActive: true,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('IP engelleme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcı istatistiklerini getirir
 */
export const getUserStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USER_STATS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      username: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Kullanıcı istatistikleri getirme hatası:', error);
    throw error;
  }
};

/**
 * Belirli bir kullanıcının istatistiklerini getirir
 */
export const getUserStatByUsername = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USER_STATS, username));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        username: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı istatistiği getirme hatası:', error);
    throw error;
  }
};

/**
 * Real-time kullanıcı istatistikleri dinleyicisi
 */
export const subscribeToUserStats = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.USER_STATS), (snapshot) => {
    const stats = snapshot.docs.map(doc => ({
      id: doc.id,
      username: doc.id,
      ...doc.data()
    }));
    callback(stats);
  });
};

/**
 * Brute Force saldırısı tespit eder
 * @param {Array} events - Event listesi
 * @param {Object} config - Kural konfigürasyonu { threshold: number, timeWindow: number, timeUnit: string }
 */
export const detectBruteForce = (events, config = {}) => {
  // Null/undefined kontrolü
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  // Varsayılan değerler (Firebase'den gelmezse)
  const threshold = config.threshold || 5;
  const timeWindow = config.timeWindow || 3;
  const timeUnit = config.timeUnit || 'minutes';
  
  // Zaman aralığını milisaniyeye çevir
  let timeWindowMs;
  switch (timeUnit) {
    case 'seconds':
      timeWindowMs = timeWindow * 1000;
      break;
    case 'hours':
      timeWindowMs = timeWindow * 60 * 60 * 1000;
      break;
    case 'minutes':
    default:
      timeWindowMs = timeWindow * 60 * 1000;
  }
  
  const now = Date.now();
  const cutoffTime = now - timeWindowMs;
  
  // Belirlenen süre içindeki başarısız giriş denemelerini filtrele
  const recentAuthFails = events.filter(event => {
    if (event.type !== 'AUTH_FAIL' && event.type !== 'BRUTE_FORCE') return false;
    if (!event.createdAt) return false;
    
    const eventDate = event.createdAt?.toDate 
      ? event.createdAt.toDate().getTime()
      : event.createdAt?.seconds 
      ? event.createdAt.seconds * 1000
      : new Date(event.createdAt).getTime();
    
    return eventDate >= cutoffTime;
  });
  
  // IP adreslerine göre grupla
  const ipGroups = {};
  recentAuthFails.forEach(event => {
    const ip = event.sourceIP || '127.0.0.1';
    if (!ipGroups[ip]) {
      ipGroups[ip] = [];
    }
    ipGroups[ip].push(event);
  });
  
  // Her IP için eşik kontrolü yap
  const bruteForceAlerts = [];
  Object.keys(ipGroups).forEach(ip => {
    const failedAttempts = ipGroups[ip];
    if (failedAttempts.length >= threshold) {
      bruteForceAlerts.push({
        ip: ip,
        attempts: failedAttempts.length,
        threshold: threshold,
        timeWindow: timeWindow,
        timeUnit: timeUnit,
        firstAttempt: failedAttempts[0].createdAt?.toDate 
          ? failedAttempts[0].createdAt.toDate()
          : failedAttempts[0].createdAt?.seconds 
          ? new Date(failedAttempts[0].createdAt.seconds * 1000)
          : new Date(),
        lastAttempt: failedAttempts[failedAttempts.length - 1].createdAt?.toDate 
          ? failedAttempts[failedAttempts.length - 1].createdAt.toDate()
          : failedAttempts[failedAttempts.length - 1].createdAt?.seconds 
          ? new Date(failedAttempts[failedAttempts.length - 1].createdAt.seconds * 1000)
          : new Date(),
      });
    }
  });
  
  return bruteForceAlerts;
};

/**
 * Brute Force alarmını Firebase'e kaydeder
 */
// Son oluşturulan alarmları takip et (spam önleme)
const recentAlarmCache = new Map();

export const createBruteForceAlarm = async (ip, attempts) => {
  try {
    // Local cache ile spam kontrolü (5 dakika)
    const cacheKey = `BRUTE_FORCE_${ip}`;
    const lastAlarmTime = recentAlarmCache.get(cacheKey);
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    if (lastAlarmTime && lastAlarmTime >= fiveMinutesAgo) {
      console.log('Alarm zaten yakın zamanda oluşturuldu, atlanıyor:', ip);
      return null; // Zaten yakın zamanda alarm var
    }
    
    // Yeni alarm oluştur
    const alarmData = {
      type: 'BRUTE_FORCE',
      title: `Brute Force Saldırısı Tespit Edildi: ${ip}`,
      description: `${ip} IP adresinden 3 dakika içinde ${attempts} başarısız giriş denemesi yapıldı. Bu bir brute force saldırısı olabilir.`,
      severity: 'critical',
      sourceIP: ip,
      status: 'open',
      attempts: attempts,
      createdAt: Timestamp.now(),
      detectedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ALARMS), alarmData);
    
    // Cache'i güncelle
    recentAlarmCache.set(cacheKey, now);
    
    console.log('✅ Brute Force alarmı oluşturuldu:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Brute Force alarm oluşturma hatası:', error);
    return null;
  }
};

// ============================================
// ANORMALLIK TESPİT SİSTEMİ
// ============================================

/**
 * Event timestamp'ini Date nesnesine çevirir
 */
const getEventDate = (event) => {
  if (!event.createdAt) return new Date();
  return event.createdAt?.toDate 
    ? event.createdAt.toDate()
    : event.createdAt?.seconds 
    ? new Date(event.createdAt.seconds * 1000)
    : new Date(event.createdAt);
};

/**
 * Anormal Giriş Saati Tespiti (00:00 - 06:00 arası girişler)
 */
/**
 * Anormal Giriş Saati Tespiti
 * @param {Array} events - Event listesi
 * @param {Object} config - { timeWindow: number (saat başlangıcı) }
 */
export const detectAbnormalLoginTime = (events, config = {}) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const abnormalLogins = [];
  const endHour = config.timeWindow || 6; // Varsayılan: 00:00 - 06:00 arası şüpheli
  
  events.forEach(event => {
    if (event.type !== 'LOGIN_SUCCESS') return;
    
    const eventDate = getEventDate(event);
    const hour = eventDate.getHours();
    
    // 00:00 - endHour arası şüpheli
    if (hour >= 0 && hour < endHour) {
      abnormalLogins.push({
        type: 'ABNORMAL_LOGIN_TIME',
        username: event.username || 'Bilinmiyor',
        ip: event.sourceIP || '127.0.0.1',
        time: eventDate,
        hour: hour,
        severity: config.severity || 'medium',
        message: `${event.username || 'Bilinmiyor'} kullanıcısı saat ${hour.toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}'de giriş yaptı (anormal saat: 00:00-${endHour.toString().padStart(2, '0')}:00).`
      });
    }
  });
  
  return abnormalLogins;
};

/**
 * SQL Injection Pattern Tespiti
 */
export const detectSQLInjection = (events) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const sqlPatterns = [
    /('|"|;|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi,
    /(\b1\s*=\s*1\b|\b1\s*=\s*'1'\b)/gi,
    /(CONCAT|CHAR|HEX|UNHEX)/gi
  ];
  
  const sqlInjections = [];
  
  events.forEach(event => {
    if (event.type !== 'SQL_INJECTION' && event.type !== 'AUTH_FAIL') return;
    
    const username = event.username || '';
    const isSQLInjection = sqlPatterns.some(pattern => pattern.test(username));
    
    if (event.type === 'SQL_INJECTION' || isSQLInjection) {
      sqlInjections.push({
        type: 'SQL_INJECTION',
        ip: event.sourceIP || '127.0.0.1',
        input: username,
        time: getEventDate(event),
        severity: 'critical',
        message: `SQL Injection denemesi tespit edildi: "${username.substring(0, 50)}..."`
      });
    }
  });
  
  return sqlInjections;
};

/**
 * Ani Trafik Artışı Tespiti (1 dakikada normalin 3 katı)
 */
/**
 * Ani Trafik Artışı Tespiti
 * @param {Array} events - Event listesi
 * @param {Object} config - { threshold: number (kat sayısı), timeWindow: number (dakika) }
 */
export const detectTrafficSpike = (events, config = {}) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const multiplierThreshold = config.threshold || 3; // Varsayılan: 3x artış
  const timeWindow = config.timeWindow || 5; // Varsayılan: 5 dakikalık pencere
  
  const now = Date.now();
  const oneMinuteAgo = now - (60 * 1000);
  const windowStart = now - (timeWindow * 60 * 1000);
  
  // Son 1 dakikadaki event sayısı
  const lastMinuteEvents = events.filter(event => {
    const eventTime = getEventDate(event).getTime();
    return eventTime >= oneMinuteAgo;
  });
  
  // Belirlenen penceredeki ortalama (son 1 dakika hariç)
  const previousEvents = events.filter(event => {
    const eventTime = getEventDate(event).getTime();
    return eventTime >= windowStart && eventTime < oneMinuteAgo;
  });
  
  const avgPerMinute = previousEvents.length / (timeWindow - 1);
  const currentRate = lastMinuteEvents.length;
  
  const spikes = [];
  
  // Eğer belirlenen eşiğin üzerindeyse
  if (avgPerMinute > 0 && currentRate > avgPerMinute * multiplierThreshold && currentRate > 10) {
    spikes.push({
      type: 'TRAFFIC_SPIKE',
      currentRate: currentRate,
      averageRate: Math.round(avgPerMinute),
      multiplier: Math.round(currentRate / avgPerMinute * 10) / 10,
      threshold: multiplierThreshold,
      time: new Date(),
      severity: config.severity || 'high',
      message: `Ani trafik artışı: ${currentRate} event/dk (normal: ${Math.round(avgPerMinute)}/dk, ${Math.round(currentRate / avgPerMinute)}x artış, eşik: ${multiplierThreshold}x)`
    });
  }
  
  return spikes;
};

/**
 * Aynı Kullanıcı Farklı IP Tespiti (Coğrafi Anomali)
 */
/**
 * Coğrafi Anomali Tespiti (Aynı kullanıcı farklı IP)
 * @param {Array} events - Event listesi
 * @param {Object} config - { threshold: number (IP sayısı), timeWindow: number (dakika) }
 */
export const detectGeoAnomaly = (events, config = {}) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const ipThreshold = config.threshold || 2; // Varsayılan: 2+ farklı IP
  const timeWindow = config.timeWindow || 10; // Varsayılan: 10 dakika
  
  const now = Date.now();
  const cutoffTime = now - (timeWindow * 60 * 1000);
  
  // Belirlenen süre içindeki başarılı girişleri kullanıcıya göre grupla
  const userLogins = {};
  
  events.forEach(event => {
    if (event.type !== 'LOGIN_SUCCESS') return;
    const eventTime = getEventDate(event).getTime();
    if (eventTime < cutoffTime) return;
    
    const username = event.username;
    if (!username) return;
    
    if (!userLogins[username]) {
      userLogins[username] = [];
    }
    userLogins[username].push({
      ip: event.sourceIP || '127.0.0.1',
      time: getEventDate(event)
    });
  });
  
  const anomalies = [];
  
  // Her kullanıcı için farklı IP kontrolü
  Object.keys(userLogins).forEach(username => {
    const logins = userLogins[username];
    const uniqueIPs = [...new Set(logins.map(l => l.ip))];
    
    if (uniqueIPs.length >= ipThreshold) {
      anomalies.push({
        type: 'GEO_ANOMALY',
        username: username,
        ips: uniqueIPs,
        loginCount: logins.length,
        threshold: ipThreshold,
        timeWindow: timeWindow,
        time: new Date(),
        severity: config.severity || 'high',
        message: `${username} kullanıcısı ${timeWindow} dakika içinde ${uniqueIPs.length} farklı IP'den giriş yaptı: ${uniqueIPs.join(', ')} (eşik: ${ipThreshold})`
      });
    }
  });
  
  return anomalies;
};

/**
 * API Rate Limit Aşımı Tespiti
 * @param {Array} events - Event listesi
 * @param {Object} config - { threshold: number, timeWindow: number, timeUnit: string }
 */
export const detectAPIAbuse = (events, config = {}) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const threshold = config.threshold || 100;
  const timeWindow = config.timeWindow || 1;
  const timeUnit = config.timeUnit || 'minutes';
  
  // Zaman aralığını milisaniyeye çevir
  let timeWindowMs;
  switch (timeUnit) {
    case 'seconds':
      timeWindowMs = timeWindow * 1000;
      break;
    case 'hours':
      timeWindowMs = timeWindow * 60 * 60 * 1000;
      break;
    case 'minutes':
    default:
      timeWindowMs = timeWindow * 60 * 1000;
  }
  
  const now = Date.now();
  const cutoffTime = now - timeWindowMs;
  
  // Belirlenen süre içindeki API isteklerini IP'ye göre grupla
  const apiRequests = {};
  
  events.forEach(event => {
    if (!['API_REQUEST', 'API_ABUSE', 'WEB_TRAFFIC'].includes(event.type)) return;
    const eventTime = getEventDate(event).getTime();
    if (eventTime < cutoffTime) return;
    
    const ip = event.sourceIP || '127.0.0.1';
    if (!apiRequests[ip]) {
      apiRequests[ip] = 0;
    }
    apiRequests[ip]++;
  });
  
  const abuses = [];
  
  Object.keys(apiRequests).forEach(ip => {
    if (apiRequests[ip] >= threshold) {
      abuses.push({
        type: 'API_RATE_LIMIT',
        ip: ip,
        requestCount: apiRequests[ip],
        threshold: threshold,
        timeWindow: timeWindow,
        time: new Date(),
        severity: 'high',
        message: `${ip} IP adresinden ${timeWindow} ${timeUnit} içinde ${apiRequests[ip]} istek yapıldı (limit: ${threshold})`
      });
    }
  });
  
  return abuses;
};

/**
 * Tüm anormallikleri tespit et
 */
/**
 * Tüm anomalileri tespit eder
 * @param {Array} events - Event listesi
 * @param {Array} rules - Firebase'den gelen tespit kuralları
 */
export const detectAllAnomalies = (events, rules = []) => {
  // Null/undefined kontrolü
  if (!events || !Array.isArray(events)) {
    return {
      bruteForce: [],
      abnormalLoginTime: [],
      sqlInjection: [],
      trafficSpike: [],
      geoAnomaly: [],
      apiAbuse: [],
    };
  }
  
  // Kurallardan konfigürasyonları çıkar
  const bruteForceRule = rules.find(r => r.id === 'brute-force' && r.isActive);
  const abnormalLoginRule = rules.find(r => r.id === 'abnormal-login-time' && r.isActive);
  const sqlInjectionRule = rules.find(r => r.id === 'sql-injection' && r.isActive);
  const trafficSpikeRule = rules.find(r => r.id === 'traffic-spike' && r.isActive);
  const geoAnomalyRule = rules.find(r => r.id === 'geo-anomaly' && r.isActive);
  const apiRateLimitRule = rules.find(r => r.id === 'api-rate-limit' && r.isActive);
  
  return {
    bruteForce: bruteForceRule ? detectBruteForce(events, bruteForceRule) : [],
    abnormalLoginTime: abnormalLoginRule ? detectAbnormalLoginTime(events, abnormalLoginRule) : [],
    sqlInjection: sqlInjectionRule ? detectSQLInjection(events) : [],
    trafficSpike: trafficSpikeRule ? detectTrafficSpike(events, trafficSpikeRule) : [],
    geoAnomaly: geoAnomalyRule ? detectGeoAnomaly(events, geoAnomalyRule) : [],
    apiAbuse: apiRateLimitRule ? detectAPIAbuse(events, apiRateLimitRule) : [],
  };
};

// ============================================
// AI DESTEKLİ ÖNERİ SİSTEMİ
// ============================================

/**
 * AI Destekli Eşik Önerisi
 * Geçmiş verilere bakarak optimal eşik değeri önerir
 */
export const generateAIThresholdRecommendation = (events) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const recommendations = [];
  
  // Son 24 saatteki eventleri analiz et
  const now = Date.now();
  const last24Hours = now - (24 * 60 * 60 * 1000);
  
  const recentEvents = events.filter(event => {
    const eventTime = getEventDate(event).getTime();
    return eventTime >= last24Hours;
  });
  
  // Brute Force için eşik önerisi
  const authFails = recentEvents.filter(e => e.type === 'AUTH_FAIL').length;
  const loginSuccess = recentEvents.filter(e => e.type === 'LOGIN_SUCCESS').length;
  const failRate = loginSuccess > 0 ? authFails / loginSuccess : 0;
  
  if (failRate > 0.5) {
    recommendations.push({
      type: 'THRESHOLD',
      rule: 'Brute Force',
      current: 5,
      suggested: 3,
      confidence: 85,
      reason: `Başarısız giriş oranı yüksek (%${Math.round(failRate * 100)}). Eşik değerini düşürmeniz önerilir.`,
      priority: 'high'
    });
  } else if (failRate < 0.1 && authFails > 20) {
    recommendations.push({
      type: 'THRESHOLD',
      rule: 'Brute Force',
      current: 5,
      suggested: 7,
      confidence: 70,
      reason: `Sistem stabil, gereksiz alarmları azaltmak için eşik artırılabilir.`,
      priority: 'low'
    });
  }
  
  return recommendations;
};

/**
 * AI IP Engelleme Önerisi
 */
export const generateAIBlockRecommendation = (events) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const recommendations = [];
  const now = Date.now();
  const last24Hours = now - (24 * 60 * 60 * 1000);
  
  // IP'lere göre alarm sayısını hesapla
  const ipAlarmCount = {};
  
  events.forEach(event => {
    const eventTime = getEventDate(event).getTime();
    if (eventTime < last24Hours) return;
    if (!['AUTH_FAIL', 'BRUTE_FORCE', 'SQL_INJECTION', 'API_ABUSE'].includes(event.type)) return;
    
    const ip = event.sourceIP || '127.0.0.1';
    if (!ipAlarmCount[ip]) {
      ipAlarmCount[ip] = { count: 0, types: new Set() };
    }
    ipAlarmCount[ip].count++;
    ipAlarmCount[ip].types.add(event.type);
  });
  
  // Çok fazla alarm üreten IP'leri öner
  Object.keys(ipAlarmCount).forEach(ip => {
    const data = ipAlarmCount[ip];
    if (data.count >= 10) {
      recommendations.push({
        type: 'BLOCK_IP',
        ip: ip,
        alarmCount: data.count,
        attackTypes: Array.from(data.types),
        confidence: Math.min(95, 50 + data.count * 3),
        reason: `${ip} IP adresi son 24 saatte ${data.count} alarm üretti. Engellenmesi önerilir.`,
        priority: data.count >= 20 ? 'critical' : 'high'
      });
    }
  });
  
  return recommendations;
};

/**
 * AI Bildirim Azaltma Önerisi
 */
export const generateAINotificationRecommendation = (events) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const recommendations = [];
  const now = Date.now();
  const lastHour = now - (60 * 60 * 1000);
  
  // Son 1 saatteki event türlerini say
  const eventTypeCounts = {};
  
  events.forEach(event => {
    const eventTime = getEventDate(event).getTime();
    if (eventTime < lastHour) return;
    
    const type = event.type || 'UNKNOWN';
    if (!eventTypeCounts[type]) {
      eventTypeCounts[type] = 0;
    }
    eventTypeCounts[type]++;
  });
  
  // Çok fazla bildirim üreten event türleri
  Object.keys(eventTypeCounts).forEach(type => {
    if (eventTypeCounts[type] >= 50 && type !== 'LOGIN_SUCCESS') {
      recommendations.push({
        type: 'REDUCE_NOTIFICATIONS',
        eventType: type,
        count: eventTypeCounts[type],
        confidence: 75,
        reason: `"${type}" eventi son 1 saatte ${eventTypeCounts[type]} kez tetiklendi. Bildirim sıklığını azaltmanız veya kuralı gözden geçirmeniz önerilir.`,
        priority: 'medium'
      });
    }
  });
  
  return recommendations;
};

/**
 * AI Kullanıcı Güvenlik Önerisi
 */
export const generateAIUserSecurityRecommendation = (events) => {
  if (!events || !Array.isArray(events)) {
    return [];
  }
  
  const recommendations = [];
  const now = Date.now();
  const last7Days = now - (7 * 24 * 60 * 60 * 1000);
  
  // Kullanıcı bazlı başarısız giriş sayısı
  const userFailCounts = {};
  
  events.forEach(event => {
    if (event.type !== 'AUTH_FAIL') return;
    const eventTime = getEventDate(event).getTime();
    if (eventTime < last7Days) return;
    
    const username = event.username || 'unknown';
    if (!userFailCounts[username]) {
      userFailCounts[username] = 0;
    }
    userFailCounts[username]++;
  });
  
  // Çok fazla başarısız giriş olan kullanıcılar için 2FA önerisi
  Object.keys(userFailCounts).forEach(username => {
    if (userFailCounts[username] >= 5 && username !== 'unknown') {
      recommendations.push({
        type: 'ENABLE_2FA',
        username: username,
        failedAttempts: userFailCounts[username],
        confidence: 80,
        reason: `"${username}" hesabı için ${userFailCounts[username]} başarısız giriş denemesi var. 2FA aktifleştirmesi önerilir.`,
        priority: 'high'
      });
    }
  });
  
  return recommendations;
};

/**
 * Tüm AI önerilerini topla
 */
export const generateAllAIRecommendations = (events) => {
  return {
    thresholds: generateAIThresholdRecommendation(events),
    blockIPs: generateAIBlockRecommendation(events),
    notifications: generateAINotificationRecommendation(events),
    userSecurity: generateAIUserSecurityRecommendation(events),
  };
};

// ============================================
// ALARM YÖNETİMİ
// ============================================

/**
 * Real-time alarm dinleyicisi
 */
export const subscribeToAlarms = (callback) => {
  const q = query(
    collection(db, COLLECTIONS.ALARMS),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const alarms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(alarms);
  });
};

/**
 * Alarm durumunu güncelle
 */
export const updateAlarmStatus = async (alarmId, status, notes = '') => {
  try {
    const { updateDoc } = await import('firebase/firestore');
    const alarmRef = doc(db, COLLECTIONS.ALARMS, alarmId);
    await updateDoc(alarmRef, {
      status: status,
      notes: notes,
      updatedAt: Timestamp.now(),
      resolvedAt: status === 'resolved' ? Timestamp.now() : null,
    });
    return true;
  } catch (error) {
    console.error('Alarm güncelleme hatası:', error);
    return false;
  }
};

/**
 * Genel alarm oluştur
 */
export const createAlarm = async (alarmData) => {
  try {
    // Spam kontrolü için cache
    const cacheKey = `${alarmData.type}_${alarmData.sourceIP || 'unknown'}`;
    const lastAlarmTime = recentAlarmCache.get(cacheKey);
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    if (lastAlarmTime && lastAlarmTime >= fiveMinutesAgo) {
      console.log('Alarm zaten yakın zamanda oluşturuldu, atlanıyor:', cacheKey);
      return null;
    }
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ALARMS), {
      ...alarmData,
      status: 'open',
      createdAt: Timestamp.now(),
      detectedAt: Timestamp.now(),
    });
    
    // Cache'i güncelle
    recentAlarmCache.set(cacheKey, now);
    
    console.log('✅ Alarm oluşturuldu:', alarmData.type, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Alarm oluşturma hatası:', error);
    return null;
  }
};

// ============================================
// KURAL YÖNETİMİ
// ============================================

const RULES_COLLECTION = 'siem_detection_rules';

/**
 * Tespit kurallarını getir
 */
export const getDetectionRules = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, RULES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Kural getirme hatası:', error);
    return [];
  }
};

/**
 * Real-time kural dinleyicisi
 */
export const subscribeToRules = (callback) => {
  return onSnapshot(collection(db, RULES_COLLECTION), (snapshot) => {
    const rules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(rules);
  });
};

/**
 * Yeni kural ekle
 */
export const addDetectionRule = async (ruleData) => {
  try {
    const docRef = await addDoc(collection(db, RULES_COLLECTION), {
      ...ruleData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Kural ekleme hatası:', error);
    return null;
  }
};

/**
 * Kural güncelle
 */
export const updateDetectionRule = async (ruleId, ruleData) => {
  try {
    const { updateDoc } = await import('firebase/firestore');
    const ruleRef = doc(db, RULES_COLLECTION, ruleId);
    await updateDoc(ruleRef, {
      ...ruleData,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Kural güncelleme hatası:', error);
    return false;
  }
};

/**
 * Kural sil
 */
export const deleteDetectionRule = async (ruleId) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, RULES_COLLECTION, ruleId));
    return true;
  } catch (error) {
    console.error('Kural silme hatası:', error);
    return false;
  }
};

/**
 * Varsayılan kuralları Firebase'e yükle (ilk kurulum için)
 */
export const initializeDefaultRules = async (defaultRules) => {
  try {
    const { setDoc } = await import('firebase/firestore');
    
    for (const rule of defaultRules) {
      const ruleRef = doc(db, RULES_COLLECTION, rule.id);
      await setDoc(ruleRef, {
        ...rule,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Varsayılan kural yüklendi:', rule.name);
    }
    
    console.log('✅ Tüm varsayılan kurallar Firebase\'e yüklendi');
    return true;
  } catch (error) {
    console.error('Varsayılan kuralları yükleme hatası:', error);
    return false;
  }
};

/**
 * Belirli bir kuralı ID ile getir
 */
export const getRuleById = async (ruleId) => {
  try {
    const ruleDoc = await getDoc(doc(db, RULES_COLLECTION, ruleId));
    if (ruleDoc.exists()) {
      return {
        id: ruleDoc.id,
        ...ruleDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Kural getirme hatası:', error);
    return null;
  }
};

export { COLLECTIONS };

