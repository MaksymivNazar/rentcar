import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { RentCarAPI } from '../api'; // Наш пульт керування через крапку
import '../styles/Catalog.css';

const categories = {
  all: 'Всі авто',
  sport: 'Спорткари',
  business: 'Бізнес клас',
  premium: 'Преміум клас',
  suv: 'Позашляховики',
  bus: 'Мікроавтобуси',
  armored: 'Броньовані авто',
  electric: 'Електромобілі'
};

function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryFromUrl = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. ЗАВАНТАЖЕННЯ ДАНИХ ЧЕРЕЗ API ---
  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        // Викликаємо через крапку. 
        // Якщо бекенд не працює, спрацює наша заглушка в api/index.js
        const data = await RentCarAPI.cars.getAll();
        setAllCars(data);
      } catch (err) {
        console.error("Помилка завантаження каталогу:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  // Синхронізація категорії з URL
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  // --- 2. ФІЛЬТРАЦІЯ (залишається на фронті для швидкості) ---
  useEffect(() => {
    let filtered = [...allCars];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(car => car.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCars(filtered);
  }, [selectedCategory, searchTerm, allCars]);

  const handleCategoryClick = (key) => {
    setSelectedCategory(key);
    setSearchParams({ category: key });
  };

  const openBookingModal = (car) => {
    const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();
    if (isBusy) {
      alert("Це авто вже заброньоване!");
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  // --- 3. БРОНЮВАННЯ ЧЕРЕЗ API ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const bookingData = {
      carId: selectedCar.id,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate')
    };

    try {
      // Відправляємо запит на сервер через API
      await RentCarAPI.rentals.create(bookingData);
      
      alert(`Бронювання підтверджено!`);
      setShowBookingModal(false);
      navigate('/profile'); // Використовуємо navigate замість window.location
    } catch (err) {
      alert("Помилка бронювання. Перевірте з'єднання з сервером.");
    }
  };

  if (loading) return <div className="container"><h1>Завантаження каталогу...</h1></div>;

  return (
    <div className="catalog">
      <div className="container">
        <h1>Каталог автомобілів</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук моделі..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="catalog-filters">
          <div className="filter-buttons">
            {Object.entries(categories).map(([key, value]) => (
              <button
                key={key}
                className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => handleCategoryClick(key)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="cars-grid">
          {filteredCars.map(car => {
            const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();
            return (
              <div key={car.id} className="car-wrapper" style={{ position: 'relative', marginBottom: '30px' }}>
                {isBusy && (
                  <div className="busy-tag" style={{
                    position: 'absolute', top: '0', left: '0', width: '100%', zIndex: 10,
                    background: '#e74c3c', color: 'white', padding: '10px', 
                    textAlign: 'center', fontWeight: 'bold', borderRadius: '8px 8px 0 0'
                  }}>
                    НЕДОСТУПНО ДО {new Date(car.bookedUntil).toLocaleDateString('uk-UA')}
                  </div>
                )}
                <div style={{ opacity: isBusy ? 0.6 : 1 }}>
                  <CarCard car={car} onBook={() => openBookingModal(car)} />
                </div>
              </div>
            );
          })}
        </div>
        {filteredCars.length === 0 && <p>Автомобілів не знайдено.</p>}
      </div>

      {showBookingModal && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000}}>
          <div className="modal-content" style={{background:'white', padding:'30px', borderRadius:'15px', width:'400px'}}>
            <h2>Бронювання: {selectedCar?.name}</h2>
            <form onSubmit={handleBookingSubmit}>
              <label>Дата початку:</label>
              <input type="date" name="startDate" required style={{width:'100%', padding:'8px', margin:'10px 0'}} />
              <label>Дата закінчення:</label>
              <input type="date" name="endDate" required style={{width:'100%', padding:'8px', margin:'10px 0'}} />
              <button type="submit" style={{width:'100%', padding:'10px', background:'#27ae60', color:'white', border:'none', borderRadius:'5px', marginTop:'10px', fontWeight:'bold'}}>ПІДТВЕРДИТИ</button>
              <button type="button" onClick={() => setShowBookingModal(false)} style={{width:'100%', background:'none', border:'none', marginTop:'10px', cursor:'pointer'}}>Закрити</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;