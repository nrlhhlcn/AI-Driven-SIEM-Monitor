import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, AlertTriangle, TrendingUp, Lightbulb, 
  Clock, CheckCircle2, XCircle, Loader2, History, ChevronDown, ChevronUp
} from 'lucide-react';
import { subscribeToEvents, subscribeToAlarms, saveAIAnalysis, subscribeToAIAnalyses } from '../../services/firebaseService';
import { analyzeSecurityEvents } from '../../services/geminiService';

const AIAnalysis = () => {
  const [events, setEvents] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Event'leri dinle
  useEffect(() => {
    const unsubscribe = subscribeToEvents((eventsList) => {
      setEvents(eventsList);
    });
    return () => unsubscribe();
  }, []);

  // Alarm'ları dinle
  useEffect(() => {
    const unsubscribe = subscribeToAlarms((alarmsList) => {
      setAlarms(alarmsList);
    });
    return () => unsubscribe();
  }, []);

  // Geçmiş analizleri dinle
  useEffect(() => {
    const unsubscribe = subscribeToAIAnalyses((analyses) => {
      setPastAnalyses(analyses);
    }, 10);
    return () => unsubscribe();
  }, []);

  // Analiz yap
  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeSecurityEvents(events, alarms);
      
      if (result.success) {
        setAnalysis(result.analysis);
        setLastAnalysisTime(result.timestamp);
        setError(null);

        // Firebase'e kaydet
        try {
          const savedId = await saveAIAnalysis({
            analysis: result.analysis,
            eventCount: result.eventCount,
            alarmCount: result.alarmCount,
            timestamp: result.timestamp, // Date objesi olarak gönder, Firebase servisinde dönüştürülecek
            status: 'success'
          });
          console.log('✅ AI analiz Firebase\'e kaydedildi:', savedId);
        } catch (saveError) {
          console.error('❌ AI analiz kaydetme hatası:', saveError);
          // Kullanıcıya da göster
          setError(prev => prev ? prev + ' (Analiz kaydedilemedi)' : 'Analiz yapıldı ancak kaydedilemedi: ' + saveError.message);
        }
      } else {
        setError(result.error || 'Analiz başarısız oldu');
        
        // Hatalı analizi de kaydet
        try {
          const savedId = await saveAIAnalysis({
            error: result.error,
            timestamp: result.timestamp, // Date objesi olarak gönder
            status: 'failed'
          });
          console.log('✅ Hatalı analiz Firebase\'e kaydedildi:', savedId);
        } catch (saveError) {
          console.error('❌ Hatalı analiz kaydetme hatası:', saveError);
        }
      }
    } catch (err) {
      setError(err.message || 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Zaman formatı
  const formatTime = (date) => {
    if (!date) return 'Henüz analiz yapılmadı';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Geçmiş analizi seç
  const selectPastAnalysis = (pastAnalysis) => {
    if (pastAnalysis.analysis && pastAnalysis.status === 'success') {
      setAnalysis(pastAnalysis.analysis);
      const timestamp = pastAnalysis.createdAt?.toDate ? pastAnalysis.createdAt.toDate() : pastAnalysis.timestamp;
      setLastAnalysisTime(timestamp);
      setShowHistory(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Brain size={32} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles size={24} className="text-purple-400" />
                Yapay Zeka Güvenlik Analizi
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Gemini AI ile güvenlik olaylarını analiz edin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Analiz Yap Butonu */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analiz Yapılıyor...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>AI Analiz Yap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Son Analiz Zamanı */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>Son Analiz: {formatTime(lastAnalysisTime)}</span>
        </div>
      </div>

      {/* HATA MESAJI */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-400 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-medium mb-1">Hata</h4>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* ANALİZ SONUÇLARI */}
      {analysis ? (
        <div className="space-y-4">
          
          {/* ÖZET */}
          <div className="bg-siem-card border border-siem-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <CheckCircle2 size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Özet</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{analysis.summary || 'Özet bulunamadı'}</p>
          </div>

          {/* KRİTİK DURUMLAR */}
          {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Kritik Durumlar</h3>
              </div>
              <ul className="space-y-2">
                {analysis.criticalIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TREND ANALİZİ */}
          {analysis.trendAnalysis && (
            <div className="bg-siem-card border border-siem-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Trend Analizi</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{analysis.trendAnalysis}</p>
            </div>
          )}

          {/* ÖNERİLER */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-siem-card border border-siem-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                  <Lightbulb size={20} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Önerileri</h3>
              </div>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-siem-bg/50 rounded-lg border border-siem-border">
                    <span className="text-green-400 mt-1 font-bold">{index + 1}.</span>
                    <span className="text-gray-300 flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      ) : !isLoading && !error && (
        <div className="bg-siem-card border border-siem-border rounded-xl p-12 text-center">
          <Brain size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Henüz analiz yapılmadı</p>
          <p className="text-gray-500 text-sm">Yukarıdaki "AI Analiz Yap" butonuna tıklayarak analiz başlatın</p>
        </div>
      )}

      {/* YÜKLEME DURUMU */}
      {isLoading && (
        <div className="bg-siem-card border border-siem-border rounded-xl p-12 text-center">
          <Loader2 size={48} className="text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300 text-lg">Gemini AI analiz yapıyor...</p>
          <p className="text-gray-500 text-sm mt-2">Bu işlem birkaç saniye sürebilir</p>
        </div>
      )}

      {/* GEÇMİŞ ANALİZLER */}
      <div className="bg-siem-card border border-siem-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 flex items-center justify-between hover:bg-siem-bg/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <History size={20} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">Geçmiş Analizler</h3>
            <span className="text-sm text-gray-400">({pastAnalyses.length})</span>
          </div>
          {showHistory ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-siem-border max-h-96 overflow-y-auto">
            {pastAnalyses.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>Henüz geçmiş analiz bulunmuyor</p>
              </div>
            ) : (
              <div className="divide-y divide-siem-border">
                {pastAnalyses.map((pastAnalysis) => (
                  <button
                    key={pastAnalysis.id}
                    onClick={() => selectPastAnalysis(pastAnalysis)}
                    className="w-full p-4 text-left hover:bg-siem-bg/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {pastAnalysis.status === 'success' ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            pastAnalysis.status === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {pastAnalysis.status === 'success' ? 'Başarılı' : 'Başarısız'}
                          </span>
                          {pastAnalysis.eventCount !== undefined && (
                            <span className="text-xs text-gray-500">
                              • {pastAnalysis.eventCount} event, {pastAnalysis.alarmCount || 0} alarm
                            </span>
                          )}
                        </div>
                        {pastAnalysis.analysis?.summary ? (
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {pastAnalysis.analysis.summary}
                          </p>
                        ) : pastAnalysis.error ? (
                          <p className="text-sm text-red-300 line-clamp-2">
                            {pastAnalysis.error}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">Analiz detayı bulunamadı</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatTime(pastAnalysis.createdAt || pastAnalysis.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AIAnalysis;
