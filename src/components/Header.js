import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const isAdmin = userData.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_bookings');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-phone">
              <a href="tel:+380930020002">+38 (093) 002 00 02</a>
            </div>
            <div className="header-gift">
              <Link to="/gift">Подарунковий сертифікат</Link>
            </div>
            <div className="header-actions">
              <div className="currency-selector">
                <button className="currency-btn" onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}>
                  $ <span className="arrow">▼</span>
                </button>
                {isCurrencyOpen && (
                  <div className="dropdown-menu">
                    <button>$</button><button>€</button><button>грн</button>
                  </div>
                )}
              </div>
              <div className="language-selector">
                <button className="language-btn" onClick={() => setIsLanguageOpen(!isLanguageOpen)}>
                  ua <span className="arrow">▼</span>
                </button>
                {isLanguageOpen && (
                  <div className="dropdown-menu">
                    <button>ua</button><button>en</button><button>ru</button>
                  </div>
                )}
              </div>
              {token ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin-panel" className="profile-btn" style={{background: '#ffcc00', color: '#000'}}>Адмін</Link>
                  ) : (
                    <Link to="/profile" className="profile-btn">Профіль</Link>
                  )}
                  <button className="logout-btn" onClick={handleLogout}>Вийти</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="login-btn">Вхід</Link>
                  <Link to="/register" className="register-btn">Реєстрація</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <Link to="/" className="logo"><h1>Olimp Rent Car</h1></Link>
            <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
              <div className="nav-dropdown">
                <Link to="/catalog?category=all" className="nav-link">Прокат авто</Link>
                <div className="dropdown-content">
                  {/* ВАЖЛИВО: Категорії мають співпадати з ключами в Catalog.js */}
                  <Link to="/catalog?category=sport">Спорткари</Link>
                  <Link to="/catalog?category=business">Бізнес клас</Link>
                  <Link to="/catalog?category=premium">Преміум клас</Link>
                  <Link to="/catalog?category=suv">Позашляховики</Link>
                  <Link to="/catalog?category=bus">Мікроавтобуси</Link>
                  <Link to="/catalog?category=armored">Броньовані авто</Link>
                  <Link to="/catalog?category=electric">Електромобілі</Link>
                </div>
              </div>
              <Link to="/conditions">Умови прокату</Link>
              <Link to="/contacts">Контакти</Link>
            </nav>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;