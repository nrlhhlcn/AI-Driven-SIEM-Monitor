// Gemini AI servisleri
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Event'leri özetle ve istatistiklere çevir
 */
const prepareEventSummary = (events) => {
  if (!events || events.length === 0) {
    return {
      total: 0,
      byType: {},
      bySeverity: {},
      topIPs: [],
      topUsers: []
    };
  }

  const byType = {};
  const bySeverity = {};
  const ipCounts = {};
  const userCounts = {};

  events.forEach(event => {
    // Event type sayısı
    const type = event.type || 'UNKNOWN';
    byType[type] = (byType[type] || 0) + 1;

    // Severity sayısı
    const severity = event.severity || 'info';
    bySeverity[severity] = (bySeverity[severity] || 0) + 1;

    // IP sayısı
    const ip = event.sourceIP || 'unknown';
    ipCounts[ip] = (ipCounts[ip] || 0) + 1;

    // User sayısı
    const username = event.username || 'unknown';
    if (username !== 'unknown') {
      userCounts[username] = (userCounts[username] || 0) + 1;
    }
  });

  // Top IP'ler
  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ip, count]) => ({ ip, count }));

  // Top kullanıcılar
  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([username, count]) => ({ username, count }));

  return {
    total: events.length,
    byType,
    bySeverity,
    topIPs,
    topUsers
  };
};

/**
 * Alarm'ları özetle
 */
const prepareAlarmSummary = (alarms) => {
  if (!alarms || alarms.length === 0) {
    return {
      total: 0,
      open: 0,
      critical: 0,
      high: 0
    };
  }

  return {
    total: alarms.length,
    open: alarms.filter(a => a.status === 'open').length,
    critical: alarms.filter(a => a.severity === 'critical').length,
    high: alarms.filter(a => a.severity === 'high').length
  };
};

/**
 * Son kritik event'leri al
 */
const getRecentCriticalEvents = (events, limit = 5) => {
  return events
    .filter(e => e.severity === 'critical' || e.severity === 'high')
    .slice(0, limit)
    .map(e => ({
      type: e.type,
      typeDescription: getEventTypeDescription(e.type),
      severity: e.severity,
      title: e.title || e.type,
      sourceIP: e.sourceIP,
      username: e.username,
      country: e.country || 'Unknown',
      countryCode: e.countryCode || 'XX',
      timestamp: e.timestamp || e.createdAt,
      message: e.message || e.title || e.type
    }));
};

/**
 * Event type açıklaması
 */
const getEventTypeDescription = (type) => {
  const descriptions = {
    'LOGIN_SUCCESS': 'Başarılı giriş - Normal, güvenli',
    'AUTH_FAIL': 'Başarısız giriş denemesi - Şüpheli olabilir',
    'BRUTE_FORCE': 'Brute force saldırısı - Kritik tehdit',
    'SQL_INJECTION': 'SQL injection denemesi - Kritik tehdit',
    'GEO_ANOMALY': 'Coğrafi anomali - VPN kullanımı veya hesap ele geçirme işareti',
    'SUSPICIOUS_COUNTRY': 'Şüpheli ülkeden giriş - VPN veya gerçek tehdit',
    'API_ABUSE': 'API kötüye kullanımı',
    'WEB_TRAFFIC': 'Normal web trafiği',
    'FILE_UPLOAD': 'Dosya yükleme',
    'UNAUTHORIZED_ACCESS': 'Yetkisiz erişim denemesi'
  };
  return descriptions[type] || type;
};

/**
 * Gemini'ye gönderilecek prompt'u oluştur
 */
