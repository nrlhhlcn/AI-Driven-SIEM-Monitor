import { useState, useEffect } from 'react';
import { logWebTraffic, logFileUpload } from '../services/firebaseService';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    // Sayfa ziyareti logu - sadece bir kez çalışsın
    const hasLogged = sessionStorage.getItem('uploadPageVisited');
    if (!hasLogged) {
      logWebTraffic('/upload').catch(() => {});
      sessionStorage.setItem('uploadPageVisited', 'true');
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileType = selectedFile.type || 'unknown';
      const fileName = selectedFile.name;
      
      // Şüpheli dosya tipleri kontrolü
      const suspiciousTypes = ['application/x-msdownload', 'application/x-executable', 'application/x-php'];
      const suspiciousExtensions = ['.exe', '.php', '.sh', '.bat', '.cmd'];
      const hasSuspiciousExtension = suspiciousExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
      
      if (suspiciousTypes.includes(fileType) || hasSuspiciousExtension) {
        logFileUpload(fileName, fileType).catch(() => {});
        setUploadStatus('warning');
      } else {
        logFileUpload(fileName, fileType).catch(() => {});
        setUploadStatus('success');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // Dosya yükleme simülasyonu
      setTimeout(() => {
        setUploadStatus('uploaded');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigasyon Menüsü */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          <a href="/admin" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-home mr-2"></i>Ana Sayfa
          </a>
          <a href="/schedule" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-calendar-alt mr-2"></i>Ders Programı
          </a>
          <a href="/grades" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-graduation-cap mr-2"></i>Notlarım
          </a>
          <a href="/calendar" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-calendar-check mr-2"></i>Akademik Takvim
          </a>
          <a href="/upload" className="px-4 py-2 bg-cyan-500 rounded-lg text-white text-sm font-medium">
            <i className="fas fa-cloud-upload-alt mr-2"></i>Ödev Yükle
          </a>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <i className="fas fa-cloud-upload-alt text-5xl text-cyan-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Ödev Yükleme Sistemi</h1>
            <p className="text-gray-600">Demo Bakırçay Üniversitesi - Öğrenci Ödev Portalı</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-cyan-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
                accept="*/*"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex flex-col items-center"
              >
                <i className="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
                <span className="text-gray-600 font-medium mb-2">
                  Ödev dosyanızı seçmek için tıklayın
                </span>
                <span className="text-sm text-gray-400">
                  PDF, DOC, DOCX formatları kabul edilir
                </span>
              </label>
            </div>

            {file && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file text-cyan-500 text-xl"></i>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setUploadStatus('');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}

            {uploadStatus === 'warning' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-yellow-500 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-yellow-800 font-medium">Şüpheli dosya tespit edildi!</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Bu dosya tipi ödev yükleme için uygun değildir. Lütfen PDF, DOC veya DOCX formatında bir dosya yükleyin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'uploaded' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-green-500 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-green-800 font-medium">Ödev dosyanız başarıyla yüklendi!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Ödev değerlendirme sonuçları e-posta adresinize gönderilecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fas fa-upload"></i>
              <span>Ödevi Yükle</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <i className="fas fa-shield-alt text-cyan-500"></i>
              <span>Tüm yüklemeler <strong className="text-cyan-600">AI-Driven-SIEM</strong> tarafından izlenmektedir.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

