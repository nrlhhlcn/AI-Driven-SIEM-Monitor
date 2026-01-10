import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UploadPage from './pages/UploadPage';
import ApiPage from './pages/ApiPage';
import SchedulePage from './pages/SchedulePage';
import GradesPage from './pages/GradesPage';
import CalendarPage from './pages/CalendarPage';
import { logWebTraffic } from './services/firebaseService';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Session kontrolü - eğer daha önce giriş yapıldıysa admin sayfasına yönlendir
    const authStatus = sessionStorage.getItem('authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setCurrentPage('admin');
    }
    // App.jsx'ten log atmayı kaldırdık - her sayfa kendi logunu atsın
  }, []);

  // Basit routing sistemi
  useEffect(() => {
    const path = window.location.pathname;
    const authStatus = sessionStorage.getItem('authenticated');
    
    if (path === '/admin' && authStatus === 'true') {
      setCurrentPage('admin');
      setIsAuthenticated(true);
    } else if (path === '/upload' && authStatus === 'true') {
      setCurrentPage('upload');
      setIsAuthenticated(true);
    } else if (path === '/api' && authStatus === 'true') {
      setCurrentPage('api');
      setIsAuthenticated(true);
    } else if (path === '/schedule' && authStatus === 'true') {
      setCurrentPage('schedule');
      setIsAuthenticated(true);
    } else if (path === '/grades' && authStatus === 'true') {
      setCurrentPage('grades');
      setIsAuthenticated(true);
    } else if (path === '/calendar' && authStatus === 'true') {
      setCurrentPage('calendar');
      setIsAuthenticated(true);
    } else if (path === '/login') {
      setCurrentPage('login');
      setIsAuthenticated(false);
    } else {
      // Varsayılan olarak login sayfası
      setCurrentPage('login');
      setIsAuthenticated(false);
      window.history.pushState({}, '', '/login');
    }
  }, []);

  // Admin sayfasına giriş yapıldığında session'a kaydet
  useEffect(() => {
    if (currentPage === 'admin') {
      sessionStorage.setItem('authenticated', 'true');
      setIsAuthenticated(true);
    }
  }, [currentPage]);

  return (
    <>
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'upload' && <UploadPage />}
      {currentPage === 'api' && <ApiPage />}
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'grades' && <GradesPage />}
      {currentPage === 'calendar' && <CalendarPage />}
    </>
  );
}

export default App;
