import React, { useState, useEffect, useContext, useRef } from 'react';
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
import placeholderProduct from '../../assets/imagen no existente BM.png';

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
  const [activeFlashIndex, setActiveFlashIndex] = useState(2);

  const scrollFlashCarousel = (direction) => {
    const totalFlash = Math.min(10, productos.length);
    if (totalFlash === 0) return;
    
    if (direction === 'left') {
      setActiveFlashIndex(prev => (prev === 0 ? totalFlash - 1 : prev - 1));
    } else {
      setActiveFlashIndex(prev => (prev === totalFlash - 1 ? 0 : prev + 1));
    }
  };

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
            description: item.descripcion || '',
            categoryName: item.categoria_nombre || '',
            price: precioNum,
            oldPrice: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
            discount: item.discount || item.descuento || null,
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
      
      <main className="home-main">
        {/* Nuevo Hero Section Moderno */}
        <section className="hero-section-modern">
          <div className="hero-content">
            <span className="hero-badge animate-fade-in-up">🌟 Novedad Exclusiva</span>
            <h1 className="hero-title animate-fade-in-up delay-1">
              Construye tu imaginación <span className="highlight-text">bloque a bloque</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up delay-2">
              Descubre las colecciones más increíbles y sumérgete en un mundo de posibilidades infinitas con Bloques Mundo.
            </p>
            <div className="hero-actions animate-fade-in-up delay-3">
              <Link to="/productos" className="btn-primary-glow">
                Explorar Catálogo <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper animate-float">
            <img src={heroBanner} alt="Lego Colección" className="hero-3d-image" />
          </div>
        </section>

        {/* Nueva Sección: Explora por Colecciones */}
        <section className="collections-nav-section">
          <div className="container">
            <div className="collections-grid">
              {['Star Wars', 'Marvel', 'Harry Potter', 'City', 'Technic', 'Clásicos'].map((col, index) => (
                <Link to="/productos" className="collection-card" key={col} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="col-icon">{['🚀', '🦸‍♂️', '🧙‍♂️', '🏙️', '⚙️', '🧱'][index]}</div>
                  <span className="col-name">{col}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {serverError ? (
          <div className="container">
            <div className="server-error-state animate-fade-in">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔌</div>
              <h2>¡Problemas de conexión!</h2>
              <p>No pudimos conectarnos con nuestro catálogo en este momento.</p>
              <button className="btn-primary-custom" onClick={() => window.location.reload()}>Reintentar Conexión</button>
            </div>
          </div>
        ) : (
          <>
            {/* Ofertas Relámpago con Glassmorphism */}
            <section className="flash-deals-modern">
              <div className="container">
                <div className="flash-header">
                  <div className="flash-title-group">
                    <h2>⚡ Ofertas Relámpago</h2>
                    <p>¡Apresúrate antes de que se agoten!</p>
                  </div>
                  <div className="neon-timer">
                    <span className="time-block">03<small>d</small></span>:
                    <span className="time-block">23<small>h</small></span>:
                    <span className="time-block">19<small>m</small></span>:
                    <span className="time-block">56<small>s</small></span>
                  </div>
                </div>
                
                <div className="flash-carousel-container">
                  <button className="flash-carousel-btn left" onClick={() => scrollFlashCarousel('left')}>&lt;</button>
                  <div className="products-carousel-3d">
                    {loading ? (
                      <div className="carousel-3d-card" style={{ transform: 'translateX(0) scale(1)', zIndex: 10, opacity: 1 }}>
                        <ProductCardSkeleton />
                      </div>
                    ) : (
                      productos.slice(0, 10).map((product, i) => {
                        const total = Math.min(10, productos.length);
                        // Lógica para carrusel infinito (ruleta)
                        let offset = i - activeFlashIndex;
                        if (offset > Math.floor(total / 2)) offset -= total;
                        if (offset < -Math.floor(total / 2)) offset += total;
                        
                        const absOffset = Math.abs(offset);
                        const direction = Math.sign(offset);
                        const isActive = absOffset === 0;

                        return (
                          <div 
                            className={`carousel-3d-card ${isActive ? 'active' : ''}`}
                            style={{ 
                              transform: `translateX(${offset * 150}px) scale(${isActive ? 1.15 : 1 - absOffset * 0.2}) perspective(1000px) rotateY(${direction * 35}deg)`,
                              zIndex: 10 - absOffset,
                              opacity: absOffset > 2 ? 0 : 1,
                              filter: `brightness(${isActive ? 1 : Math.max(0.3, 1 - absOffset * 0.4)})`,
                              pointerEvents: isActive ? 'auto' : 'none'
                            }} 
                            key={`flash-${product.id}`}
                          >
                            <div className={isActive ? 'active-pulse' : 'idle-float'} style={{ animationDelay: `${i * 0.3}s` }}>
                              <ProductCard product={product} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button className="flash-carousel-btn right" onClick={() => scrollFlashCarousel('right')}>&gt;</button>
                </div>
                <div className="center-btn-container" style={{ marginTop: '40px' }}>
                  <Link to="/productos" className="btn-glass-outline">Ver Todas las Promociones</Link>
                </div>
              </div>
            </section>

            {/* Productos Más Vendidos */}
            <section className="best-sellers-section container">
              <div className="section-header modern-header">
                <h2>👑 Los Más Vendidos</h2>
                <Link to="/productos" className="view-all-link">Ver Todos <span>→</span></Link>
              </div>
              <div className="products-grid">
                {loading ? (
                  [1, 2, 3, 4].map((n) => <ProductCardSkeleton key={`b-load-${n}`} />)
                ) : (
                  productos.slice(4, 8).map((product, i) => (
                    <div className="stagger-up" style={{ animationDelay: `${i * 0.15}s` }} key={`best-${product.id}`}>
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Banner Parallax Secundario */}
            <section className="parallax-banner-section container">
              <div className="parallax-container">
                <div className="parallax-bg" style={{ backgroundImage: `url(${secondaryBanner})` }}></div>
                <div className="parallax-content">
                  <h2>Colecciones Especiales</h2>
                  <p>Descubre el lado oscuro de la fuerza</p>
                  <Link to="/productos" className="btn-primary-glow">Descubrir</Link>
                </div>
              </div>
            </section>

            {/* Nuevos Ingresos (Grid Asimétrico Masonry) */}
            <section className="new-arrivals-modern container">
              <div className="section-header modern-header">
                <h2>✨ Nuevos Ingresos</h2>
              </div>
              <div className="masonry-grid">
                {loading ? (
                  <>
                    <div className="masonry-item large-span skeleton" style={{ borderRadius: '24px' }}></div>
                    <div className="masonry-item skeleton" style={{ borderRadius: '24px' }}></div>
                    <div className="masonry-item tall-span skeleton" style={{ borderRadius: '24px' }}></div>
                    <div className="masonry-item skeleton" style={{ borderRadius: '24px' }}></div>
                  </>
                ) : (
                  <>
                    {productos[8] && (
                      <div className="masonry-item large-span">
                        <img src={productos[8].image || placeholderProduct} alt={productos[8].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[8].title}</h3>
                          <Link to={`/producto/${productos[8].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[9] && (
                      <div className="masonry-item">
                        <img src={productos[9].image || placeholderProduct} alt={productos[9].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[9].title}</h3>
                          <Link to={`/producto/${productos[9].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[10] && (
                      <div className="masonry-item tall-span">
                        <img src={productos[10].image || placeholderProduct} alt={productos[10].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[10].title}</h3>
                          <Link to={`/producto/${productos[10].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[11] && (
                      <div className="masonry-item">
                        <img src={productos[11].image || placeholderProduct} alt={productos[11].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[11].title}</h3>
                          <Link to={`/producto/${productos[11].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
