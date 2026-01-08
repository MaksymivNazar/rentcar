import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CarCard.css';

function CarCard({ car, onBook }) {
  // Перевіряємо, чи авто зайняте саме зараз (дата закінчення оренди в майбутньому)
  const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();

  const handleBookClick = (e) => {
    // Зупиняємо перехід за посиланням при натисканні на кнопку
    e.preventDefault();
    e.stopPropagation();
    
    if (!isBusy && onBook) {
      onBook(car);
    }
  };

  return (
    <Link to={`/car/${car.id}`} className="car-card-link">
      <div className={`car-card ${isBusy ? 'car-card-busy' : ''}`}>
        
        {/* Бейджі доступності */}
        {!isBusy ? (
          <>
            {car.available && <div className="availability-badge">Доступний</div>}
            {car.new && <div className="car-badge new">НОВИНКА</div>}
            {car.discount && (
              <div className="car-badge discount">Акція -{car.discount}%</div>
            )}
          </>
        ) : (
          <div className="car-badge busy-badge" style={{ background: '#e74c3c' }}>
            В ОРЕНДІ
          </div>
        )}

        <div className="car-image">
          <img 
            src={car.image} 
            alt={car.name} 
            style={{ 
              filter: isBusy ? 'grayscale(100%) opacity(0.7)' : 'none',
              transition: 'filter 0.3s ease'
            }} 
          />
        </div>

        <div className="car-info">
          <h3>{car.name}</h3>
          <div className="car-price">
            <span className="current-price">від {car.price} $ / доба</span>
          </div>
          <button 
            className={`book-btn ${isBusy ? 'disabled' : ''}`}
            onClick={handleBookClick}
            disabled={isBusy}
            style={{ 
              background: isBusy ? '#95a5a6' : '',
              cursor: isBusy ? 'not-allowed' : 'pointer'
            }}
          >
            {isBusy ? 'Вже орендовано' : 'Бронювати'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default CarCard;