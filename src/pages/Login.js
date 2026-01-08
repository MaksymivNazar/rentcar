import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RentCarAPI } from '../api'; // Наш API інтерфейс
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // --- 1. ВИКЛИК API ЗАМІСТЬ ПРЯМОГО LOCALSTORAGE ---
      // Відправляємо дані на "сервер"
      const response = await RentCarAPI.auth.login({ email, password });
      
      // Наше API всередині само збереже токен і дані юзера, 
      // тому нам тут залишається тільки логіка перенаправлення
      
      alert(response.user.role === 'admin' ? 'Вхід виконано (Адмін)' : 'Успішний вхід!');
      
      // --- 2. РЕДИРЕКТ ЗАЛЕЖНО ВІД РОЛІ ---
      if (response.user.role === 'admin') {
        navigate('/admin-panel');
      } else {
        navigate('/profile');
      }

      // Оновлюємо сторінку, щоб хедер побачив новий токен
      window.location.reload();
      
    } catch (err) {
      alert('Помилка входу: перевірте пошту або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Вхід</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={loading}
              placeholder="admin@olimp.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={loading}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
        <p className="auth-link">
          Немає акаунту? <Link to="/register">Зареєструватись</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;