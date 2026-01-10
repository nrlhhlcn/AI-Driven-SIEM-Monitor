/**
 * IP Geolocation Servisi
 * Kullanıcının IP adresinden ülke bilgisini alır
 */

/**
 * IP adresinden ülke bilgisini alır
 * @returns {Promise<{country: string, countryCode: string, ip: string, city: string, region: string}>}
 */
export const getCountryFromIP = async () => {
  // Development modunda test için: localStorage'dan ülke seçimi
  // LoginPage'deki butonlar ile seçilen ülke buradan okunur
  if (import.meta.env.DEV) {
    const testCountry = localStorage.getItem('testCountry');
    
    if (testCountry) {
      // Test ülkeleri mapping (LoginPage'deki seçeneklerle uyumlu)
      const testCountries = {
        'Türkiye': { country: 'Turkey', countryCode: 'TR', city: 'Istanbul', region: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
        'Almanya': { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
        'Amerika': { country: 'United States', countryCode: 'US', city: 'New York', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
        'Çin': { country: 'China', countryCode: 'CN', city: 'Beijing', region: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
        'Rusya': { country: 'Russia', countryCode: 'RU', city: 'Moscow', region: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
        'Fransa': { country: 'France', countryCode: 'FR', city: 'Paris', region: 'Paris', latitude: 48.8566, longitude: 2.3522 },
        'İngiltere': { country: 'United Kingdom', countryCode: 'GB', city: 'London', region: 'London', latitude: 51.5074, longitude: -0.1278 },
        'Singapur': { country: 'Singapore', countryCode: 'SG', city: 'Singapore', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
        // Eski format desteği (geriye uyumluluk)
        'United States': { country: 'United States', countryCode: 'US', city: 'New York', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
        'USA': { country: 'United States', countryCode: 'US', city: 'New York', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
        'US': { country: 'United States', countryCode: 'US', city: 'New York', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
        'China': { country: 'China', countryCode: 'CN', city: 'Beijing', region: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
        'CN': { country: 'China', countryCode: 'CN', city: 'Beijing', region: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
        'Russia': { country: 'Russia', countryCode: 'RU', city: 'Moscow', region: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
        'RU': { country: 'Russia', countryCode: 'RU', city: 'Moscow', region: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
        'Turkey': { country: 'Turkey', countryCode: 'TR', city: 'Istanbul', region: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
        'TR': { country: 'Turkey', countryCode: 'TR', city: 'Istanbul', region: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
        'Germany': { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
        'DE': { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
        'Singapore': { country: 'Singapore', countryCode: 'SG', city: 'Singapore', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
        'SG': { country: 'Singapore', countryCode: 'SG', city: 'Singapore', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
      };
      
      const testData = testCountries[testCountry];
      if (testData) {
        console.log('🧪 Test modu: Ülke bilgisi manuel olarak ayarlandı:', testCountry);
        return {
          ...testData,
          ip: '192.168.1.100', // Test IP
        };
      }
    }
  }
  
  try {
    // Ücretsiz IP Geolocation API (ipapi.co)
    // VPN kullanıldığında VPN'in IP'sini algılar
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Geolocation API yanıt vermedi');
    }
    
    const data = await response.json();
    
    // API başarılı yanıt verdi
    if (data.error) {
      throw new Error(data.reason || 'Geolocation hatası');
    }
    
    console.log('🌍 Gerçek IP ve ülke bilgisi alındı:', {
      ip: data.ip,
      country: data.country_name,
      countryCode: data.country_code
    });
    
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      ip: data.ip || '127.0.0.1',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.warn('Geolocation servisi çalışmadı:', error.message);
    
    // Fallback: Varsayılan değerler (local development için)
    return {
      country: 'Unknown',
      countryCode: 'XX',
      ip: '127.0.0.1',
      city: 'Unknown',
      region: 'Unknown',
      latitude: null,
      longitude: null,
    };
  }
};

/**
 * IP adresinden ülke bilgisini alır (Alternatif API)
 * ipapi.co çalışmazsa bu kullanılabilir
 */
export const getCountryFromIPAlternative = async () => {
  try {
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'API hatası');
    }
    
    return {
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX',
      ip: data.query || '127.0.0.1',
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.warn('Alternatif geolocation servisi çalışmadı:', error.message);
    return getCountryFromIP(); // İlk API'yi tekrar dene
  }
};
