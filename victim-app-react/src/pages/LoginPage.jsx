import { useState, useEffect } from 'react';
import { logEvent, sendLogToSIEM } from '../services/siemLogger';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sayfa ziyareti logu
  useEffect(() => {
    logEvent.webTraffic('/login');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // SQL Injection tespiti
    const sqlPatterns = [/'/g, /OR\s+1\s*=\s*1/gi, /UNION/gi, /SELECT/gi, /DROP/gi];
    const hasSQLInjection = sqlPatterns.some(pattern => pattern.test(username) || pattern.test(password));
    
    if (hasSQLInjection) {
      logEvent.sqlInjection(username + password);
      setError('Güvenlik ihlali tespit edildi!');
      return;
    }

    // Brute Force tespiti - 'root' kullanıcısına özel
    if (username === 'root') {
      logEvent.bruteForce(username);
      setError('Bu kullanıcı adına erişim yasak!');
      return;
    }

    // Normal giriş kontrolü
    if (username === 'admin' && password === '123456') {
      logEvent.loginSuccess(username);
      sessionStorage.setItem('authenticated', 'true');
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } else {
      logEvent.loginFailed(username);
      setError('Hatalı kullanıcı adı veya şifre!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <i className="fas fa-university text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
            CorpBank
          </h1>
          <p className="text-gray-600 text-sm font-medium">Personel Giriş Portalı</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              <i className="fas fa-user mr-2 text-cyan-600"></i>Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="Kullanıcı adınızı girin"
              required
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
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-in-alt"></i>
            <span>Giriş Yap</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <i className="fas fa-shield-alt text-cyan-500"></i>
            <span>Bu site <strong className="text-cyan-600">AI-Driven-SIEM</strong> tarafından izlenmektedir.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

