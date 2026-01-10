// SIEM Backend'e log gönderme servisi
const SIEM_API_URL = 'http://localhost:3001/api/logs';

/**
 * SIEM sistemine olay gönderir
 * @param {string} type - Olay tipi (BRUTE_FORCE, SQL_INJECTION, FIREWALL_BLOCK, vb.)
 * @param {string} title - Olay başlığı
 * @param {string} severity - Ciddiyet seviyesi (high, medium, low, info)
 * @param {string} category - Kategori (Auth, Network, Web, System)
 * @param {object} additionalData - Ek veriler (sourceIP, destIP, port, vb.)
 */
export const sendLogToSIEM = async (type, title, severity, category = 'Web', additionalData = {}) => {
  const logData = {
    type,
    title,
    severity,
    category,
    sourceIP: additionalData.sourceIP || '127.0.0.1',
    destIP: additionalData.destIP || window.location.hostname,
    port: additionalData.port || null,
    protocol: additionalData.protocol || 'HTTP',
    userAgent: navigator.userAgent,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
    ...additionalData
  };

  try {
    const response = await fetch(SIEM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    
    if (!response.ok) {
      console.warn('SIEM backend yanıt vermedi:', response.status);
    }
  } catch (error) {
    // Backend kapalıysa sessizce geç (site çalışmaya devam etsin)
    // Sadece development'ta göster, production'da sessiz kal
    if (import.meta.env.DEV) {
      // console.warn('SIEM backend\'e bağlanılamadı:', error.message);
    }
  }
};

// Olay tipleri için yardımcı fonksiyonlar
export const logEvent = {
  bruteForce: (username) => sendLogToSIEM(
    'BRUTE_FORCE',
    `Brute Force saldırısı tespit edildi: ${username}`,
    'high',
    'Auth'
  ),
  
  sqlInjection: (query) => sendLogToSIEM(
    'SQL_INJECTION',
    `SQL Injection denemesi: ${query.substring(0, 50)}`,
    'critical',
    'Web'
  ),
  
  loginSuccess: (username) => sendLogToSIEM(
    'LOGIN_SUCCESS',
    `Başarılı giriş: ${username}`,
    'low',
    'Auth'
  ),
  
  loginFailed: (username) => sendLogToSIEM(
    'AUTH_FAIL',
    `Başarısız giriş denemesi: ${username}`,
    'medium',
    'Auth'
  ),
  
  unauthorizedAccess: (path) => sendLogToSIEM(
    'UNAUTHORIZED_ACCESS',
    `Yetkisiz erişim denemesi: ${path}`,
    'high',
    'System'
  ),
  
  fileUpload: (filename, fileType) => sendLogToSIEM(
    'FILE_UPLOAD',
    `Dosya yükleme: ${filename} (${fileType})`,
    fileType.includes('exe') || fileType.includes('php') ? 'high' : 'info',
    'Web'
  ),
  
  webTraffic: (path) => sendLogToSIEM(
    'WEB_TRAFFIC',
    `Web trafiği: ${path}`,
    'info',
    'Web'
  ),
  
  portScan: (port) => sendLogToSIEM(
    'PORT_SCAN',
    `Port taraması tespit edildi: ${port}`,
    'high',
    'Network'
  ),
  
  firewallBlock: (ip, reason) => sendLogToSIEM(
    'FIREWALL_BLOCK',
    `Firewall engelleme: ${ip} - ${reason}`,
    'medium',
    'Network'
  ),
};

