import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (e) {
        setUserData({});
      }
    }

    const savedBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    setBookings(savedBookings);
  }, [navigate]);

  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      const bookingToRemove = bookings.find(b => b.id === bookingId);
      
      if (bookingToRemove) {
        const allCars = JSON.parse(localStorage.getItem('persistent_cars') || '[]');
        const updatedCars = allCars.map(car => {
          if (car.id === bookingToRemove.carId) {
            const { bookedUntil, ...rest } = car;
            return rest;
          }
          return car;
        });
        localStorage.setItem('persistent_cars', JSON.stringify(updatedCars));
      }

      localStorage.setItem('user_bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    }
  };

  if (!userData) return <div className="profile-loading">Завантаження...</div>;

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
          </div>

          <div className="profile-bookings">
            <h2>Мої бронювання</h2>
            <div className="bookings-list">
              {bookings.map(booking => (
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
                        {/* ТУТ ТІЛЬКИ ЦЕЙ КЛАС І ТЕКСТ */}
                        <span className="detail-value status green-bold">
                          Виконано
                        </span>
                      </div>
                    </div>
                    <button className="cancel-booking-btn" onClick={() => handleDeleteBooking(booking.id)}>Скасувати</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;