import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Scroll al tope automático al cambiar de ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Mostrar/Ocultar el botón flotante
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`} 
      onClick={scrollToTop}
      title="Volver arriba"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </div>
  );
};

export default ScrollToTop;
