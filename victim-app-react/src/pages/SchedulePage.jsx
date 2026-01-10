import { useState, useEffect } from 'react';
import { logWebTraffic } from '../services/firebaseService';

const SchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState('Pazartesi');

  useEffect(() => {
    const hasLogged = sessionStorage.getItem('schedulePageVisited');
    if (!hasLogged) {
      logWebTraffic('/schedule').catch(() => {});
      sessionStorage.setItem('schedulePageVisited', 'true');
    }
  }, []);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  
  const schedule = {
    'Pazartesi': [
      { time: '09:00-10:30', course: 'Veri Yapıları ve Algoritmalar', room: 'A-101', instructor: 'Prof. Dr. Ahmet Yılmaz' },
      { time: '11:00-12:30', course: 'Web Programlama', room: 'B-205', instructor: 'Doç. Dr. Ayşe Demir' },
      { time: '14:00-15:30', course: 'Veritabanı Yönetim Sistemleri', room: 'C-301', instructor: 'Dr. Öğr. Üyesi Mehmet Kaya' },
    ],
    'Salı': [
      { time: '09:00-10:30', course: 'Yapay Zeka Temelleri', room: 'A-102', instructor: 'Prof. Dr. Fatma Şahin' },
      { time: '11:00-12:30', course: 'Bilgisayar Ağları', room: 'B-206', instructor: 'Doç. Dr. Can Özkan' },
    ],
    'Çarşamba': [
      { time: '09:00-10:30', course: 'Yazılım Mühendisliği', room: 'A-103', instructor: 'Prof. Dr. Zeynep Arslan' },
      { time: '11:00-12:30', course: 'Güvenlik Sistemleri', room: 'B-207', instructor: 'Dr. Öğr. Üyesi Ali Veli' },
      { time: '14:00-15:30', course: 'Proje Yönetimi', room: 'C-302', instructor: 'Doç. Dr. Elif Yıldız' },
    ],
    'Perşembe': [
      { time: '09:00-10:30', course: 'Veri Yapıları ve Algoritmalar', room: 'A-101', instructor: 'Prof. Dr. Ahmet Yılmaz' },
      { time: '14:00-15:30', course: 'Web Programlama Lab', room: 'Lab-1', instructor: 'Doç. Dr. Ayşe Demir' },
    ],
    'Cuma': [
      { time: '09:00-10:30', course: 'Yapay Zeka Temelleri', room: 'A-102', instructor: 'Prof. Dr. Fatma Şahin' },
      { time: '11:00-12:30', course: 'Bilgisayar Ağları Lab', room: 'Lab-2', instructor: 'Doç. Dr. Can Özkan' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigasyon Menüsü */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          <a href="/admin" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-home mr-2"></i>Ana Sayfa
          </a>
          <a href="/schedule" className="px-4 py-2 bg-cyan-500 rounded-lg text-white text-sm font-medium">
            <i className="fas fa-calendar-alt mr-2"></i>Ders Programı
          </a>
          <a href="/grades" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-graduation-cap mr-2"></i>Notlarım
          </a>
          <a href="/calendar" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-calendar-check mr-2"></i>Akademik Takvim
          </a>
          <a href="/upload" className="px-4 py-2 bg-white/90 rounded-lg text-gray-700 hover:bg-cyan-500 hover:text-white transition-all text-sm font-medium">
            <i className="fas fa-cloud-upload-alt mr-2"></i>Ödev Yükle
          </a>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <i className="fas fa-calendar-alt text-5xl text-cyan-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Ders Programı</h1>
            <p className="text-gray-600">Demo Bakırçay Üniversitesi - 2024-2025 Bahar Dönemi</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {schedule[selectedDay]?.length > 0 ? (
              schedule[selectedDay].map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border-l-4 border-cyan-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-cyan-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                          {item.time}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">{item.course}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <i className="fas fa-door-open text-cyan-600"></i>
                          {item.room}
                        </span>
                        <span className="flex items-center gap-2">
                          <i className="fas fa-user-tie text-cyan-600"></i>
                          {item.instructor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <i className="fas fa-calendar-times text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-600 font-medium">Bu gün için ders bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
