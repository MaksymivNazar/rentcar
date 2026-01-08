import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Компоненти інтерфейсу
import Header from './components/Header';
import Footer from './components/Footer';

// СТОРІНКИ
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CarDetail from './pages/CarDetail';
import Conditions from './pages/Conditions';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Адмінка та чат
import AdminPanel from './admin/AdminPanel';
import SupportChat from './components/SupportChat';

// --- ЗАХИСТ АДМІНКИ ---
const AdminRoute = ({ children }) => {
  // Використовуємо тільки той ключ, який прописали в RentCarAPI
  const userStr = localStorage.getItem('user_data');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('jwt_token');

  // Виводимо в консоль для діагностики при розробці
  console.log("Admin Check - Role:", user?.role, "Auth:", !!token);

  if (token && user?.role === 'admin') {
    return children;
  } else {
    console.warn("Access denied: Redirecting to login");
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            {/* Публічні маршрути */}
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} /> 
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/conditions" element={<Conditions />} /> 
            <Route path="/contacts" element={<Contacts />} />
            
            {/* Авторизація */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Захищений маршрут адміна */}
            <Route 
              path="/admin-panel" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />

            {/* Редирект для неіснуючих сторінок (404) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <SupportChat />
        <Footer />
      </div>
    </Router>
  );
}

export default App;