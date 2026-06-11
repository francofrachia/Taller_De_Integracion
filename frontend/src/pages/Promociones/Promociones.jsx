import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import './Promociones.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import placeholderProduct from '../../assets/imagen no existente BM.webp';

const Promociones = () => {
  const { productos, promociones, favoritos, toggleFavorito, agregarAlCarrito } = useContext(AppContext);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  return (
    <div className="promo-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="promo-hero">
        <div className="promo-hero-bg"></div>
        
        <div className="promo-hero-content container">
          <h1 className="promo-title">
            OFERTAS <span className="text-highlight-red">LIMITADAS</span>
          </h1>
          
          <h2 className="promo-catchphrase">¡No te podés perder estas ofertas!</h2>
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
                {favoritos.includes(product.id_producto) ? <FaHeart color="#ff4d4d" size={24} /> : <FaRegHeart color="#999" size={24} />}
              </button>

              <Link to={`/producto/${product.id_producto}`} className="promo-img-wrapper">
                <img 
                  src={(!product.imagen_url || product.imagen_url.includes('legostore.com')) ? placeholderProduct : (product.imagen_url || product.imagenes?.[0])} 
                  alt={product.nombre} 
                  className="promo-img" 
                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderProduct; }}
                />
                {product.stock <= 0 && (
                  <div className="out-of-stock-overlay">AGOTADO</div>
                )}
              </Link>

              <div className="promo-card-info">
                <h3 className="promo-card-title">{product.nombre}</h3>
                <p className="promo-card-category">{product.categoria_nombre}</p>
                
                <div className="promo-price-wrapper">
                  <span className="promo-original-price">${product.original_price}</span>
                  <span className="promo-current-price">${product.discounted_price}</span>
                </div>

                <button 
                  className={`promo-add-btn`}
                  onClick={(e) => {
                    e.preventDefault();
                    agregarAlCarrito(product.id_producto, 1);
                  }}
                >
                  <FaShoppingCart /> Añadir al Carrito
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
