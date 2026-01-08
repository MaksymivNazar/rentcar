import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { RentCarAPI } from '../api'; // Використовуємо наш єдиний інтерфейс
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('jwt_token');

  // --- 1. ЗАВАНТАЖЕННЯ ДАНИХ ЧЕРЕЗ API ---
  const loadData = async () => {
    try {
      setLoading(true);
      // Просто викликаємо метод. Логіка "звідки взяти дані" тепер всередині api/index.js
      const data = await RentCarAPI.cars.getAll();
      setAllCars(data);
    } catch (err) {
      console.error("Помилка при завантаженні авто на головній:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Фільтрація (тепер це просто обробка отриманих від API даних)
  const featuredCars = allCars.filter(car => car.featured);
  const newCars = allCars.filter(car => car.new);

  const handleBook = (car) => {
    // Перевірка зайнятості за датою (з бекенду прийде bookedUntil)
    const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();
    
    if (isBusy) {
      alert('Це авто вже заброньоване!');
      return;
    }
    if (!token) {
      alert('Будь ласка, увійдіть або зареєструйтесь для бронювання');
      navigate('/login');
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  // --- 2. БРОНЮВАННЯ ЧЕРЕЗ API ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const bookingPayload = {
      carId: selectedCar.id,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      phone: formData.get('phone')
    };

    try {
      // Відправляємо запит на сервер через API
      await RentCarAPI.rentals.create(bookingPayload);
      alert('Бронювання успішно відправлено!');
      setShowBookingModal(false);
      setSelectedCar(null);
      
      // Оновлюємо дані, щоб статус авто змінився на "Зайнято"
      loadData();
    } catch (err) {
      alert('Сталася помилка при бронюванні.');
    }
  };

  if (loading) return <div className="loading">Завантаження...</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h2>НОВИНКИ СЕЗОНУ 2026</h2>
          <div className="cars-grid">
            {newCars.map(car => {
              const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();
              return (
                <div key={car.id} className="car-wrapper" style={{ position: 'relative', opacity: isBusy ? 0.6 : 1 }}>
                  {isBusy && (
                    <div className="status-label">
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
              const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();
              return (
                <div key={car.id} className="car-wrapper" style={{ position: 'relative', opacity: isBusy ? 0.6 : 1 }}>
                  {isBusy && <div className="status-label">Зайнято</div>}
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
            <Link to="/catalog?category=bus" className="category-card"><h3>Мікроавтобуси</h3></Link>
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