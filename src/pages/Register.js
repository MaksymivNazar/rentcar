import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Паролі не співпадають!');
      return;
    }

    // Симуляция регистрации - генерируем JWT токен
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    // Сохраняем данные пользователя
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };
    
    localStorage.setItem('jwt_token', mockToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_bookings', JSON.stringify([]));
    
    alert('Реєстрація успішна! JWT токен збережено.');
    navigate('/');
    window.location.reload();
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
              required
            />
          </div>
          <button type="submit" className="auth-btn">Зареєструватись</button>
        </form>
        <p className="auth-link">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

