import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logLoginEvent, saveEventToFirebase } from '../services/firebaseService';
import { getCountryFromIP } from '../services/geolocationService';
import { addUsersToFirebase } from '../scripts/addUsers';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTestCountry, setSelectedTestCountry] = useState('');
  
  // Test ülkeleri listesi
  const testCountries = [
    { name: 'Türkiye', code: 'TR', flag: '🇹🇷' },
    { name: 'Almanya', code: 'DE', flag: '🇩🇪' },
    { name: 'Amerika', code: 'US', flag: '🇺🇸' },
    { name: 'Çin', code: 'CN', flag: '🇨🇳' },
    { name: 'Rusya', code: 'RU', flag: '🇷🇺' },
    { name: 'Fransa', code: 'FR', flag: '🇫🇷' },
    { name: 'İngiltere', code: 'GB', flag: '🇬🇧' },
    { name: 'Singapur', code: 'SG', flag: '🇸🇬' },
  ];

  // Sayfa ziyareti logu - sadece bir kez çalışsın
  useEffect(() => {
    // Sadece ilk yüklemede log at (sessionStorage kontrolü ile)
    const hasLogged = sessionStorage.getItem('loginPageVisited');
    if (!hasLogged) {
      saveEventToFirebase({
        type: 'WEB_TRAFFIC',
        title: 'Login Sayfası Ziyaret Edildi',
        severity: 'info',
        category: 'Web',
        sourceIP: '127.0.0.1',
        destIP: window.location.hostname,
        path: '/login',
      }).catch(() => {
        // Sessizce geç
      });
      sessionStorage.setItem('loginPageVisited', 'true');
    }
    
    // localStorage'dan test ülkesi kontrolü
    const savedCountry = localStorage.getItem('testCountry');
    if (savedCountry) {
      setSelectedTestCountry(savedCountry);
    }

    // Browser console'dan kullanıcı ekleme fonksiyonunu erişilebilir yap
    if (typeof window !== 'undefined') {
      window.addUsersToFirebase = addUsersToFirebase;
    }
  }, []);
  
  // Test ülkesi seçildiğinde localStorage'a kaydet
  const handleCountrySelect = (countryName) => {
    setSelectedTestCountry(countryName);
    localStorage.setItem('testCountry', countryName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Ülke bilgisini al (tüm login denemeleri için)
    // getCountryFromIP fonksiyonu localStorage'dan test ülkesini otomatik okuyor
    const geoData = await getCountryFromIP().catch(() => ({
      country: 'Unknown',
      countryCode: 'XX',
      ip: '127.0.0.1',
      city: 'Unknown',
      region: 'Unknown'
    }));

    // SQL Injection tespiti
    const sqlPatterns = [/'/g, /OR\s+1\s*=\s*1/gi, /UNION/gi, /SELECT/gi, /DROP/gi];
    const hasSQLInjection = sqlPatterns.some(pattern => pattern.test(email) || pattern.test(password));
    
    if (hasSQLInjection) {
      // Firebase'e SQL Injection kaydet (ülke bilgisi ile)
      await logLoginEvent(email, false, 'SQL_INJECTION', 'critical', geoData).catch(err => {
        // Sessizce geç
      });
      setError('Güvenlik ihlali tespit edildi!');
      setLoading(false);
      return;
    }

    // Brute Force tespiti - 'root' kullanıcısına özel
    if (email.toLowerCase().includes('root')) {
      // Firebase'e Brute Force kaydet (ülke bilgisi ile)
      await logLoginEvent(email, false, 'BRUTE_FORCE', 'high', geoData).catch(err => {
        // Sessizce geç
      });
      setError('Bu kullanıcı adına erişim yasak!');
      setLoading(false);
      return;
    }

    try {
      // Firebase Authentication ile giriş yap
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Başarılı giriş - Firebase'e kaydet (ülke bilgisi ile)
      await logLoginEvent(email, true, 'LOGIN_SUCCESS', 'low', geoData).catch(err => {
        // Sessizce geç
      });
      
      // Session'a kaydet
      sessionStorage.setItem('authenticated', 'true');
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userId', user.uid);
      
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (error) {
      setLoading(false);
      
      // Firebase Authentication hataları
      let errorMessage = 'Hatalı e-posta veya şifre!';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi kayıtlı değil!';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi!';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız deneme! Lütfen daha sonra tekrar deneyin.';
      }
      
      // Firebase'e başarısız giriş kaydet (ülke bilgisi ile)
      await logLoginEvent(email, false, 'AUTH_FAIL', 'medium', geoData).catch(err => {
        // Sessizce geç
      });
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      {/* SAĞ ÜST KÖŞE - ÜLKE SEÇİCİ (Sadece Development Modunda) */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20 z-50">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-globe text-cyan-600"></i>
            <span className="text-xs font-semibold text-gray-700">Test Ülkesi:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {testCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.name)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTestCountry === country.name
                    ? 'bg-cyan-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={country.name}
              >
                <span className="mr-1">{country.flag}</span>
                {country.code}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedTestCountry('');
                localStorage.removeItem('testCountry');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                !selectedTestCountry
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Gerçek IP Kullan"
            >
              🌐 Gerçek
            </button>
          </div>
          {selectedTestCountry && (
            <div className="mt-2 text-xs text-cyan-600 font-medium">
              ✓ {selectedTestCountry} seçildi
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <i className="fas fa-university text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
            Demo Bakırçay Üniversitesi
          </h1>
          <p className="text-gray-600 text-sm font-medium">Öğrenci & Personel Giriş Portalı</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Güvenli Bağlantı Aktif</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <i className="fas fa-exclamation-circle text-red-500 text-lg mt-0.5"></i>
            <div className="flex-1">
              <p className="text-red-700 font-medium text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">Lütfen bilgilerinizi kontrol edin.</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 text-lg mt-0.5"></i>
            <div className="flex-1">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              <i className="fas fa-envelope mr-2 text-cyan-600"></i>E-posta / Kullanıcı Adı
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="ornek@bakircay.edu.tr"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              <i className="fas fa-lock mr-2 text-cyan-600"></i>Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="Şifrenizi girin"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
            <i className="fas fa-shield-alt text-cyan-500"></i>
            <span>Bu site <strong className="text-cyan-600">AI-Driven-SIEM</strong> tarafından izlenmektedir.</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-semibold mb-2 text-gray-700">Test Kullanıcıları:</p>
            <ul className="space-y-1 text-left">
              <li>• admin@bakircay.edu.tr / Admin123!</li>
              <li>• ogrenci@bakircay.edu.tr / Ogrenci123!</li>
            </ul>
            <p className="font-semibold mb-2 mt-3 text-red-600">🔴 SQL Injection Test:</p>
            <ul className="space-y-1 text-left text-red-500">
              <li>• ' OR '1'='1</li>
              <li>• admin' UNION SELECT --</li>
              <li>• '; DROP TABLE users; --</li>
            </ul>
            <p className="font-semibold mb-2 mt-3 text-orange-600">🌍 Ülke Test:</p>
            <ul className="space-y-1 text-left text-orange-500 text-xs">
              <li>• Sağ üstteki butonlardan ülke seç</li>
              <li>• VPN kullanıldığında otomatik algılanır</li>
              <li>• "Gerçek" butonu ile gerçek IP kullanılır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

