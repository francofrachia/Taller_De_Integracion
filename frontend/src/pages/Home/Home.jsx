import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiGift, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { AppContext } from '../../context/AppContext';
import './Home.css';

// Import local placeholder images for banners
import starWarsBanner from '../../assets/starWars.webp';
import newHeroBanner from '../../assets/imagen_home_arriba.webp';
import hulkBanner from '../../assets/Home.superheroe.webp';
import placeholderProduct from '../../assets/imagen no existente BM.webp';
import logoBm from '../../assets/BM logo recortado.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Helpers para visuales de categorías dinámicas ──────────────────
const displayCategoryName = (name) => {
  if (!name) return '';
  const lower = name.toLowerCase();
  if (lower.includes('icon') || lower.includes('creator')) return 'Clásicos';
  if (lower.includes('city')) return 'Construcciones';
  if (lower.includes('technic') || lower.includes('speed')) return 'Vehículos';
  return name;
};

const getCategoryVisuals = (name) => {
  if (!name) return { emoji: '🧱', icon: null };
  const lower = name.toLowerCase().trim();

  let emoji = '🧱';
  let iconPath = null;

  if (lower.includes('star wars')) {
    iconPath = '/imagenes icons/star wars.svg';
  } else if (lower.includes('dc')) {
    iconPath = '/imagenes icons/dc.svg';
  } else if (lower.includes('marvel') || lower.includes('héroes') || lower.includes('super heroes')) {
    iconPath = '/imagenes icons/marvel.svg';
  } else if (lower.includes('harry potter')) {
    iconPath = '/imagenes icons/harry potter.svg';
  } else if (lower.includes('city') || lower.includes('construcciones')) {
    iconPath = '/imagenes icons/city.svg';
  } else if (lower.includes('technic') || lower.includes('speed') || lower.includes('architecture') || lower.includes('vehiculos') || lower.includes('vehículos')) {
    iconPath = '/imagenes icons/vehiculos.svg';
  } else if (lower.includes('minecraft')) {
    iconPath = '/imagenes icons/minecraft.svg';
  } else if (lower.includes('icon') || lower.includes('creator') || lower.includes('clasico') || lower.includes('clásico')) {
    iconPath = '/imagenes icons/icons.svg';
  } else if (lower.includes('cartoon') || lower.includes('network') || lower.includes('looney')) {
    iconPath = '/imagenes icons/cartoonNetwork.svg';
  }

  return { emoji, icon: iconPath };
};

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
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const { favoritos, toggleFavorito, promociones, agregarAlCarrito } = useContext(AppContext);
  
  const flashCarouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const bestSellersCarouselRef = useRef(null);
  const [canScrollBsLeft, setCanScrollBsLeft] = useState(false);
  const [canScrollBsRight, setCanScrollBsRight] = useState(true);

  const hulkRef = useRef(null);
  const newArrivalsRef = useRef(null);
  const bestSellersRef = useRef(null);
  const transitionRef = useRef(null);
  const darkSectionRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDarkTheme(entry.isIntersecting || entry.boundingClientRect.top <= 0);
      },
      { rootMargin: '-250px 0px 0px 0px', threshold: 0 }
    );

    if (darkSectionRef.current) {
      observer.observe(darkSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const [transitionState, setTransitionState] = useState(0);
  const [showGridItems, setShowGridItems] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(false);

  useEffect(() => {
    // Observer para animaciones on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === newArrivalsRef.current && entry.isIntersecting) {
          setShowGridItems(true);
        }
        if (entry.target === bestSellersRef.current && entry.isIntersecting) {
          setShowBestSellers(true);
        }
      });
    }, { threshold: 0.1 });

    if (newArrivalsRef.current) observer.observe(newArrivalsRef.current);
    if (bestSellersRef.current) observer.observe(bestSellersRef.current);

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
      observer.disconnect();
    };
  }, []);

  const checkScrollState = useCallback(() => {
    if (flashCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = flashCarouselRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
    if (bestSellersCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = bestSellersCarouselRef.current;
      setCanScrollBsLeft(scrollLeft > 5);
      setCanScrollBsRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkScrollState();
    }, 150);
    window.addEventListener('resize', checkScrollState);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [productos, checkScrollState]);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 340; // width of card (320) + gap (20)
      ref.current.scrollBy({
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
          const originalPrice = parseFloat(item.precio) || 0;
          const discountPct = item.descuento ? parseFloat(item.descuento) : null;
          const finalPrice = discountPct ? originalPrice * (1 - discountPct / 100) : originalPrice;
          return {
            id: item.id_producto,
            title: item.nombre || item.titulo || 'Producto sin nombre',
            description: item.descripcion || '',
            categoryName: item.categoria_nombre || '',
            price: finalPrice,
            oldPrice: discountPct ? originalPrice : null,
            discount: discountPct ? Math.round(discountPct) : null,
            rating: parseFloat(item.calificacion) || 5,
            reviews: parseInt(item.resenas || item.reseñas) || 0,
            image: item.imagen_url, // URL que viene del JOIN de la BD
            collection: item.categoria_nombre ? item.categoria_nombre.toLowerCase().trim() : 'otros',
            age: item.edad_recomendada || null,
            stock: item.stock || 0,
            // Exclusivo: Si es para mayores de 16 años, vale más de 30000 o es de Star Wars
            isExclusive: (item.edad_recomendada && item.edad_recomendada >= 16) || finalPrice > 35000 || (item.categoria_nombre && item.categoria_nombre.toLowerCase().includes('star wars')),
            // Próximamente: Lógica escalable desde BDD
            isComingSoon: !!item.ultimo_lanzamiento,
            // Ventas reales desde BDD
            ventasTotales: parseInt(item.ventas_totales) || 0
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

  useEffect(() => {
    fetch(`${API_URL}/productos/categorias`)
      .then(res => {
        if (!res.ok) throw new Error('Server response not ok');
        return res.json();
      })
      .then(data => {
        setDbCategories(data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const promoItems = (promociones || []).map(promo => {
    const p = productos.find(pr => pr.id === promo.id_producto);
    if (!p) return null;
    return { 
      ...p, 
      discount_pct: p.discount || parseFloat(promo.porcentaje), 
      original_price: parseFloat(p.oldPrice || p.price).toFixed(2), 
      final_price: parseFloat(p.price).toFixed(2) 
    };
  }).filter(Boolean);

  const bestSellers = [...productos]
    .filter(p => p.ventasTotales > 0)
    .sort((a, b) => b.ventasTotales - a.ventasTotales)
    .slice(0, 10);

  return (
    <div className={`home-page ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className={`fixed-background ${isDarkTheme ? 'dark-active' : ''}`}></div>
      <Navbar />
      
      <main className="home-main">
        {/* Nuevo Hero Section Moderno */}
        <section className="hero-section-custom">
          {/* Fondo usando la imagen original sin el gradiente blanco */}
          <div className="hero-custom-bg" style={{ backgroundImage: `url(${newHeroBanner})` }}></div>
          
          <div className="container">
            <div className="hero-custom-content">
              {/* Title */}
              <h1 className="hero-custom-title animate-fade-in-up delay-2">
                <span className="dark-blue">Construye tu</span><br/>
                <span className="colorful-mundo" style={{color: '#ffcf00'}}>
                  mundo
                </span>
              </h1>
              
              <div className="animate-fade-in-up delay-3" style={{ marginTop: '20px' }}>
                <Link to="/productos" className="btn-hero-yellow">
                  Ver productos <span style={{marginLeft: '10px'}}>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Floating Bar */}
          <div className="hero-floating-bar animate-fade-in-up delay-5">
            <div className="feature-item">
               <FiGift className="feature-icon" color="#e3000f" />
               <span className="feature-text">Sets para todas<br/>las edades</span>
            </div>
            <div className="feature-separator"></div>
            <div className="feature-item">
               <FiShield className="feature-icon" color="#006cb7" />
               <span className="feature-text">Productos originales<br/>y de calidad</span>
            </div>
            <div className="feature-separator"></div>
            <div className="feature-item">
               <FiTruck className="feature-icon" color="#22c55e" />
               <span className="feature-text">Envíos rápidos<br/>a todo el país</span>
            </div>
            <div className="feature-separator"></div>
            <div className="feature-item">
               <FiStar className="feature-icon" color="#ffcf00" />
               <span className="feature-text">Diversión que<br/>construye recuerdos</span>
            </div>
          </div>
        </section>

        {/* Nueva Sección: Explora por Colecciones */}
        <section className="collections-nav-section">
          <div className="container">
            <div className="collections-grid">
              {dbCategories.map((cat, index) => {
                const displayName = displayCategoryName(cat.nombre);
                const visuals = getCategoryVisuals(cat.nombre);
                return (
                  <Link 
                    to="/productos" 
                    state={{ theme: cat.nombre }} 
                    className="collection-card" 
                    key={cat.id_categoria} 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {visuals.icon && (
                      <div className="col-icon">
                        <img src={visuals.icon} alt="" className="col-icon-svg" />
                      </div>
                    )}
                    <span className="col-name">{displayName}</span>
                  </Link>
                );
              })}
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
            <div style={{ height: '40px' }}></div> {/* Espaciador reducido */}

            {/* Ofertas Relámpago con Glassmorphism */}
            {(loading || promoItems.length > 0) && (
              <section className="flash-deals-modern" ref={darkSectionRef}>
                <div className="container">
                  <div className="flash-header">
                    <div className="flash-title-group">
                      <h2>Ofertas</h2>
                      <p>Los mejores precios para expandir tu colección.</p>
                    </div>
                  </div>
                </div>
                  
                <div className="flash-carousel-container" style={{ position: 'relative' }}>
                  {canScrollLeft && (
                    <button className="flash-carousel-btn left" onClick={() => scrollCarousel(flashCarouselRef, 'left')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                    </button>
                  )}
                  
                  <div className="apple-carousel-container" ref={flashCarouselRef} onScroll={checkScrollState}>
                      {loading ? (
                        <div className="apple-card" style={{ padding: '0', display: 'block' }}>
                          <ProductCardSkeleton />
                        </div>
                      ) : (
                        promoItems.map((product, i) => {
                          const isFav = favoritos && favoritos.includes(product.id);
                          const isDark = i % 3 === 0;
                          const isAccent = i % 3 === 1;
                          return (
                            <Link to={`/producto/${product.id}`} className={`apple-card ${isDark ? 'dark' : (isAccent ? 'color-accent' : '')} ${product.stock <= 0 ? 'out-of-stock' : ''}`} key={product.id}>
                              <button 
                                className={`apple-card-fav ${isFav ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorito(product.id); }}
                                title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                              >
                                {isFav ? <FaHeart /> : <FaRegHeart />}
                              </button>
                              <div className="apple-card-content">
                                {product.stock <= 0 ? (
                                  <div className="apple-card-tag out-of-stock-tag">Agotado</div>
                                ) : (
                                  <div className="apple-card-tag">{`🔥 -${product.discount_pct}%`}</div>
                                )}
                                <h3 className="apple-card-title">{product.title}</h3>
                                <p className="apple-card-subtitle">{product.categoryName || "Construye tu imaginación."}</p>
                                <div className="apple-card-price">
                                  {product.stock <= 0 ? "Sin stock" : (
                                    <><span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '13px', marginRight: '6px' }}>${product.original_price}</span><strong>${product.final_price}</strong></>
                                  )}
                                </div>
                              </div>
                              <img 
                                src={(!product.image || product.image.includes('legostore.com')) ? placeholderProduct : product.image} 
                                alt={product.title} 
                                className="apple-card-image"
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderProduct; }}
                              />
                              <div className="apple-card-actions">
                                <button 
                                  className="apple-add-to-cart-btn"
                                  disabled={product.stock <= 0}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (product.stock > 0) await agregarAlCarrito(product.id, 1);
                                  }}
                                >
                                  {product.stock <= 0 ? "Sin stock" : "Agregar al Carrito"}
                                </button>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  
                  {canScrollRight && (
                    <button className="flash-carousel-btn right" onClick={() => scrollCarousel(flashCarouselRef, 'right')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                  </button>
                  )}
                </div>

                <div className="container">
                  <div className="center-btn-container" style={{ marginTop: '40px' }}>
                    <Link to="/promociones" className="btn-glass-outline">Ver Todas las Promociones</Link>
                  </div>
                </div>
              </section>
            )}

            {/* Banner Parallax Secundario (Star Wars) */}
            <section className="parallax-banner-section full-width no-margin-top no-margin-bottom">
              <div className="parallax-container star-wars-theme">
                <div className="parallax-bg" style={{ backgroundImage: `url(${starWarsBanner})` }}></div>
                <div className="parallax-content left-aligned">
                  <h2 className="star-wars-title">Colecciones<br/>Especiales</h2>
                  <p className="star-wars-subtitle">Descubre el lado oscuro de la fuerza.</p>
                  <Link to="/productos" state={{ theme: 'star wars' }} className="btn-star-wars">Únete al Imperio</Link>
                </div>
              </div>
            </section>

            {/* Productos Más Vendidos */}
            {(loading || bestSellers.length > 0) && (
              <div className="best-sellers-dark-wrapper" ref={bestSellersRef}>
                <section className="best-sellers-section">
                  <div className="container">
                    <div className={`section-header modern-header ${showBestSellers ? 'animate-item' : 'hidden-item'}`}>
                      <h2 className="section-title-highlight">Los Más Vendidos</h2>
                      <Link to="/productos" className="view-all-link">Ver Todos <span>→</span></Link>
                    </div>
                  </div>
                  <div className="flash-carousel-container" style={{ position: 'relative' }}>
                    {canScrollBsLeft && (
                      <button className="flash-carousel-btn left" onClick={() => scrollCarousel(bestSellersCarouselRef, 'left')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                      </button>
                    )}
                    
                    <div className="apple-carousel-container" ref={bestSellersCarouselRef} onScroll={checkScrollState}>
                        {loading ? (
                          <div className="apple-card" style={{ padding: '0', display: 'block' }}>
                            <ProductCardSkeleton />
                          </div>
                        ) : (
                          bestSellers.map((product, i) => {
                            const isFav = favoritos && favoritos.includes(product.id);
                            const isDark = i % 3 === 0;
                            const isAccent = i % 3 === 1;

                            return (
                              <Link to={`/producto/${product.id}`} className={`apple-card ${isDark ? 'dark' : (isAccent ? 'color-accent' : '')} ${product.stock <= 0 ? 'out-of-stock' : ''}`} key={product.id}>
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
                                  {product.stock <= 0 ? (
                                    <div className="apple-card-tag out-of-stock-tag">Agotado</div>
                                  ) : (
                                    <div className="apple-card-tag">Los Más Vendidos</div>
                                  )}
                                  <h3 className="apple-card-title">{product.title}</h3>
                                  <p className="apple-card-subtitle">
                                    {product.categoryName || "Construye tu imaginación."}
                                  </p>
                                  <div className="apple-card-price">
                                    {product.stock <= 0 ? "Sin stock" : `Desde $${product.price}`}
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
                                <div className="apple-card-actions">
                                  <button 
                                    className="apple-add-to-cart-btn"
                                    disabled={product.stock <= 0}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (product.stock > 0) await agregarAlCarrito(product.id, 1);
                                    }}
                                  >
                                    {product.stock <= 0 ? "Sin stock" : "Agregar al Carrito"}
                                  </button>
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    
                    {canScrollBsRight && (
                      <button className="flash-carousel-btn right" onClick={() => scrollCarousel(bestSellersCarouselRef, 'right')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Banner Parallax (Marvel - Superhéroe) */}
            <section className="parallax-banner-section full-width no-margin-top no-margin-bottom cinematic-marvel-banner" ref={hulkRef}>
              <div className="parallax-container cinematic-theme marvel-style large-banner">
                <div className="parallax-bg" style={{ backgroundImage: `url(${hulkBanner})` }}></div>
                <div className="parallax-content right-aligned">
                  <h2 className="star-wars-title marvel-title">Nuevos<br/>Ingresos</h2>
                  <p className="star-wars-subtitle">Descubre el poder de Marvel.</p>
                  <button 
                    onClick={() => {
                      if (newArrivalsRef.current) {
                        const offset = 80;
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
                    {productos.filter(p => p.isComingSoon).slice(0, 4).map((product, index) => {
                      const spans = ['large-span', '', 'tall-span', ''];
                      const sizes = [24, 20, 22, 20];
                      const delays = ['0.1s', '0.3s', '0.5s', '0.7s'];
                      
                      return (
                        <div key={product.id} className={`masonry-item ${spans[index]} ${showGridItems ? 'animate-item' : 'hidden-item'} ${product.stock <= 0 ? 'out-of-stock' : ''}`} style={{ animationDelay: delays[index] }}>
                          <button
                            className="masonry-fav-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorito(product.id);
                            }}
                          >
                            {favoritos.includes(product.id) ? <FaHeart color="red" size={sizes[index]} /> : <FaRegHeart color="#999" size={sizes[index]} />}
                          </button>
                          <img 
                            src={product.image || placeholderProduct} 
                            alt={product.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = placeholderProduct;
                            }}
                          />
                          <div className="masonry-overlay">
                            <h3 style={{ fontSize: '18px' }}>{product.title} {product.stock <= 0 && <span style={{ color: '#ff4d4d', fontSize: '14px', fontWeight: 'bold' }}>(Agotado)</span>}</h3>
                            <Link to={`/producto/${product.id}`}>{product.stock <= 0 ? 'Ver detalles' : 'Explorar'}</Link>
                          </div>
                        </div>
                      );
                    })}
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
