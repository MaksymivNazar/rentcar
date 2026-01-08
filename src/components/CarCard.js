import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CarCard.css';

function CarCard({ car, onBook }) {
  const isBusy = !!car.bookedUntil;

  const handleBookClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy && onBook) {
      onBook(car);
    }
  };

  return (
    <Link to={`/car/${car.id}`} className="car-card-link">
      <div className="car-card">
        {/* Бейдж доступності: показуємо зелений тільки якщо реально вільно */}
        {!isBusy && car.available && (
          <div className="availability-badge">Доступний</div>
        )}
        
        {car.new && !isBusy && <div className="car-badge new">НОВИНКА</div>}
        {car.discount && !isBusy && (
          <div className="car-badge discount">Акція -{car.discount}%</div>
        )}

        <div className="car-image">
          <img src={car.image} alt={car.name} style={{ filter: isBusy ? 'grayscale(1)' : 'none' }} />
        </div>

        <div className="car-info">
          <h3>{car.name}</h3>
          <div className="car-price">
            <span className="current-price">від {car.price} $</span>
          </div>
          <button 
            className={`book-btn ${isBusy ? 'disabled' : ''}`}
            onClick={handleBookClick}
            disabled={isBusy}
            style={{ background: isBusy ? '#95a5a6' : '' }}
          >
            {isBusy ? 'Орендовано' : 'Бронювати'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default CarCard;