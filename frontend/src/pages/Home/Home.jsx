import React, { useState, useEffect, useContext } from 'react';
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
  
  // Consumimos la búsqueda global y función del carrito
  const { busqueda, setBusqueda } = useContext(AppContext);
  
  // Estados para nuestros filtros premium con "chiches"
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('');
  const [activeAge, setActiveAge] = useState(null);
  const [onlyExclusives, setOnlyExclusives] = useState(false);
  const [onlyComingSoon, setOnlyComingSoon] = useState(false);
  const [priceRange, setPriceRange] = useState(100000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [sortBy, setSortBy] = useState('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
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
        
        // Calcular el precio máximo dinámico para el slider de rango
        if (productosMapeados.length > 0) {
          const maxP = Math.ceil(Math.max(...productosMapeados.map(p => p.price)));
          setMaxPriceLimit(maxP);
          setPriceRange(maxP);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setServerError(true);
        setLoading(false);
      });
  }, []);

  // Función para resetear todos los filtros
  const resetFilters = () => {
    setActiveTheme('');
    setActiveAge(null);
    setOnlyExclusives(false);
    setOnlyComingSoon(false);
    setPriceRange(maxPriceLimit);
    setSortBy('default');
    if (setBusqueda) setBusqueda('');
  };

  // Filtrar productos de forma reactiva en el frontend
  const filteredProducts = productos.filter(product => {
    // 1. Búsqueda por texto (Navbar)
    if (busqueda && !product.title.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    // 2. Tema / Colección
    if (activeTheme && product.collection !== activeTheme) {
      return false;
    }
    // 3. Edad recomendada
    if (activeAge && product.age !== parseInt(activeAge)) {
      return false;
    }
    // 4. Exclusivos
    if (onlyExclusives && !product.isExclusive) {
      return false;
    }
    // 5. Próximamente / Pre-orden
    if (onlyComingSoon && !product.isComingSoon) {
      return false;
    }
    // 6. Rango de precio
    if (product.price > priceRange) {
      return false;
    }
    return true;
  });

  // Ordenar productos reactivamente
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'rating-desc') {
      return b.rating - a.rating;
    }
    if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Verificamos si hay algún filtro activo para mostrar la barra de tags
  const hasActiveFilters = activeTheme || activeAge || onlyExclusives || onlyComingSoon || priceRange < maxPriceLimit || busqueda;

  // Renderizador de la barra de filtros activos (tags/pills) con botón de remover individual
  const activeFiltersBar = hasActiveFilters ? (
    <div className="active-filters-bar animate-fade-in">
      <span className="active-filters-title">Filtros activos:</span>
      <div className="active-filters-list">
        {busqueda && (
          <span className="active-filter-badge">
            Buscar: "{busqueda}"
            <button className="remove-badge-btn" onClick={() => setBusqueda('')} title="Quitar búsqueda">✖</button>
          </span>
        )}
        {activeTheme && (
          <span className="active-filter-badge">
            Colección: {activeTheme.toUpperCase()}
            <button className="remove-badge-btn" onClick={() => setActiveTheme('')} title="Quitar colección">✖</button>
          </span>
        )}
        {activeAge && (
          <span className="active-filter-badge">
            Edad: {activeAge}+ años
            <button className="remove-badge-btn" onClick={() => setActiveAge(null)} title="Quitar edad">✖</button>
          </span>
        )}
        {onlyExclusives && (
          <span className="active-filter-badge">
            Exclusivos
            <button className="remove-badge-btn" onClick={() => setOnlyExclusives(false)} title="Quitar exclusivo">✖</button>
          </span>
        )}
        {onlyComingSoon && (
          <span className="active-filter-badge">
            Próximamente
            <button className="remove-badge-btn" onClick={() => setOnlyComingSoon(false)} title="Quitar próximamente">✖</button>
          </span>
        )}
        {priceRange < maxPriceLimit && (
          <span className="active-filter-badge">
            Precio: ≤ ${priceRange.toLocaleString()}
            <button className="remove-badge-btn" onClick={() => setPriceRange(maxPriceLimit)} title="Quitar límite de precio">✖</button>
          </span>
        )}
        <button className="clear-filters-badge-btn" onClick={resetFilters}>
          Limpiar todos
        </button>
      </div>
    </div>
  ) : null;

  // Render del selector de Filtros con sus "chiches" (diseño LEGO, studs, switches y slider)
  const filterDropdownMenu = (
    <div className="filter-controls-container">
      <button 
        className={`filter-btn-toggle ${filterMenuOpen ? 'active' : ''}`}
        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
        title="Filtrar y Ordenar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
        </svg>
        <span>Filtros</span>
        {hasActiveFilters && <span className="filter-badge-dot"></span>}
      </button>

      {filterMenuOpen && (
        <>
          <div className="filter-dropdown-overlay" onClick={() => setFilterMenuOpen(false)}></div>
          <div className="filter-dropdown-menu glassmorphic animate-slide-down">
            <div className="filter-dropdown-header">
              <h4>Filtrar Catálogo</h4>
              <button className="clear-all-link" onClick={resetFilters}>Limpiar todo</button>
            </div>
            
            <div className="filter-dropdown-body">
              {/* Colecciones / Temas */}
              <div className="filter-group">
                <label className="filter-label">Colección</label>
                <div className="filter-pills">
                  {['city', 'harry potter', 'star wars', 'marvel', 'super heroes'].map(theme => (
                    <button 
                      key={theme} 
                      className={`filter-pill ${activeTheme === theme ? 'active' : ''}`}
                      onClick={() => setActiveTheme(activeTheme === theme ? '' : theme)}
                    >
                      {theme === 'super heroes' ? 'Super Héroes' : theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edad Recomendada como Slider */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <label className="filter-label">Edad Recomendada</label>
                  <span className="price-value">{activeAge ? `${activeAge}+ años` : 'Todas las edades'}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={activeAge ? ['3', '6', '8', '9', '12', '16', '18', 'Todos'].indexOf(activeAge) : 7} 
                  onChange={(e) => {
                    const ages = ['3', '6', '8', '9', '12', '16', '18', 'Todos'];
                    const val = parseInt(e.target.value);
                    setActiveAge(ages[val] === 'Todos' ? null : ages[val]);
                  }}
                  className="price-range-slider age-range-slider"
                />
                <div className="price-range-labels">
                  <span>3+</span>
                  <span>Todas</span>
                </div>
              </div>

              {/* Rango de Precios */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <label className="filter-label">Precio Máximo</label>
                  <span className="price-value">${priceRange.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={maxPriceLimit || 100000} 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-labels">
                  <span>$0</span>
                  <span>${(maxPriceLimit || 100000).toLocaleString()}</span>
                </div>
              </div>

              {/* Especiales Checkboxes (Switches de estilo) */}
              <div className="filter-group specials-group">
                <div className="toggle-item">
                  <span className="toggle-label">Ediciones Exclusivas</span>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={onlyExclusives} 
                      onChange={(e) => setOnlyExclusives(e.target.checked)} 
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <span className="toggle-label">Próximos Lanzamientos</span>
                  <label className="switch-toggle">
                    <input 
                      type="checkbox" 
                      checked={onlyComingSoon} 
                      onChange={(e) => setOnlyComingSoon(e.target.checked)} 
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              {/* Ordenamiento Custom */}
              <div className="filter-group">
                <label className="filter-label">Ordenar por</label>
                <div className={`custom-sort-dropdown ${sortMenuOpen ? 'open' : ''}`}>
                  <div 
                    className="custom-sort-selected" 
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  >
                    <span>
                      {sortBy === 'default' ? 'Por defecto' :
                       sortBy === 'price-asc' ? 'Precio: de menor a mayor' :
                       sortBy === 'price-desc' ? 'Precio: de mayor a menor' :
                       sortBy === 'rating-desc' ? 'Calificación más alta' :
                       'Nombre: A - Z'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="custom-sort-arrow">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </div>
                  
                  {sortMenuOpen && (
                    <>
                      <div className="custom-sort-overlay" onClick={() => setSortMenuOpen(false)}></div>
                      <ul className="custom-sort-options">
                        <li 
                          className={sortBy === 'default' ? 'active' : ''} 
                          onClick={() => { setSortBy('default'); setSortMenuOpen(false); }}
                        >
                          Por defecto
                        </li>
                        <li 
                          className={sortBy === 'price-asc' ? 'active' : ''} 
                          onClick={() => { setSortBy('price-asc'); setSortMenuOpen(false); }}
                        >
                          Precio: de menor a mayor
                        </li>
                        <li 
                          className={sortBy === 'price-desc' ? 'active' : ''} 
                          onClick={() => { setSortBy('price-desc'); setSortMenuOpen(false); }}
                        >
                          Precio: de mayor a menor
                        </li>
                        <li 
                          className={sortBy === 'rating-desc' ? 'active' : ''} 
                          onClick={() => { setSortBy('rating-desc'); setSortMenuOpen(false); }}
                        >
                          Calificación más alta
                        </li>
                        <li 
                          className={sortBy === 'name-asc' ? 'active' : ''} 
                          onClick={() => { setSortBy('name-asc'); setSortMenuOpen(false); }}
                        >
                          Nombre: A - Z
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

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

        {/* Catálogo de Todos Los Productos */}
        <section className="explore-products-section" id="productos">
          <SectionHeader 
            title="Todos Los Productos" 
            rightElement={filterDropdownMenu}
          />
          
          {activeFiltersBar}
          
          <div className="products-grid-wrapper">
            <div className="products-count-label">
              Mostrando <strong>{sortedProducts.length}</strong> de {productos.length} productos
            </div>
            
            <div className="products-grid">
              {loading ? (
                [1, 2, 3, 4, 5, 6, 7, 8].map((n) => <ProductCardSkeleton key={`exp-loading-${n}`} />)
              ) : sortedProducts.length > 0 ? (
                sortedProducts.map(product => (
                  <ProductCard key={`exp-${product.id}`} product={product} />
                ))
              ) : (
                <div className="no-products-found animate-fade-in">
                  <div className="no-products-icon">🧱</div>
                  <h3>¡Uy! No hay bloques por aquí</h3>
                  <p>Ningún producto coincide con los filtros aplicados. Intenta ajustarlos para seguir construyendo.</p>
                  <button className="primary-btn-outline" onClick={resetFilters}>Limpiar Filtros</button>
                </div>
              )}
            </div>
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
