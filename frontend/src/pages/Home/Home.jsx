import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { AppContext } from '../../context/AppContext';
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
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    // Conectando con tu backend existente (Express + PostgreSQL)
    fetch(`${API_URL}/productos`)
      .then(res => {
        if (!res.ok) throw new Error('Server response not ok');
        return res.json();
      })
      .then(data => {
        // Mapeamos los datos de la DB al formato que espera nuestro ProductCard
        const productosMapeados = data.map(item => {
          const precioNum = parseFloat(item.precio) || 0;
          return {
            id: item.id_producto,
            title: item.nombre || item.titulo || 'Producto sin nombre',
            price: precioNum,
            oldPrice: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
            discount: item.descuento || null,
            rating: item.calificacion || 5, // Valor por defecto si no existe
            reviews: item.reseñas || 0,
            image: item.imagen_url, // URL que viene del JOIN de la BD
            collection: item.tipo_coleccion ? item.tipo_coleccion.toLowerCase().trim() : 'otros',
            age: item.edad_recomendada || null,
            stock: item.stock || 0,
            // Exclusivo: Si es para mayores de 16 años, vale más de 30000 o es de Star Wars
            isExclusive: (item.edad_recomendada && item.edad_recomendada >= 16) || precioNum > 35000 || (item.tipo_coleccion && item.tipo_coleccion.toLowerCase().includes('star wars')),
            // Próximamente: Demo interactivo si el id es divisible por 4
            isComingSoon: item.id_producto % 4 === 0
          };
        });
        
        setProductos(productosMapeados);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setServerError(true);
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

        {serverError ? (
          <div className="server-error-state animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-white)', borderRadius: '24px', margin: '40px 0', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔌</div>
            <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '16px', fontWeight: '800' }}>¡Problemas de conexión!</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              No pudimos conectarnos con nuestro catálogo de productos en este momento. Parece que el servidor está desenchufado o en mantenimiento.
            </p>
            <button className="btn-primary-custom" onClick={() => window.location.reload()} style={{ marginTop: '30px', border: 'none', cursor: 'pointer' }}>
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <>
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
              productos.slice(0, 4).map(product => (
                <ProductCard key={`flash-${product.id}`} product={product} />
              ))
            )}
          </div>
          <div className="center-btn-container">
            <Link to="/productos" className="primary-btn-outline">Ver Todas las Promociones</Link>
          </div>
        </section>

        {/* Productos Más Vendidos */}
        <section className="best-sellers-section">
          <div className="section-header">
            <h2>Productos más Vendidos</h2>
            <Link to="/productos" className="view-all-link">Ver Todos <span>→</span></Link>
          </div>
          <div className="products-grid">
            {loading ? (
              [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={n} />)
            ) : (
              productos.slice(4, 8).map(product => (
                <ProductCard key={`best-${product.id}`} product={product} />
              ))
            )}
          </div>
        </section>

        {/* Secondary Banner */}
        <section className="secondary-banner-section">
          <img src={secondaryBanner} alt="Colección Especial" className="secondary-banner-img" />
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
