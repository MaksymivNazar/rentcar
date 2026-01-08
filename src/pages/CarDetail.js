import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RentCarAPI } from '../api'; // Твій новий інтерфейс "через крапку"
import '../styles/CarDetail.css';
import 'leaflet/dist/leaflet.css';

// Налаштування іконок карти
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const token = localStorage.getItem('jwt_token');

  // --- 1. Отримання даних через API ---
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        // Бекендщик змінить логіку в RentCarAPI.cars.getById, 
        // а тут код залишиться таким самим
        const data = await RentCarAPI.cars.getById(id);
        
        if (!data) {
          navigate('/catalog');
          return;
        }
        setCar(data);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, navigate]);

  // --- 2. Бронювання через API ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const bookingPayload = {
      carId: car.id,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate')
    };

    try {
      await RentCarAPI.rentals.create(bookingPayload);
      alert('Бронювання підтверджено!');
      navigate('/profile');
    } catch (err) {
      alert('Помилка при створенні бронювання');
    }
  };

  if (loading) return <div className="car-detail-loading">Завантаження...</div>;
  if (!car) return null;

  // Перевірка чи авто зайняте (враховуємо дані з API)
  const isBusy = car.bookedUntil && new Date(car.bookedUntil) > new Date();

  return (
    <div className="car-detail">
      <div className="container">
        <Link to="/catalog" className="back-link">← Назад до каталогу</Link>
        
        <div className="car-detail-content">
          <div className="car-detail-image">
            <img src={car.image} alt={car.name} style={{ filter: isBusy ? 'grayscale(0.5)' : 'none' }} />
            {isBusy && (
              <div className="availability-badge busy" style={{background: '#e74c3c', color: '#fff'}}>
                НЕДОСТУПНО ДО {new Date(car.bookedUntil).toLocaleDateString('uk-UA')}
              </div>
            )}
          </div>

          <div className="car-detail-info">
            <div className="car-header">
              <div className="brand-badge">{car.brand} {car.model}</div>
              <h1>{car.name}</h1>
              <div className="car-price-section">
                <span className="current-price">${car.price}</span>
                <span className="price-label">/ доба</span>
              </div>
            </div>
            
            <div className="car-actions">
              <button 
                className="book-btn" 
                disabled={isBusy}
                onClick={() => token ? setShowBookingModal(true) : alert('Будь ласка, увійдіть в акаунт')}
                style={{ background: isBusy ? '#95a5a6' : '#007bff' }}
              >
                {isBusy ? 'Вже орендовано' : 'Забронювати'}
              </button>
              <button className="track-btn" onClick={() => setShowTracking(true)}>
                Відстежити авто
              </button>
            </div>

            <div className="car-specs">
              <h2>Технічні характеристики</h2>
              <div className="specs-grid">
                {/* Використовуємо універсальні назви полів, які підготували в API */}
                <div className="spec-item"><span className="spec-label">Клас</span><span className="spec-value">{car.class}</span></div>
                <div className="spec-item"><span className="spec-label">Рік</span><span className="spec-value">{car.year}</span></div>
                <div className="spec-item"><span className="spec-label">Двигун</span><span className="spec-value">{car.engine}</span></div>
                <div className="spec-item"><span className="spec-label">Потужність</span><span className="spec-value">{car.power || car.horsepower} к.с.</span></div>
                <div className="spec-item"><span className="spec-label">Трансмісія</span><span className="spec-value">{car.transmission}</span></div>
                <div className="spec-item"><span className="spec-label">Паливо</span><span className="spec-value">{car.fuelType}</span></div>
              </div>
            </div>

            <div className="car-description">
              <h2>Про автомобіль</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{car.description}</p>
            </div>

            {car.options && (
              <div className="car-options">
                <h2>Комплектація</h2>
                <div className="options-list">
                  {(Array.isArray(car.options) ? car.options : car.options.split(',')).map((opt, index) => (
                    <span key={index} className="option-badge">✓ {opt.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалки залишаються такими ж за структурою, але працюють через handleBookingSubmit */}
      {showBookingModal && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000}}>
           <div className="modal-content" style={{background:'white', padding:'30px', borderRadius:'15px', width:'400px'}}>
              <h2>Оренда {car.name}</h2>
              <form onSubmit={handleBookingSubmit}>
                <label>Дата початку:</label>
                <input type="date" name="startDate" required style={{width:'100%', padding:'10px', marginBottom:'15px'}} />
                <label>Дата закінчення:</label>
                <input type="date" name="endDate" required style={{width:'100%', padding:'10px', marginBottom:'15px'}} />
                <button type="submit" className="confirm-btn" style={{width:'100%', padding:'12px', background:'#27ae60', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold'}}>ПІДТВЕРДИТИ</button>
                <button type="button" onClick={() => setShowBookingModal(false)} style={{width:'100%', marginTop:'10px', background:'none', border:'none', cursor:'pointer'}}>Скасувати</button>
              </form>
           </div>
        </div>
      )}

      {showTracking && (
        <div className="modal-overlay" onClick={() => setShowTracking(false)} style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000}}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{background:'white', padding:'20px', borderRadius:'15px', width:'90%', maxWidth:'800px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                <h2>GPS-трекер: {car.name}</h2>
                <button onClick={() => setShowTracking(false)} style={{fontSize:'24px', border:'none', background:'none', cursor:'pointer'}}>×</button>
              </div>
              <TrackingMap car={car} />
          </div>
        </div>
      )}
    </div>
  );
}

// Карта трекінгу
function TrackingMap({ car }) {
  const [position, setPosition] = useState([50.4501, 30.5234]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => [prev[0] + (Math.random() - 0.5) * 0.001, prev[1] + (Math.random() - 0.5) * 0.001]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tracking-map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={L.divIcon({html:'🚗', className:'custom-car-icon', iconSize:[30,30]})}>
          <Popup>{car.name} в русі</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default CarDetail;