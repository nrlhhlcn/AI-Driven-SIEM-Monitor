import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UploadPage from './pages/UploadPage';
import ApiPage from './pages/ApiPage';
import { logEvent } from './services/siemLogger';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Sayfa yüklendiğinde ana sayfa logu
    logEvent.webTraffic('/');
  }, []);

  // Basit routing sistemi
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/upload') {
      setCurrentPage('upload');
    } else if (path === '/api') {
      setCurrentPage('api');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const navigate = (page) => {
    window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
    setCurrentPage(page);
  };

  // Admin sayfasına giriş yapıldığında session'a kaydet
  useEffect(() => {
    if (currentPage === 'admin') {
      sessionStorage.setItem('authenticated', 'true');
    }
  }, [currentPage]);

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <i className="fas fa-university text-cyan-400 text-2xl"></i>
              <span className="text-white font-bold text-xl">CorpBank</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('login');
                }}
                className="text-white hover:text-cyan-400 transition-colors"
              >
                Giriş
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            CorpBank'a Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Güvenli bankacılık hizmetleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            onClick={() => navigate('login')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105"
          >
            <i className="fas fa-sign-in-alt text-cyan-400 text-4xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">Giriş Yap</h3>
            <p className="text-gray-300 text-sm">
              Personel giriş portalına erişin
            </p>
          </div>

          <div
            onClick={() => navigate('upload')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105"
          >
            <i className="fas fa-cloud-upload-alt text-cyan-400 text-4xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">Dosya Yükle</h3>
            <p className="text-gray-300 text-sm">
              Güvenli dosya yükleme servisi
            </p>
          </div>

          <div
            onClick={() => navigate('api')}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105"
          >
            <i className="fas fa-code text-cyan-400 text-4xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">API Test</h3>
            <p className="text-gray-300 text-sm">
              API endpoint'lerini test edin
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <i className="fas fa-shield-alt text-cyan-500"></i>
            <span>
              Bu site <strong className="text-cyan-400">AI-Driven-SIEM</strong> tarafından izlenmektedir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'upload' && <UploadPage />}
      {currentPage === 'api' && <ApiPage />}
    </>
  );
}

export default App;
