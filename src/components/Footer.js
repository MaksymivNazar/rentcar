import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  // Автоматичне отримання поточного року, щоб не міняти вручну
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Прокат авто</h3>
            <ul>
              <li><Link to="/catalog">Всі авто</Link></li>
              <li><Link to="/catalog?category=sport">Спорткари</Link></li>
              <li><Link to="/catalog?category=business">Бізнес клас</Link></li>
              <li><Link to="/catalog?category=premium">Преміум клас</Link></li>
              <li><Link to="/catalog?category=suv">Позашляховики</Link></li>
              <li><Link to="/catalog?category=minibus">Мікроавтобуси</Link></li>
              <li><Link to="/catalog?category=armored">Броньовані авто</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Меню</h3>
            <ul>
              <li><Link to="/">Головна</Link></li>
              <li><Link to="/conditions">Умови прокату</Link></li>
              <li><Link to="/contacts">Контакти</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Контакти</h3>
            <p><strong>+38 (093) 002 00 02</strong></p>
            <p>olimprentcar@gmail.com</p>
            <p>Україна, м. Київ<br />Столичне шосе, 103<br />ТРЦ Атмосфера</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{currentYear} © Olimp Rent Car</p>
          <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>developer: hard.code</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;