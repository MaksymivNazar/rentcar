import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { cars as initialCars } from '../data/cars';
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
  const categoryFromUrl = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCars, setAllCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // СИНХРОНІЗАЦІЯ ДАНИХ ПРИ КОЖНОМУ ВХОДІ В КАТАЛОГ
  useEffect(() => {
    const syncCars = () => {
      const savedAdminCars = JSON.parse(localStorage.getItem('persistent_cars')) || initialCars;
      const userBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');

      const updatedData = savedAdminCars.map(car => {
        const booking = userBookings.find(b => String(b.carId) === String(car.id));
        return booking ? { ...car, bookedUntil: booking.endDate } : { ...car, bookedUntil: null };
      });
      setAllCars(updatedData);
    };

    syncCars();
  }, []); // Спрацьовує при монтуванні компонента

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

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
    if (car.bookedUntil) {
      alert("Це авто вже заброньоване!");
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const endDate = formData.get('endDate');
    const startDate = formData.get('startDate');

    const newBooking = {
      id: Date.now(),
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image,
      startDate: startDate,
      endDate: endDate,
      status: 'Виконано', 
      price: selectedCar.price,
      createdAt: new Date().toISOString()
    };

    const userBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    localStorage.setItem('user_bookings', JSON.stringify([newBooking, ...userBookings]));

    // Оновлюємо стан локально
    const updatedCars = allCars.map(car => 
      String(car.id) === String(selectedCar.id) ? { ...car, bookedUntil: endDate } : car
    );
    
    setAllCars(updatedCars);
    localStorage.setItem('persistent_cars', JSON.stringify(updatedCars));

    alert(`Бронювання підтверджено!`);
    setShowBookingModal(false);
    window.location.href = '/profile'; 
  };

  return (
    <div className="catalog">
      <div className="container">
        <h1>Каталог автомобілів</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук..."
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
            const isBusy = !!car.bookedUntil;
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
                <div style={{ opacity: isBusy ? 0.5 : 1 }}>
                  <CarCard car={car} onBook={() => openBookingModal(car)} />
                </div>
              </div>
            );
          })}
        </div>
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
              <button type="button" onClick={() => setShowBookingModal(false)} style={{width:'100%', background:'none', border:'none', marginTop:'10px'}}>Закрити</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;