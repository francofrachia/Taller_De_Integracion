import React, { useEffect } from 'react';
import './About.css';
import aboutImage from '../../assets/about_us_image.png';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content animate-fade-in">
          <h1 className="about-title">Quienes Somos?</h1>
          <p className="about-subtitle">Construimos creatividad, bloque a bloque.</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="about-main container">
        <div className="about-split">
          <div className="about-image-wrapper animate-slide-right">
            <img src={aboutImage} alt="Bloque Mundo Est. 2024" className="about-image" />
          </div>
          
          <div className="about-text animate-slide-left">
            <h2>Nuestra Historia</h2>
            <p>
              En <strong>Bloque Mundo</strong> somos apasionados por el universo LEGO y creemos que cada bloque puede dar vida a una nueva idea. 
              Nos dedicamos a ofrecer sets originales y personalizados para todas las edades, fomentando la creatividad y el juego en familia.
            </p>
            <p>
              Nuestro objetivo es construir una comunidad de fanáticos del armado, brindando una experiencia de compra fácil, rápida y divertida. 
              Actualmente estamos desarrollando una aplicación para llegar a más personas y gestionar los pedidos de forma más eficiente, llevando la magia de los bloques a cada rincón del país.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section (Scrollable extra content requested by user) */}
      <section className="about-values">
        <div className="container">
          <h2 className="values-title text-center">Nuestros Valores Fundamentales</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Creatividad sin límites</h3>
              <p>Fomentamos la imaginación y la innovación constante. Creemos que no hay instrucciones incorrectas cuando construyes desde tu imaginación.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Comunidad</h3>
              <p>Buscamos conectar a entusiastas de todas las edades. Construir en compañía siempre multiplica la diversión y fortalece vínculos.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Calidad garantizada</h3>
              <p>Nos aseguramos de que cada set que llega a tus manos cumpla con los estándares más exigentes del mundo del coleccionismo y armado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="about-cta">
        <div className="container text-center">
          <h2>¿Listo para empezar tu próxima aventura de construcción?</h2>
          <p>Descubre nuestro catálogo lleno de sets increíbles esperando por ti.</p>
          <a href="/" className="btn-primary-custom">Explorar Catálogo</a>
        </div>
      </section>
    </div>
  );
};

export default About;
