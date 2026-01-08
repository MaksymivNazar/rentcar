import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ПЕРЕВІРКА НА АДМІНА
    const isAdmin = email === 'admin@olimp.com' && password === 'admin777';
    
    // Симуляция авторизации
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    // Створюємо дані користувача (зберігаємо твою логіку + роль)
    const userData = {
      name: isAdmin ? 'Адміністратор' : email.split('@')[0],
      email: email,
      phone: '',
      role: isAdmin ? 'admin' : 'user'
    };
    
    localStorage.setItem('user_data', JSON.stringify(userData));

    if (!localStorage.getItem('user_bookings')) {
      localStorage.setItem('user_bookings', JSON.stringify([]));
    }
    
    localStorage.setItem('jwt_token', mockToken);
    
    alert(isAdmin ? 'Вхід виконано (Адмін)' : 'Успішний вхід!');
    
    // Редирект залежно від ролі
    isAdmin ? navigate('/admin-panel') : navigate('/');
    
    window.location.reload();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Вхід</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Увійти</button>
        </form>
        <p className="auth-link">
          Немає акаунту? <Link to="/register">Зареєструватись</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;