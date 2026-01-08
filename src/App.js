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

// Захист адмінки
const AdminRoute = ({ children }) => {
  // ПЕРЕВІРЯЄМО ОБИДВА ВАРІАНТИ КЛЮЧІВ ДЛЯ НАДІЙНОСТІ
  const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('user_data') || '{}');
  const token = localStorage.getItem('jwt_token');

  console.log("Current User Role:", user.role); // Щоб ти бачив у консолі, хто ти

  if (user.role === 'admin') {
    return children;
  } else {
    console.warn("Access denied: Not an admin");
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} /> 
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/conditions" element={<Conditions />} /> 
            <Route path="/contacts" element={<Contacts />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Шлях має збігатися з Link у Header */}
            <Route 
              path="/admin-panel" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />

            {/* Редирект якщо ввели туфту в URL */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <SupportChat />
        <Footer />
      </div>
    </Router>
  );
}

export default App;