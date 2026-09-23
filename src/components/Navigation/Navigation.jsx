import React from 'react';
import { FaHome, FaHeart, FaCalendarAlt, FaCamera, FaEnvelope, FaGift } from 'react-icons/fa';
import styles from './Navigation.module.css';

const Navigation = ({ activeSection }) => {
  const navItems = [
    { id: 'hero', icon: <FaHome />, label: 'Home' },
    { id: 'couple', icon: <FaHeart />, label: 'Couple' },
    { id: 'events', icon: <FaCalendarAlt />, label: 'Events' },
    { id: 'gallery', icon: <FaCamera />, label: 'Gallery' },
    { id: 'gift', icon: <FaGift />, label: 'Gift' },
    { id: 'rsvp', icon: <FaEnvelope />, label: 'RSVP' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.navContainer}>
      {navItems.map((item, index) => (
        <button 
          key={index} 
          className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`} 
          title={item.label}
          onClick={() => scrollToSection(item.id)}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default Navigation;
