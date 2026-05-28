import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { AppContext } from '../../context/AppContext';
import './Home.css';

// Import local placeholder images for banners
import heroBanner from '../../assets/hero_banner.png';
import secondaryBanner from '../../assets/secondary_banner.png';
import starWarsBanner from '../../assets/starWars.jpg';
import hulkBanner from '../../assets/hulk.jpg';
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
  const { favoritos, toggleFavorito } = useContext(AppContext);
  const flashCarouselRef = useRef(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const hulkRef = useRef(null);
  const newArrivalsRef = useRef(null);
  const transitionRef = useRef(null);
  const [transitionState, setTransitionState] = useState(0);
  const [showGridItems, setShowGridItems] = useState(false);

  useEffect(() => {
    // Observer para la grilla de productos (Masonry)
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShowGridItems(true);
        observer.unobserve(entries[0].target);
      }
    }, { threshold: 0.1 });

    if (newArrivalsRef.current) observer.observe(newArrivalsRef.current);

    const handleScroll = () => {
      if (!transitionRef.current) return;
      const rect = transitionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Si la cinta asoma por la parte inferior de la pantalla (hasta un 60%)
      if (rect.top < windowHeight * 0.9 && rect.top >= windowHeight * 0.5) {
        setTransitionState(1); // Muestra primera parte
      } 
      // Si la cinta sube a la mitad superior de la pantalla
      else if (rect.top < windowHeight * 0.5 && rect.bottom > 0) {
        setTransitionState(2); // Muestra ambas partes
      } else if (rect.top >= windowHeight * 0.9) {
        setTransitionState(0); // Oculta todo si scrollea para arriba
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Disparamos una vez para revisar el estado inicial
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (newArrivalsRef.current) observer.disconnect();
    };
  }, []);

  const checkScrollState = () => {
    if (flashCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = flashCarouselRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkScrollState();
    }, 150);
    window.addEventListener('resize', checkScrollState);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [productos]);

  const scrollFlashCarousel = (direction) => {
    if (flashCarouselRef.current) {
      const scrollAmount = 340; // width of card (320) + gap (20)
      flashCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
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
              Descubre las colecciones más increíbles y sumérgete en un mundo de posibilidades infinitas con Bloque Mundo.
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
              </div>
                
              <div className="flash-carousel-container" style={{ position: 'relative' }}>
                {canScrollLeft && (
                  <button className="flash-carousel-btn left" onClick={() => scrollFlashCarousel('left')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                  </button>
                )}
                
                <div className="apple-carousel-container" ref={flashCarouselRef} onScroll={checkScrollState}>
                    {loading ? (
                      <div className="apple-card" style={{ padding: '0', display: 'block' }}>
                        <ProductCardSkeleton />
                      </div>
                    ) : (
                      productos.slice(0, 10).map((product, i) => {
                        const isFav = favoritos && favoritos.includes(product.id);
                        const isDark = i % 3 === 0;
                        const isAccent = i % 3 === 1;

                        return (
                          <Link to={`/producto/${product.id}`} className={`apple-card ${isDark ? 'dark' : (isAccent ? 'color-accent' : '')}`} key={product.id}>
                            <button 
                              className={`apple-card-fav ${isFav ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorito(product.id);
                              }}
                              title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                            >
                              {isFav ? <FaHeart /> : <FaRegHeart />}
                            </button>

                            <div className="apple-card-content">
                              <div className="apple-card-tag">Oferta Limitada</div>
                              <h3 className="apple-card-title">{product.title}</h3>
                              <p className="apple-card-subtitle">
                                {product.category_name || "Construye tu imaginación."}
                              </p>
                              <div className="apple-card-price">
                                Desde ${product.price}
                              </div>
                            </div>

                            <img 
                              src={(!product.image || product.image.includes('legostore.com')) ? placeholderProduct : product.image} 
                              alt={product.title} 
                              className="apple-card-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholderProduct;
                              }}
                            />
                          </Link>
                        );
                      })
                    )}
                  </div>
                
                {canScrollRight && (
                  <button className="flash-carousel-btn right" onClick={() => scrollFlashCarousel('right')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                  </button>
                )}
              </div>

              <div className="container">
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

            {/* Banner Parallax Secundario (Star Wars) */}
            <section className="parallax-banner-section full-width no-margin-bottom">
              <div className="parallax-container star-wars-theme">
                <div className="parallax-bg" style={{ backgroundImage: `url(${starWarsBanner})` }}></div>
                <div className="parallax-content left-aligned">
                  <h2 className="star-wars-title">Colecciones<br/>Especiales</h2>
                  <p className="star-wars-subtitle">Descubre el lado oscuro de la fuerza.</p>
                  <Link to="/productos" state={{ theme: 'star wars' }} className="btn-star-wars">Únete al Imperio</Link>
                </div>
              </div>
            </section>

            {/* Transición entre universos animada al hacer scroll */}
            <div className="universe-transition" ref={transitionRef}>
              <span className={`transition-text-1 ${transitionState >= 1 ? 'visible' : ''}`}>
                De una galaxia muy lejana...
              </span>
              <span className={`separator-dot ${transitionState >= 2 ? 'visible' : ''}`}>•</span>
              <span className={`transition-text-2 ${transitionState >= 2 ? 'visible' : ''}`}>
                A los héroes más poderosos
              </span>
            </div>

            {/* Banner Parallax (Marvel - Hulk) como puente hacia los productos */}
            <section className="parallax-banner-section full-width no-margin-top no-margin-bottom cinematic-marvel-banner" ref={hulkRef}>
              <div className="parallax-container cinematic-theme marvel-style large-banner">
                <div className="parallax-bg" style={{ backgroundImage: `url(${hulkBanner})` }}></div>
                <div className="parallax-content right-aligned">
                  <h2 className="star-wars-title marvel-title">Nuevos<br/>Ingresos</h2>
                  <p className="star-wars-subtitle">Descubre el poder de Marvel.</p>
                  <button 
                    onClick={() => {
                      if (newArrivalsRef.current) {
                        const offset = 80; // Compensar posible navbar
                        const elementPosition = newArrivalsRef.current.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }} 
                    className="btn-star-wars btn-marvel"
                    style={{ cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Ver Nuevos Ingresos
                  </button>
                </div>
              </div>
            </section>

            {/* Difuminado hacia abajo (negro-rojo a fondo oscuro) */}
            <div className="marvel-fade-out"></div>

            <div className="dark-marvel-bg">
              {/* Nuevos Ingresos (Grid Asimétrico Masonry) */}
              <section className="new-arrivals-modern container" ref={newArrivalsRef}>
                
                <div className={`section-header-modern ${showGridItems ? 'animate-item' : 'hidden-item'}`} style={{ animationDelay: '0s' }}>
                <h2>Últimos Lanzamientos</h2>
                <p>Explora nuestras novedades más recientes y expande tu colección con las piezas exclusivas que acaban de aterrizar.</p>
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
                      <div className={`masonry-item large-span ${showGridItems ? 'animate-item' : 'hidden-item'}`} style={{ animationDelay: '0.1s' }}>
                        <button
                          className="masonry-fav-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorito(productos[8]);
                          }}
                        >
                          {favoritos.some(fav => fav.id === productos[8].id) ? <FaHeart color="red" size={24} /> : <FaRegHeart color="#999" size={24} />}
                        </button>
                        <img src={productos[8].image || placeholderProduct} alt={productos[8].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[8].title}</h3>
                          <Link to={`/producto/${productos[8].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[9] && (
                      <div className={`masonry-item ${showGridItems ? 'animate-item' : 'hidden-item'}`} style={{ animationDelay: '0.3s' }}>
                        <button
                          className="masonry-fav-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorito(productos[9]);
                          }}
                        >
                          {favoritos.some(fav => fav.id === productos[9].id) ? <FaHeart color="red" size={20} /> : <FaRegHeart color="#999" size={20} />}
                        </button>
                        <img src={productos[9].image || placeholderProduct} alt={productos[9].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[9].title}</h3>
                          <Link to={`/producto/${productos[9].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[10] && (
                      <div className={`masonry-item tall-span ${showGridItems ? 'animate-item' : 'hidden-item'}`} style={{ animationDelay: '0.5s' }}>
                        <button
                          className="masonry-fav-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorito(productos[10]);
                          }}
                        >
                          {favoritos.some(fav => fav.id === productos[10].id) ? <FaHeart color="red" size={22} /> : <FaRegHeart color="#999" size={22} />}
                        </button>
                        <img src={productos[10].image || placeholderProduct} alt={productos[10].title} />
                        <div className="masonry-overlay">
                          <h3 style={{ fontSize: '18px' }}>{productos[10].title}</h3>
                          <Link to={`/producto/${productos[10].id}`}>Explorar</Link>
                        </div>
                      </div>
                    )}
                    {productos[11] && (
                      <div className={`masonry-item ${showGridItems ? 'animate-item' : 'hidden-item'}`} style={{ animationDelay: '0.7s' }}>
                        <button
                          className="masonry-fav-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorito(productos[11]);
                          }}
                        >
                          {favoritos.some(fav => fav.id === productos[11].id) ? <FaHeart color="red" size={20} /> : <FaRegHeart color="#999" size={20} />}
                        </button>
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
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