const createPrompt = (eventSummary, alarmSummary, recentCriticalEvents) => {
  return `
Sen bir siber güvenlik uzmanısın. Aşağıdaki güvenlik olaylarını ve alarmları analiz et ve Türkçe olarak detaylı bir analiz yap.

**ÖNEMLİ: EVENT TYPE AÇIKLAMALARI:**
- LOGIN_SUCCESS: Başarılı giriş (normal, güvenli)
- AUTH_FAIL: Başarısız giriş denemesi (şüpheli olabilir)
- BRUTE_FORCE: Brute force saldırısı (kritik tehdit)
- SQL_INJECTION: SQL injection denemesi (kritik tehdit)
- GEO_ANOMALY: Coğrafi anomali - aynı kullanıcı farklı IP'lerden giriş (VPN kullanımı veya hesap ele geçirme işareti)
- SUSPICIOUS_COUNTRY: Şüpheli ülkeden giriş denemesi (VPN veya gerçek tehdit)
- API_ABUSE: API kötüye kullanımı
- WEB_TRAFFIC: Normal web trafiği
- FILE_UPLOAD: Dosya yükleme
- UNAUTHORIZED_ACCESS: Yetkisiz erişim denemesi

**GÜVENLİK OLAY ÖZETİ:**
- Toplam Event: ${eventSummary.total}
- Event Tipleri ve Sayıları: ${JSON.stringify(eventSummary.byType, null, 2)}
- Severity Dağılımı: ${JSON.stringify(eventSummary.bySeverity, null, 2)}
- En Çok Event Üreten IP'ler: ${JSON.stringify(eventSummary.topIPs, null, 2)}
- En Çok Event Üreten Kullanıcılar: ${JSON.stringify(eventSummary.topUsers, null, 2)}

**ALARM ÖZETİ:**
- Toplam Alarm: ${alarmSummary.total}
- Açık Alarm: ${alarmSummary.open}
- Kritik Alarm: ${alarmSummary.critical}
- Yüksek Öncelikli Alarm: ${alarmSummary.high}

**SON KRİTİK OLAYLAR (Detaylı):**
${JSON.stringify(recentCriticalEvents, null, 2)}

**ANALİZ TALİMATLARI:**
1. Event type'larına dikkat et: GEO_ANOMALY ve SUSPICIOUS_COUNTRY coğrafi anomali/şüpheli ülke anlamına gelir, başarısız giriş değil
2. Başarılı girişler (LOGIN_SUCCESS) ile başarısız girişler (AUTH_FAIL) arasında ayrım yap
3. Coğrafi anomaliler (GEO_ANOMALY) VPN kullanımı veya hesap ele geçirme işareti olabilir, bunları "başarısız giriş" olarak değerlendirme
4. Şüpheli ülke (SUSPICIOUS_COUNTRY) eventleri de coğrafi tehdit kategorisinde, başarısız giriş değil

LÜTFEN ŞUNLARI SAĞLA (Türkçe, teknik ama anlaşılır dil):

1. **ÖZET**: Son 5 dakikadaki güvenlik durumunun kısa özeti (2-3 cümle). Event type'larını doğru yorumla.

2. **KRİTİK DURUMLAR**: Acil müdahale gerektiren durumlar (liste formatında, her biri kısa). Coğrafi anomalileri, şüpheli ülkeleri ve gerçek saldırıları ayrı ayrı belirt.

3. **TREND ANALİZİ**: Olayların genel trendi (artış/azalış, pattern'ler, dikkat çeken durumlar). Coğrafi anomaliler ile başarısız giriş denemelerini karıştırma.

4. **ÖNERİLER**: Güvenlik iyileştirmeleri için somut öneriler (3-5 madde, her biri kısa ve net).

Çıktıyı JSON formatında ver:
{
  "summary": "...",
  "criticalIssues": ["...", "..."],
  "trendAnalysis": "...",
  "recommendations": ["...", "...", "..."]
}
`;
};

/**
 * Gemini'den gelen yanıtı parse et
 */
const parseResponse = (text) => {
  try {
    // JSON bloğunu bul
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // JSON yoksa manuel parse dene
    return {
      summary: text.split('ÖZET:')[1]?.split('KRİTİK')[0]?.trim() || text.substring(0, 200),
      criticalIssues: text.match(/KRİTİK DURUMLAR:[\s\S]*?TREND/g)?.[0]?.split('\n').filter(l => l.trim() && !l.includes('KRİTİK') && !l.includes('TREND')) || [],
      trendAnalysis: text.split('TREND ANALİZİ:')[1]?.split('ÖNERİLER')[0]?.trim() || '',
      recommendations: text.split('ÖNERİLER:')[1]?.split('\n').filter(l => l.trim() && l.match(/^\d+\.|^-/)) || []
    };
  } catch (error) {
    console.error('Gemini yanıt parse hatası:', error);
    return {
      summary: text.substring(0, 300),
      criticalIssues: [],
      trendAnalysis: '',
      recommendations: []
    };
  }
};

/**
 * Son 5 dakikadaki güvenlik olaylarını Gemini'ye gönder ve analiz al
 */
export const analyzeSecurityEvents = async (events, alarms) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key bulunamadı. Lütfen .env dosyasında VITE_GEMINI_API_KEY değişkenini tanımlayın.');
    }

    // Son 5 dakikadaki event'leri filtrele
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const recentEvents = events.filter(event => {
      if (!event.createdAt) return false;
      const eventTime = event.createdAt?.toDate 
        ? event.createdAt.toDate().getTime()
        : event.createdAt?.seconds 
        ? event.createdAt.seconds * 1000
        : new Date(event.createdAt).getTime();
      return eventTime >= fiveMinutesAgo;
    });

    // Özetleri hazırla
    const eventSummary = prepareEventSummary(recentEvents);
    const alarmSummary = prepareAlarmSummary(alarms);
    const recentCriticalEvents = getRecentCriticalEvents(recentEvents, 5);

    // Prompt oluştur
    const prompt = createPrompt(eventSummary, alarmSummary, recentCriticalEvents);

    // Gemini'ye gönder
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Yanıtı parse et
    const analysis = parseResponse(text);

    return {
      success: true,
      analysis,
      timestamp: new Date(),
      eventCount: recentEvents.length,
      alarmCount: alarms.length
    };
  } catch (error) {
    console.error('Gemini analiz hatası:', error);
    return {
      success: false,
      error: error.message || 'Bilinmeyen hata',
      timestamp: new Date()
    };
  }
};
