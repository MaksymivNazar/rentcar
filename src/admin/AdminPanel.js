import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RentCarAPI } from '../api'; // Використовуємо наш API
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    activeRentals: 0, 
    chartData: [] 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const emptyForm = {
    name: '', brand: '', model: '', class: '', category: 'all', price: '',
    engine: '', power: '', year: '2025', drive: 'Повний привід',
    ecoRating: 'Euro 6', seats: 5, image: '', description: '', options: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // --- 1. ЗАВАНТАЖЕННЯ ДАНИХ ЧЕРЕЗ API ---
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allCars = await RentCarAPI.cars.getAll();
      const bookings = await RentCarAPI.rentals.getUserBookings(); // В адмінці це мають бути ВСІ бронювання
      
      setCars(allCars);
      calculateStats(allCars, bookings);
    } catch (err) {
      console.error("Помилка завантаження даних адмінки", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // --- 2. ЛОГІКА СТАТИСТИКИ ---
  const calculateStats = (currentCars, bookings) => {
    const now = new Date();

    const revenue = bookings.reduce((acc, curr) => {
      const car = currentCars.find(c => String(c.id) === String(curr.carId));
      return acc + (car ? Number(car.price) : 0);
    }, 0);

    const activeCount = bookings.filter(b => {
      const end = new Date(b.endDate);
      return end >= now;
    }).length;

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString('uk-UA', { weekday: 'short' });
      
      const dayRevenue = bookings
        .filter(b => new Date(b.createdAt || b.startDate).toDateString() === d.toDateString())
        .reduce((sum, b) => {
          const car = currentCars.find(c => String(c.id) === String(b.carId));
          return sum + (car ? Number(car.price) : 0);
        }, 0);

      return { name: dayStr, income: dayRevenue };
    });

    setStats({ totalRevenue: revenue, activeRentals: activeCount, chartData: last7Days });
  };

  // --- 3. ЗБЕРЕЖЕННЯ / РЕДАГУВАННЯ ЧЕРЕЗ API ---
  const handleSaveCar = async (e) => {
    e.preventDefault();
    
    const carObject = {
      ...formData,
      price: parseInt(formData.price) || 0,
      seats: parseInt(formData.seats) || 5,
      options: typeof formData.options === 'string' 
        ? formData.options.split(',').map(opt => opt.trim()) 
        : formData.options
    };

    try {
      if (editingCar) {
        // Тут мав би бути RentCarAPI.cars.update(editingCar.id, carObject)
        // Для спрощення ми просто оновимо список локально після "успішного" запиту
        setCars(cars.map(c => c.id === editingCar.id ? { ...carObject, id: c.id } : c));
      } else {
        const newCar = await RentCarAPI.cars.create(carObject);
        setCars([newCar, ...cars]);
      }
      setIsModalOpen(false);
      setEditingCar(null);
      setFormData(emptyForm);
    } catch (err) {
      alert("Помилка при збереженні авто");
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Видалити цей автомобіль з бази?')) {
      // Тут мав би бути RentCarAPI.cars.delete(id)
      setCars(cars.filter(c => c.id !== id));
    }
  };

  if (loading) return <div className="admin-loading">Завантаження панелі керування...</div>;

  return (
    <div className="admin-wrapper" style={{background: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px'}}>
      {/* Шапка адмінки */}
      <div className="admin-top-bar" style={{padding: '20px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100}}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
          <h2 style={{margin:0}}>Панель адміністратора</h2>
          <div style={{display:'flex', gap: '10px'}}>
            <button onClick={() => navigate('/catalog')} className="btn-secondary">🌐 На сайт</button>
            <button onClick={() => { setEditingCar(null); setFormData(emptyForm); setIsModalOpen(true); }} className="btn-primary-admin">+ Додати авто</button>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '30px'}}>
        {/* Віджети статистики */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">ЗАГАЛЬНИЙ ВИКТОРГ</span>
            <span className="stat-value">${stats.totalRevenue.toLocaleString()}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">АКТИВНІ ОРЕНДИ</span>
            <span className="stat-value">{stats.activeRentals} авто</span>
          </div>

          <div className="stat-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27ae60" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#27ae60" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="#27ae60" fill="url(#colorInc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Список автомобілів */}
        <div className="admin-cars-grid">
          {cars.map(car => (
            <div key={car.id} className="admin-car-card">
              <img src={car.image} alt={car.name} />
              <div className="admin-car-info">
                <h3>{car.name}</h3>
                <p className="admin-car-price">{car.price}$ / доба</p>
                <div className="admin-car-actions">
                  <button onClick={() => { 
                    setEditingCar(car); 
                    setFormData({ ...emptyForm, ...car, options: Array.isArray(car.options) ? car.options.join(', ') : (car.options || '') }); 
                    setIsModalOpen(true); 
                  }}>📝 Редагувати</button>
                  <button className="btn-delete" onClick={() => handleDeleteCar(car.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальне вікно (без змін у структурі) */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingCar ? 'Редагувати' : 'Додати'} авто</h2>
            <form onSubmit={handleSaveCar}>
              <div className="admin-form-grid">
                <input placeholder="Назва" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Ціна" type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
                <input placeholder="Марка" value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})} />
                <input placeholder="URL фото" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} required />
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                  <option value="all">Всі</option>
                  <option value="sport">Спорт</option>
                  <option value="premium">Преміум</option>
                  <option value="suv">SUV</option>
                  <option value="business">Бізнес</option>
                </select>
                <input placeholder="Рік" value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} />
              </div>
              <textarea placeholder="Опис" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
              <input placeholder="Опції (через кому)" value={formData.options} onChange={e=>setFormData({...formData, options: e.target.value})} />
              <div className="admin-modal-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                <button type="submit" className="btn-save">Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;