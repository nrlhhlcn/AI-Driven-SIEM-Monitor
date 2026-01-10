import { useState, useEffect } from 'react';
import { logWebTraffic, logApiRequest, logApiAbuse, logInvalidApiKey, logSensitiveApiAccess } from '../services/firebaseService';

const ApiPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('/api/users');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState(null);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Sayfa ziyareti logu - sadece bir kez çalışsın
    const hasLogged = sessionStorage.getItem('apiPageVisited');
    if (!hasLogged) {
      logWebTraffic('/api').catch(() => {});
      sessionStorage.setItem('apiPageVisited', 'true');
    }
  }, []);

  const handleApiRequest = async () => {
    setRequestCount(prev => prev + 1);
    
    // API abuse tespiti
    if (requestCount > 10) {
      await logApiAbuse(requestCount + 1, endpoint, method).catch(() => {});
      setResponse({ error: 'Rate limit aşıldı! Çok fazla istek gönderildi.' });
      return;
    }

    // Geçersiz API key kontrolü
    if (apiKey && apiKey !== 'valid-api-key-123') {
      await logInvalidApiKey(apiKey, endpoint, method).catch(() => {});
      setResponse({ error: 'Geçersiz API key!' });
      return;
    }

    // DELETE ve PUT metodları için özel kontrol
    if (method === 'DELETE' || method === 'PUT') {
      await logSensitiveApiAccess(method, endpoint).catch(() => {});
    }

    // Normal istek logu
    await logApiRequest(method, endpoint, apiKey, 'info').catch(() => {});

    // Simüle edilmiş API yanıtı
    setResponse({
      success: true,
      data: {
        message: 'API isteği başarılı',
        timestamp: new Date().toISOString(),
        endpoint,
        method
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <i className="fas fa-code text-5xl text-cyan-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">API Test Konsolu</h1>
            <p className="text-gray-600">API endpoint'lerini test edin</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                <i className="fas fa-key mr-2 text-cyan-600"></i>API Key (Opsiyonel)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="API anahtarınızı girin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-route mr-2 text-cyan-600"></i>Endpoint
                </label>
                <select
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800"
                >
                  <option value="/api/users">/api/users</option>
                  <option value="/api/admin">/api/admin</option>
                  <option value="/api/data">/api/data</option>
                  <option value="/api/config">/api/config</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-exchange-alt mr-2 text-cyan-600"></i>Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-200 text-gray-800"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleApiRequest}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <i className="fas fa-paper-plane"></i>
              <span>İsteği Gönder</span>
            </button>

            {response && (
              <div className={`p-4 rounded-xl border-l-4 ${
                response.error 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start gap-3">
                  <i className={`fas ${
                    response.error 
                      ? 'fa-exclamation-circle text-red-500' 
                      : 'fa-check-circle text-green-500'
                  } text-lg mt-0.5`}></i>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      response.error ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {response.error || 'İstek başarılı!'}
                    </p>
                    {response.data && (
                      <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-yellow-500 text-lg mt-0.5"></i>
                <div>
                  <p className="text-yellow-800 font-medium text-sm">İstek Sayısı: {requestCount}</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    10'dan fazla istek gönderilirse rate limit uyarısı tetiklenir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <i className="fas fa-shield-alt text-cyan-500"></i>
              <span>Tüm API istekleri <strong className="text-cyan-600">AI-Driven-SIEM</strong> tarafından izlenmektedir.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;

