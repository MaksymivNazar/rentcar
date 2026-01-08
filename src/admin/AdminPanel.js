import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cars as initialCars } from '../data/cars'; 
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  
  const [cars, setCars] = useState(() => {
    const saved = localStorage.getItem('persistent_cars');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : initialCars;
  });

  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    activeRentals: 0, 
    chartData: [] 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const emptyForm = {
    name: '', brand: '', model: '', class: '', category: 'all', price: '',
    engine: '', power: '', year: '2024', drive: 'Повний привід',
    ecoRating: 'Euro 6', seats: 5, image: '', description: '', options: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // --- ЛОГІКА СТАТИСТИКИ ТА ГРАФІКА (ВИПРАВЛЕНО) ---
  const refreshStats = (currentCars) => {
    const bookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    const now = new Date();

    // 1. Загальний виторг
    const revenue = bookings.reduce((acc, curr) => {
      const car = currentCars.find(c => String(c.id) === String(curr.carId));
      return acc + (car ? Number(car.price) : 0);
    }, 0);

    // 2. Активні оренди
    const activeCount = bookings.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return now >= start && now <= end;
    }).length;

    // 3. Дані для графіка (Останні 7 днів)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString('uk-UA', { weekday: 'short' });
      
      const dayRevenue = bookings
        .filter(b => {
          // Перевіряємо дату створення замовлення
          const bDate = new Date(b.createdAt || b.date || b.startDate);
          return bDate.toDateString() === d.toDateString();
        })
        .reduce((sum, b) => {
          const car = currentCars.find(c => String(c.id) === String(b.carId));
          return sum + (car ? Number(car.price) : 0);
        }, 0);

      return { name: dayStr, income: dayRevenue };
    });

    setStats({ totalRevenue: revenue, activeRentals: activeCount, chartData: last7Days });
  };

  useEffect(() => {
    localStorage.setItem('persistent_cars', JSON.stringify(cars));
    refreshStats(cars);
    
    const handleStorage = () => refreshStats(cars);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [cars]);

  const handleSaveCar = (e) => {
    e.preventDefault();
    const optionsArray = typeof formData.options === 'string' 
      ? formData.options.split(',').map(opt => opt.trim()).filter(opt => opt !== "")
      : formData.options;

    const carObject = {
      ...formData,
      id: editingCar ? editingCar.id : Date.now(),
      price: parseInt(formData.price) || 0,
      seats: parseInt(formData.seats) || 5,
      options: optionsArray,
      available: true
    };

    if (editingCar) {
      setCars(cars.map(c => c.id === editingCar.id ? carObject : c));
    } else {
      setCars([carObject, ...cars]);
    }

    setIsModalOpen(false);
    setEditingCar(null);
    setFormData(emptyForm);
  };

  return (
    <div className="admin-wrapper" style={{background: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px'}}>
      <div className="admin-top-bar" style={{padding: '20px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100}}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
          <h2 style={{margin:0}}>Панель адміністратора</h2>
          <div style={{display:'flex', gap: '10px'}}>
            <button onClick={() => navigate('/catalog')} style={{padding: '10px 15px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ddd'}}>🌐 На сайт</button>
            <button onClick={() => { setEditingCar(null); setFormData(emptyForm); setIsModalOpen(true); }} style={{background:'#27ae60', color:'#fff', padding:'10px 20px', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight: 'bold'}}>+ Додати авто</button>
          </div>
        </div>
      </div>

      <div className="container" style={{marginTop: '30px'}}>
        
        {/* ВІДЖЕТИ СТАТИСТИКИ ТА ГРАФІК */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 2.5fr', gap: '20px', marginBottom: '40px'}}>
          <div style={{background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
            <div style={{color: '#888', fontSize: '14px'}}>ЗАГАЛЬНИЙ ВИКТОРГ</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#27ae60', marginTop: '5px'}}>${stats.totalRevenue.toLocaleString()}</div>
          </div>

          <div style={{background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
            <div style={{color: '#888', fontSize: '14px'}}>АКТИВНІ ОРЕНДИ</div>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: '#f39c12', marginTop: '5px'}}>{stats.activeRentals} авто</div>
          </div>

          <div style={{background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: '160px'}}>
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

        {/* СПИСОК АВТО */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'25px'}}>
          {cars.map(car => (
            <div key={car.id} style={{border:'1px solid #ddd', padding:'15px', borderRadius:'12px', background:'#fff'}}>
              <img src={car.image} alt="" style={{width:'100%', height:'180px', objectFit:'cover', borderRadius:'8px'}} />
              <h3 style={{margin: '15px 0 5px'}}>{car.name}</h3>
              <p style={{color: '#27ae60', fontWeight: 'bold'}}>{car.price}$ / доба</p>
              <div style={{display:'flex', gap:'10px', marginTop: '15px'}}>
                <button onClick={() => { 
                  setEditingCar(car); 
                  setFormData({ ...emptyForm, ...car, options: Array.isArray(car.options) ? car.options.join(', ') : (car.options || '') }); 
                  setIsModalOpen(true); 
                }} style={{flex:1, padding: '10px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc', background: '#fff'}}>📝 Редагувати</button>
                <button onClick={() => { if(window.confirm('Видалити?')) setCars(cars.filter(c => c.id !== car.id)) }} style={{background:'#fdeaea', color:'#e74c3c', border:'1px solid #f5c6cb', padding:'0 15px', borderRadius:'6px', cursor:'pointer'}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* МОДАЛКА (Усі поля повернуто) */}
      {isModalOpen && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
          <div style={{background:'#fff', padding:'30px', borderRadius:'15px', width:'900px', maxHeight:'90vh', overflowY:'auto'}}>
            <h2>{editingCar ? 'Редагувати' : 'Додати'} авто</h2>
            <form onSubmit={handleSaveCar}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px'}}>
                <input placeholder="Назва" style={{padding:'10px'}} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Ціна" type="number" style={{padding:'10px'}} value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
                <input placeholder="Марка" style={{padding:'10px'}} value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})} />
                <input placeholder="Модель" style={{padding:'10px'}} value={formData.model} onChange={e=>setFormData({...formData, model: e.target.value})} />
                <input placeholder="Двигун" style={{padding:'10px'}} value={formData.engine} onChange={e=>setFormData({...formData, engine: e.target.value})} />
                <input placeholder="Рік" style={{padding:'10px'}} value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} />
                <input placeholder="URL фото" style={{padding:'10px'}} value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} required />
                <select style={{padding:'10px'}} value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                  <option value="all">Всі</option>
                  <option value="sport">Спорт</option>
                  <option value="premium">Преміум</option>
                  <option value="suv">SUV</option>
                </select>
              </div>
              <textarea placeholder="Опис" style={{width:'100%', marginTop:'15px', height:'80px', padding:'10px'}} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
              <input placeholder="Опції (через кому)" style={{width:'100%', marginTop:'15px', padding:'10px'}} value={formData.options} onChange={e=>setFormData({...formData, options: e.target.value})} />
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 20px'}}>Скасувати</button>
                <button type="submit" style={{background:'#27ae60', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', fontWeight:'bold'}}>Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;