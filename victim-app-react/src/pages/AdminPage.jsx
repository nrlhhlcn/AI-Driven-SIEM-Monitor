import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logWebTraffic, logUnauthorizedAccess, logLogoutEvent } from '../services/firebaseService';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unauthorizedAttempts, setUnauthorizedAttempts] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Sayfa ziyareti logu - sadece bir kez çalışsın
    const hasLogged = sessionStorage.getItem('adminPageVisited');
    if (!hasLogged) {
      logWebTraffic('/admin').catch(() => {});
      sessionStorage.setItem('adminPageVisited', 'true');
    }
    
    // Eğer kullanıcı giriş yapmamışsa yetkisiz erişim logu
    const checkAuth = async () => {
      const authStatus = sessionStorage.getItem('authenticated');
      if (authStatus !== 'true') {
        setUnauthorizedAttempts(prev => prev + 1);
        // Sadece ilk yetkisiz erişimde log at
        if (unauthorizedAttempts === 0) {
          await logUnauthorizedAccess('/admin').catch(() => {});
        }
      } else {
        setIsAuthenticated(true);
        // Kullanıcı email'ini al
        const email = sessionStorage.getItem('userEmail') || auth.currentUser?.email || 'Kullanıcı';
        setUserEmail(email);
      }
    };

    checkAuth();
  }, [unauthorizedAttempts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-md shadow-2xl border border-red-500/20">
          <div className="text-center">
            <i className="fas fa-shield-alt text-red-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h2>
            <p className="text-gray-600 mb-6">Bu sayfaya erişim için yetkiniz bulunmamaktadır.</p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
              <p className="text-gray-600 mt-1">Sistem yönetim ve izleme</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                <i className="fas fa-user-circle mr-2 text-cyan-500"></i>
                {userEmail || 'Kullanıcı'}
              </span>
              <button
                onClick={async () => {
                  const email = userEmail || sessionStorage.getItem('userEmail') || 'Bilinmeyen';
                  
                  // Çıkış logunu kaydet
                  await logLogoutEvent(email).catch(() => {
                    // Sessizce geç
                  });
                  
                  try {
                    await signOut(auth);
                  } catch (error) {
                    console.error('Çıkış hatası:', error);
                  }
                  
                  // Session temizle
                  sessionStorage.removeItem('authenticated');
                  sessionStorage.removeItem('userEmail');
                  sessionStorage.removeItem('userId');
                  
                  // SessionStorage'daki sayfa ziyareti loglarını da temizle (tekrar giriş yapıldığında log atılsın)
                  sessionStorage.removeItem('loginPageVisited');
                  sessionStorage.removeItem('adminPageVisited');
                  sessionStorage.removeItem('apiPageVisited');
                  sessionStorage.removeItem('uploadPageVisited');
                  
                  window.location.href = '/login';
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                Çıkış Yap
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <i className="fas fa-users text-3xl mb-3"></i>
              <h3 className="text-xl font-bold mb-1">1,240</h3>
              <p className="text-blue-100">Aktif Kullanıcı</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <i className="fas fa-server text-3xl mb-3"></i>
              <h3 className="text-xl font-bold mb-1">%98.4</h3>
              <p className="text-green-100">Sistem Sağlığı</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <i className="fas fa-chart-line text-3xl mb-3"></i>
              <h3 className="text-xl font-bold mb-1">84,392</h3>
              <p className="text-purple-100">Toplam Olay (24s)</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sistem Logları</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Sistem başlatıldı</p>
                    <p className="text-xs text-gray-500">2 saat önce</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

