import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaHeart, FaRegHeart, FaShoppingCart, FaClock } from 'react-icons/fa';
import './Promociones.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const Promociones = () => {
  const { productos, promociones, favoritos, toggleFavorito, agregarAlCarrito } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 12 });

  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              // Reset timer when it reaches 0 for dramatic effect
              hours = 24;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cruzar promociones de la base de datos con los productos
  const promotionalProducts = (promociones || []).map(promo => {
    const product = productos.find(p => p.id_producto === promo.id_producto);
    if (!product) return null;
    
    const originalPrice = parseFloat(product.precio);
    const discountPercent = parseFloat(promo.porcentaje);
    const discountedPrice = originalPrice - (originalPrice * (discountPercent / 100));
    
    return {
      ...product,
      promo_desc: promo.descripcion,
      discount_percent: discountPercent,
      original_price: originalPrice.toFixed(2),
      discounted_price: discountedPrice.toFixed(2)
    };
  }).filter(Boolean);

  const formatTime = (value) => value.toString().padStart(2, '0');

  return (
    <div className="promo-page dark-theme">
      <Navbar />
      
      {/* Hero Section */}
      <section className="promo-hero">
        <div className="promo-hero-bg">
          <div className="neon-grid"></div>
        </div>
        
        <div className="promo-hero-content container">
          <div className="promo-badge">ACCESO CLASIFICADO</div>
          <h1 className="promo-title">
            OFERTAS <span className="neon-text-red">RELÁMPAGO</span>
          </h1>
          <p className="promo-subtitle">
            Unidades limitadas. Descuentos extremos. El tiempo se agota.
          </p>
          
          <div className="countdown-container">
            <FaClock className="clock-icon" />
            <div className="countdown-box">
              <span className="time-val">{formatTime(timeLeft.hours)}</span>
              <span className="time-label">HS</span>
            </div>
            <span className="time-sep">:</span>
            <div className="countdown-box">
              <span className="time-val">{formatTime(timeLeft.minutes)}</span>
              <span className="time-label">MIN</span>
            </div>
            <span className="time-sep">:</span>
            <div className="countdown-box">
              <span className="time-val neon-pulse-fast">{formatTime(timeLeft.seconds)}</span>
              <span className="time-label">SEG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Ofertas */}
      <section className="promo-catalog container">
        <div className="promo-grid">
          {promotionalProducts.map((product, index) => (
            <div className={`promo-card animate-up`} style={{ animationDelay: `${index * 0.1}s` }} key={product.id_producto}>
              <div className="promo-card-tag">
                -{product.discount_percent}%
              </div>
              
              <button
                className="promo-fav-btn"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorito(product.id_producto);
                }}
              >
                {favoritos.includes(product.id_producto) ? <FaHeart color="#ff4d4d" size={24} /> : <FaRegHeart color="rgba(255,255,255,0.6)" size={24} />}
              </button>

              <Link to={`/producto/${product.id_producto}`} className="promo-img-wrapper">
                <img src={product.imagen_url || product.imagenes?.[0] || "/images/placeholder.png"} alt={product.nombre} className="promo-img" />
                {product.stock <= 0 && (
                  <div className="out-of-stock-overlay">AGOTADO</div>
                )}
              </Link>

              <div className="promo-card-info">
                <h3 className="promo-card-title">{product.nombre}</h3>
                <p className="promo-card-category">{product.categoria_nombre} - {product.promo_desc}</p>
                
                <div className="promo-price-wrapper">
                  <span className="promo-original-price">${product.original_price}</span>
                  <span className="promo-current-price">${product.discounted_price}</span>
                </div>

                <button 
                  className={`promo-add-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (product.stock > 0) agregarAlCarrito(product.id_producto, 1);
                  }}
                  disabled={product.stock <= 0}
                >
                  <FaShoppingCart /> {product.stock <= 0 ? 'Sin Stock' : 'Añadir al Carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Promociones;
