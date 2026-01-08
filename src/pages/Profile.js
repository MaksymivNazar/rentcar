import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RentCarAPI } from '../api'; // Використовуємо API
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. ЗАВАНТАЖЕННЯ ПРОФІЛЮ ТА БРОНЮВАНЬ ---
  useEffect(() => {
    const loadProfileData = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        // Запитуємо дані користувача та його бронювання через API
        const user = await RentCarAPI.auth.getCurrentUser();
        const userBookings = await RentCarAPI.rentals.getUserBookings();
        
        setUserData(user);
        setBookings(userBookings);
      } catch (err) {
        console.error("Помилка завантаження профілю:", err);
        // Якщо токен недійсний - на логін
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [navigate]);

  // --- 2. СКАСУВАННЯ БРОНЮВАННЯ ЧЕРЕЗ API ---
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      try {
        await RentCarAPI.rentals.cancel(bookingId);
        
        // Оновлюємо список після видалення
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        alert('Бронювання скасовано');
      } catch (err) {
        alert('Не вдалося скасувати бронювання');
      }
    }
  };

  if (loading) return <div className="profile-loading">Завантаження профілю...</div>;
  if (!userData) return null;

  return (
    <div className="profile">
      <div className="container">
        <h1>Мій профіль</h1>
        <div className="profile-content">
          <div className="profile-info">
            <h2>Особисті дані</h2>
            <div className="info-card">
              <div className="info-item"><span>Ім'я:</span> <span>{userData.name}</span></div>
              <div className="info-item"><span>Email:</span> <span>{userData.email}</span></div>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="logout-btn"
              style={{marginTop: '20px', padding: '10px', cursor: 'pointer'}}
            >
              Вийти з акаунту
            </button>
          </div>

          <div className="profile-bookings">
            <h2>Мої бронювання</h2>
            <div className="bookings-list">
              {bookings.length === 0 ? (
                <p>У вас поки немає активних бронювань.</p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-image"><img src={booking.carImage} alt="" /></div>
                    <div className="booking-info">
                      <h3>{booking.carName}</h3>
                      <div className="booking-details">
                        <div className="detail-item">
                          <span className="detail-label">ДАТА ПОЧАТКУ:</span>
                          <span className="detail-value">{new Date(booking.startDate).toLocaleDateString('uk-UA')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">ДАТА ЗАКІНЧЕННЯ:</span>
                          <span className="detail-value">{new Date(booking.endDate).toLocaleDateString('uk-UA')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">СТАТУС:</span>
                          <span className="detail-value status green-bold">Підтверджено</span>
                        </div>
                      </div>
                      <button className="cancel-booking-btn" onClick={() => handleDeleteBooking(booking.id)}>Скасувати</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;