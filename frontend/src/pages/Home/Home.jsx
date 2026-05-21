import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './Home.css';

// Import local placeholder images for banners
import heroBanner from '../../assets/hero_banner.png';
import secondaryBanner from '../../assets/secondary_banner.png';
import placeholderProduct from '../../assets/product_placeholder.png';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ProductCardSkeleton = () => (
  <div className="product-card" style={{ height: '100%' }}>
    <div className="product-card-image-container" style={{ display: 'block', padding: '0' }}>
      <div className="skeleton" style={{ width: '100%', height: '100%', aspectRatio: '1', borderRadius: '0' }}></div>
    </div>
    <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
      <div className="skeleton" style={{ width: '85%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '60%', height: '14px' }}></div>
      <div className="skeleton" style={{ width: '40%', height: '18px', marginTop: '5px' }}></div>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: 'auto' }}>
        <div className="skeleton" style={{ width: '60px', height: '12px' }}></div>
        <div className="skeleton" style={{ width: '25px', height: '12px' }}></div>
      </div>
    </div>
    <div className="product-card-actions">
      <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '4px' }}></div>
    </div>
  </div>
);

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conectando con tu backend existente (Express + PostgreSQL)
    fetch(`${API_URL}/productos`)
      .then(res => res.json())
      .then(data => {
        // Mapeamos los datos de la DB al formato que espera nuestro ProductCard
        const productosMapeados = data.map(item => ({
          id: item.id_producto,
          title: item.nombre || item.titulo || 'Producto sin nombre',
          price: item.precio,
          oldPrice: item.precio_anterior || null,
          discount: item.descuento || null,
          rating: item.calificacion || 5, // Valor por defecto si no existe
          reviews: item.reseñas || 0,
          image: item.imagen_url // Aquí usamos la URL que viene del JOIN de tu BD
        }));
        setProductos(productosMapeados);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      
      <main className="container">
        {/* Hero Banner Section */}
        <section className="hero-section">
          <img src={heroBanner} alt="Hero Banner" className="hero-banner-img" />
        </section>

        {/* Ofertas Relámpago */}
        <section className="flash-deals-section">
          <SectionHeader 
            title="Ofertas Relámpago" 
            timer={{ days: '03', hours: '23', minutes: '19', seconds: '56' }} 
          />
          <div className="products-grid">
            {loading ? (
              [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={n} />)
            ) : (
              productos.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          <div className="center-btn-container">
            <button className="primary-btn-outline">Ver todas las Promociones</button>
          </div>
        </section>

        {/* Productos Más Vendidos */}
        <section className="best-sellers-section">
          <SectionHeader title="Productos más Vendidos" showViewAll={true} />
          <div className="products-grid">
            {loading ? (
              [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={n} />)
            ) : (
              productos.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

        {/* Secondary Banner */}
        <section className="secondary-banner-section">
          <img src={secondaryBanner} alt="Colección Especial" className="secondary-banner-img" />
        </section>

        {/* Explorá Nuestros Productos */}
        <section className="explore-products-section">
          <SectionHeader title="Explorá Nuestros Productos" />
          <div className="products-grid">
            {loading ? (
              [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={`exp-loading-${n}`} />)
            ) : (
              productos.map(product => (
                <ProductCard key={`exp-${product.id}`} product={product} />
              ))
            )}
          </div>
          <div className="center-btn-container">
            <button className="primary-btn-outline">Ver todos los Productos</button>
          </div>
        </section>

        {/* Nuevos Ingresos (Collage) */}
        <section className="new-arrivals-section">
          <SectionHeader title="Nuevos Ingresos" />
          <div className="arrivals-collage">
            <div className="collage-item large">
              <img src={placeholderProduct} alt="Nuevo Ingreso" />
            </div>
            <div className="collage-col">
              <div className="collage-item wide">
                <img src={placeholderProduct} alt="Nuevo Ingreso" />
              </div>
              <div className="collage-row">
                <div className="collage-item small">
                  <img src={placeholderProduct} alt="Nuevo Ingreso" />
                </div>
                <div className="collage-item small">
                  <img src={placeholderProduct} alt="Nuevo Ingreso" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
