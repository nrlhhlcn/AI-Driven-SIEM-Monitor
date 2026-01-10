import { useState, useEffect } from 'react';
import { logWebTraffic } from '../services/firebaseService';

const CalendarPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const hasLogged = sessionStorage.getItem('calendarPageVisited');
    if (!hasLogged) {
      logWebTraffic('/calendar').catch(() => {});
      sessionStorage.setItem('calendarPageVisited', 'true');
    }
  }, []);

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const events = [
    { date: '15 Mart', title: 'Burs Başvuruları Son Gün', type: 'deadline', color: 'red' },
    { date: '20 Mart', title: 'Yarıyıl Sınavları Başlangıç', type: 'exam', color: 'orange' },
    { date: '25 Mart', title: 'Ders Kayıt Dönemi Başlangıç', type: 'registration', color: 'blue' },
    { date: '1 Nisan', title: 'Yarıyıl Sınavları Bitiş', type: 'exam', color: 'orange' },
    { date: '5 Nisan', title: 'Notların Açıklanması', type: 'announcement', color: 'green' },
    { date: '10 Nisan', title: 'Bahar Dönemi Başlangıç', type: 'semester', color: 'purple' },
    { date: '23 Nisan', title: 'Ulusal Egemenlik ve Çocuk Bayramı', type: 'holiday', color: 'red' },
    { date: '1 Mayıs', title: 'Emek ve Dayanışma Günü', type: 'holiday', color: 'red' },
    { date: '19 Mayıs', title: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', type: 'holiday', color: 'red' },
    { date: '15 Haziran', title: 'Final Sınavları Başlangıç', type: 'exam', color: 'orange' },
    { date: '25 Haziran', title: 'Final Sınavları Bitiş', type: 'exam', color: 'orange' },
    { date: '30 Haziran', title: 'Dönem Sonu', type: 'semester', color: 'purple' },
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'deadline': return 'fa-calendar-times';
      case 'exam': return 'fa-clipboard-list';
      case 'registration': return 'fa-user-plus';
      case 'announcement': return 'fa-bullhorn';
      case 'semester': return 'fa-graduation-cap';
      case 'holiday': return 'fa-calendar-day';
      default: return 'fa-calendar';
    }
  };

  const getEventColorClass = (color) => {
    const colors = {
      red: 'bg-red-100 border-red-500 text-red-800',
      orange: 'bg-orange-100 border-orange-500 text-orange-800',
      blue: 'bg-blue-100 border-blue-500 text-blue-800',
      green: 'bg-green-100 border-green-500 text-green-800',
      purple: 'bg-purple-100 border-purple-500 text-purple-800',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
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
          <a href="/calendar" className="px-4 py-2 bg-cyan-500 rounded-lg text-white text-sm font-medium">
            <i className="fas fa-calendar-check mr-2"></i>Akademik Takvim
          </a>
          <a href="/upload" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-cloud-upload-alt mr-2"></i>Ödev Yükle
          </a>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <i className="fas fa-calendar-check text-5xl text-cyan-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Akademik Takvim</h1>
            <p className="text-gray-600">Demo Bakırçay Üniversitesi - 2024-2025 Akademik Yılı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-xl text-white">
              <i className="fas fa-clock text-3xl mb-3"></i>
              <h3 className="text-xl font-bold mb-1">Aktif Dönem</h3>
              <p className="text-cyan-100">2024-2025 Bahar Dönemi</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <i className="fas fa-calendar-alt text-3xl mb-3"></i>
              <h3 className="text-xl font-bold mb-1">Toplam Etkinlik</h3>
              <p className="text-green-100">{events.length} Önemli Tarih</p>
            </div>
          </div>

          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className={`border-l-4 p-5 rounded-lg ${getEventColorClass(event.color)} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <i className={`fas ${getEventIcon(event.type)} text-xl text-${event.color}-600`}></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg">{event.date}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${event.color}-200 text-${event.color}-900`}>
                        {event.type === 'deadline' ? 'Son Tarih' :
                         event.type === 'exam' ? 'Sınav' :
                         event.type === 'registration' ? 'Kayıt' :
                         event.type === 'announcement' ? 'Duyuru' :
                         event.type === 'semester' ? 'Dönem' :
                         'Tatil'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-blue-500 text-lg mt-0.5"></i>
                <div>
                  <p className="text-blue-800 font-medium text-sm mb-1">Önemli Not</p>
                  <p className="text-blue-700 text-xs">
                    Akademik takvimde değişiklikler olabilir. Güncel bilgiler için lütfen resmi duyuruları takip ediniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
