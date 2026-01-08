import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { cars as initialCars } from '../data/cars';
import '../styles/Home.css';

function Home() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const token = localStorage.getItem('jwt_token');

  // ФУНКЦІЯ СИНХРОНІЗАЦІЇ (ВИПРАВЛЕНО: додано перевірку броні)
  const loadCars = () => {
    const savedCars = JSON.parse(localStorage.getItem('persistent_cars')) || initialCars;
    const userBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');

    // Проходимо по кожній машині і додаємо їй дату закінчення броні, якщо вона є
    const updatedData = savedCars.map(car => {
      const booking = userBookings.find(b => String(b.carId) === String(car.id));
      return booking ? { ...car, bookedUntil: booking.endDate } : { ...car, bookedUntil: null };
    });

    setAllCars(updatedData);
  };

  useEffect(() => {
    loadCars();
    window.addEventListener('storage', loadCars);
    return () => window.removeEventListener('storage', loadCars);
  }, []);

  const featuredCars = allCars.filter(car => car.featured);
  const newCars = allCars.filter(car => car.new);

  const handleBook = (car) => {
    if (car.bookedUntil) {
      alert('Це авто вже заброньоване!');
      return;
    }
    if (!token) {
      alert('Будь ласка, увійдіть або зареєструйтесь для бронювання');
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const phone = formData.get('phone');

    const booking = {
      id: Date.now(),
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      startDate: startDate,
      endDate: endDate,
      phone: phone,
      price: selectedCar.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    localStorage.setItem('user_bookings', JSON.stringify([booking, ...existingBookings]));

    alert('Бронювання успішно відправлено!');
    setShowBookingModal(false);
    setSelectedCar(null);
    
    // Оновлюємо стан сторінки відразу
    loadCars();
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h2>НОВИНКИ СЕЗОНУ 2025</h2>
          <div className="cars-grid">
            {newCars.map(car => {
              const isBusy = !!car.bookedUntil;
              return (
                <div key={car.id} style={{ position: 'relative', opacity: isBusy ? 0.6 : 1 }}>
                  {isBusy && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 5,
                      background: '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px'
                    }}>
                      Зайнято до {new Date(car.bookedUntil).toLocaleDateString()}
                    </div>
                  )}
                  <CarCard car={car} onBook={() => handleBook(car)} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="featured-cars">
        <div className="container">
          <h2>Популярні авто</h2>
          <div className="cars-grid">
            {featuredCars.map(car => {
              const isBusy = !!car.bookedUntil;
              return (
                <div key={car.id} style={{ position: 'relative', opacity: isBusy ? 0.6 : 1 }}>
                  {isBusy && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 5,
                      background: '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px'
                    }}>
                      Зайнято
                    </div>
                  )}
                  <CarCard car={car} onBook={() => handleBook(car)} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Категорії</h2>
          <div className="categories-grid">
            <Link to="/catalog?category=sport" className="category-card"><h3>Спорткари</h3></Link>
            <Link to="/catalog?category=business" className="category-card"><h3>Бізнес клас</h3></Link>
            <Link to="/catalog?category=premium" className="category-card"><h3>Преміум клас</h3></Link>
            <Link to="/catalog?category=suv" className="category-card"><h3>Позашляховики</h3></Link>
            <Link to="/catalog?category=minibus" className="category-card"><h3>Мікроавтобуси</h3></Link>
            <Link to="/catalog?category=armored" className="category-card"><h3>Броньовані авто</h3></Link>
          </div>
        </div>
      </section>

      {showBookingModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            <h2>Бронювання {selectedCar.name}</h2>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Дата початку оренди:</label>
                <input type="date" name="startDate" required />
              </div>
              <div className="form-group">
                <label>Дата закінчення оренди:</label>
                <input type="date" name="endDate" required />
              </div>
              <div className="form-group">
                <label>Телефон:</label>
                <input type="tel" name="phone" placeholder="+38 (0XX) XXX XX XX" required />
              </div>
              <button type="submit" className="submit-btn">Забронювати</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;