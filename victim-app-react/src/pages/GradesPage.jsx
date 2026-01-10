import { useState, useEffect } from 'react';
import { logWebTraffic } from '../services/firebaseService';

const GradesPage = () => {
  const [selectedSemester, setSelectedSemester] = useState('2024-2025 Bahar');

  useEffect(() => {
    const hasLogged = sessionStorage.getItem('gradesPageVisited');
    if (!hasLogged) {
      logWebTraffic('/grades').catch(() => {});
      sessionStorage.setItem('gradesPageVisited', 'true');
    }
  }, []);

  const semesters = ['2024-2025 Bahar', '2024-2025 Güz', '2023-2024 Yaz'];

  const courses = {
    '2024-2025 Bahar': [
      { code: 'BIL401', name: 'Veri Yapıları ve Algoritmalar', credit: 4, grade: 'AA', point: 4.0, status: 'Geçti' },
      { code: 'BIL402', name: 'Web Programlama', credit: 3, grade: 'BA', point: 3.5, status: 'Geçti' },
      { code: 'BIL403', name: 'Veritabanı Yönetim Sistemleri', credit: 4, grade: 'BB', point: 3.0, status: 'Geçti' },
      { code: 'BIL404', name: 'Yapay Zeka Temelleri', credit: 3, grade: 'AA', point: 4.0, status: 'Geçti' },
      { code: 'BIL405', name: 'Bilgisayar Ağları', credit: 3, grade: 'CB', point: 2.5, status: 'Geçti' },
      { code: 'BIL406', name: 'Yazılım Mühendisliği', credit: 3, grade: 'BA', point: 3.5, status: 'Geçti' },
    ],
    '2024-2025 Güz': [
      { code: 'BIL301', name: 'Programlama Dilleri', credit: 4, grade: 'AA', point: 4.0, status: 'Geçti' },
      { code: 'BIL302', name: 'Nesne Yönelimli Programlama', credit: 4, grade: 'BA', point: 3.5, status: 'Geçti' },
      { code: 'BIL303', name: 'İşletim Sistemleri', credit: 3, grade: 'BB', point: 3.0, status: 'Geçti' },
      { code: 'BIL304', name: 'Bilgisayar Mimarisi', credit: 3, grade: 'AA', point: 4.0, status: 'Geçti' },
    ],
    '2023-2024 Yaz': [
      { code: 'BIL201', name: 'Algoritma ve Programlama', credit: 4, grade: 'AA', point: 4.0, status: 'Geçti' },
      { code: 'BIL202', name: 'Ayrık Matematik', credit: 3, grade: 'BA', point: 3.5, status: 'Geçti' },
    ],
  };

  const calculateGPA = (semester) => {
    const semesterCourses = courses[semester] || [];
    if (semesterCourses.length === 0) return { gpa: 0, totalCredit: 0 };
    
    const totalPoints = semesterCourses.reduce((sum, course) => sum + (course.point * course.credit), 0);
    const totalCredit = semesterCourses.reduce((sum, course) => sum + course.credit, 0);
    const gpa = totalCredit > 0 ? totalPoints / totalCredit : 0;
    
    return { gpa: gpa.toFixed(2), totalCredit };
  };

  const { gpa, totalCredit } = calculateGPA(selectedSemester);

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
          <a href="/grades" className="px-4 py-2 bg-cyan-500 rounded-lg text-white text-sm font-medium">
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
            <i className="fas fa-graduation-cap text-5xl text-cyan-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Not Görüntüleme</h1>
            <p className="text-gray-600">Demo Bakırçay Üniversitesi - Akademik Notlar</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {semesters.map((semester) => (
              <button
                key={semester}
                onClick={() => setSelectedSemester(semester)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedSemester === semester
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {semester}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-xl text-white">
              <i className="fas fa-calculator text-3xl mb-3"></i>
              <h3 className="text-2xl font-bold mb-1">{gpa}</h3>
              <p className="text-cyan-100">Dönem Not Ortalaması (GPA)</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <i className="fas fa-book text-3xl mb-3"></i>
              <h3 className="text-2xl font-bold mb-1">{totalCredit}</h3>
              <p className="text-blue-100">Toplam Kredi</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <i className="fas fa-check-circle text-3xl mb-3"></i>
              <h3 className="text-2xl font-bold mb-1">{courses[selectedSemester]?.length || 0}</h3>
              <p className="text-green-100">Ders Sayısı</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <th className="px-6 py-4 text-left rounded-tl-xl">Ders Kodu</th>
                  <th className="px-6 py-4 text-left">Ders Adı</th>
                  <th className="px-6 py-4 text-center">Kredi</th>
                  <th className="px-6 py-4 text-center">Harf Notu</th>
                  <th className="px-6 py-4 text-center">Not Puanı</th>
                  <th className="px-6 py-4 text-center rounded-tr-xl">Durum</th>
                </tr>
              </thead>
              <tbody>
                {courses[selectedSemester]?.map((course, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-cyan-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{course.code}</td>
                    <td className="px-6 py-4 text-gray-700">{course.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{course.credit}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-bold ${
                        course.grade === 'AA' ? 'bg-green-100 text-green-800' :
                        course.grade === 'BA' ? 'bg-blue-100 text-blue-800' :
                        course.grade === 'BB' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{course.point}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-medium ${
                        course.status === 'Geçti' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;
