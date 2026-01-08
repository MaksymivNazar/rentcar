import React from 'react';
import '../styles/Contacts.css';

function Contacts() {
  return (
    <div className="contacts">
      <div className="container">
        <h1>Контакти</h1>
        <div className="contacts-content">
          <div className="contact-info">
            <h2>Зв'яжіться з нами</h2>
            <div className="contact-item">
              <h3>Телефон:</h3>
              <a href="tel:+380930020002">+38 (093) 002 00 02</a>
            </div>
            <div className="contact-item">
              <h3>Email:</h3>
              <a href="mailto:olimprentcar@gmail.com">olimprentcar@gmail.com</a>
            </div>
            <div className="contact-item">
              <h3>Адреса:</h3>
              <p>Україна, м. Київ<br />Столичне шосе, 103<br />ТРЦ Атмосфера</p>
            </div>
            <div className="contact-social">
              <h3>Соціальні мережі:</h3>
              <div className="social-links">
                <a href="#" className="social-link">Telegram</a>
                <a href="#" className="social-link">WhatsApp</a>
                <a href="#" className="social-link">Viber</a>
              </div>
            </div>
          </div>
          <div className="contact-map">
            <h2>Як нас знайти</h2>
            <div className="map-placeholder">
              <p>Карта: Столичне шосе, 103, Київ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;

