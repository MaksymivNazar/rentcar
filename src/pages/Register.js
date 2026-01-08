import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RentCarAPI } from '../api'; // Підключаємо наш API інтерфейс
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валідація на рівні фронтенду
    if (formData.password !== formData.confirmPassword) {
      alert('Паролі не співпадають!');
      return;
    }

    setLoading(true);

    try {
      // --- ВИКЛИК API ДЛЯ РЕЄСТРАЦІЇ ---
      // Відправляємо об'єкт без confirmPassword, бо серверу він не потрібен
      const { confirmPassword, ...registerData } = formData;
      
      const response = await RentCarAPI.auth.register(registerData);
      
      alert('Реєстрація успішна!');
      
      // Перенаправлення на головну
      navigate('/');
      
      // Оновлюємо сторінку для коректного відображення стану авторизації в хедері
      window.location.reload();
      
    } catch (err) {
      alert('Помилка реєстрації. Можливо, такий Email вже існує.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Реєстрація</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ім'я:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>Телефон:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="+38 (0XX) XXX XX XX"
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>Підтвердження пароля:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Створення акаунту...' : 'Зареєструватись'}
          </button>
        </form>
        <p className="auth-link">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;