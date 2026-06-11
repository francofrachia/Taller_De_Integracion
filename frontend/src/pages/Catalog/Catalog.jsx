import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import { AppContext } from '../../context/AppContext';
import { displayCategoryName, getCategoryVisuals } from '../../utils/categoryHelpers';
import './Catalog.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Skeleton card ─────────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="product-card">
    <div className="product-card-image-container" style={{ display: 'block', padding: 0 }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 0 }} />
    </div>
    <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
      <div className="skeleton" style={{ width: '85%', height: '16px' }} />
      <div className="skeleton" style={{ width: '60%', height: '14px' }} />
      <div className="skeleton" style={{ width: '40%', height: '18px', marginTop: '5px' }} />
    </div>
    <div className="product-card-actions">
      <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '4px' }} />
    </div>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────
const Catalog = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { busqueda, setBusqueda } = useContext(AppContext);

  const location = useLocation();
  const navigate = useNavigate();
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    if (location.state?.theme && dbCategories.length > 0) {
      const redirectedTheme = location.state.theme.toLowerCase().trim();
      const matchedCat = dbCategories.find(c => {
        const dbName = c.nombre.toLowerCase();
         if (redirectedTheme === 'clásicos' || redirectedTheme === 'clasicos') {
          return dbName.includes('icon') || dbName.includes('creator') || dbName.includes('clásico') || dbName.includes('clasico');
        }
        if (redirectedTheme === 'construcciones' || redirectedTheme.includes('ciudad') || redirectedTheme.includes('city')) {
          return dbName.includes('city') || dbName.includes('construcciones') || dbName.includes('ciudad') || dbName.includes('ciudades');
        }
        if (redirectedTheme === 'vehículos' || redirectedTheme === 'vehiculos') {
          return dbName.includes('technic') || dbName.includes('speed') || dbName.includes('vehículo') || dbName.includes('vehiculo');
        }
        return dbName.includes(redirectedTheme);
      });
      if (matchedCat) {
        setActiveCategoryId(matchedCat.id_categoria);
      }
    }
  }, [location.state, dbCategories]);
  const [activeAge, setActiveAge] = useState(null);
  const [onlyExclusives, setOnlyExclusives] = useState(false);
  const [onlyComingSoon, setOnlyComingSoon] = useState(false);
  const [priceRange, setPriceRange] = useState(100000);
  const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
  const [sortBy, setSortBy] = useState('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [serverError, setServerError] = useState(false);

  const stripRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (stripRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = stripRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (strip) {
      strip.addEventListener('scroll', checkScroll);
      setTimeout(checkScroll, 150);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (strip) strip.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, dbCategories, productos]);

  const handleScroll = (direction) => {
    if (stripRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      stripRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/productos/categorias`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setDbCategories(data); setCategoryError(false); })
      .catch(err => {
        console.error('Error al obtener categorías:', err);
        setCategoryError(true);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        const mapped = data.map(item => {
          const originalPrice = parseFloat(item.precio) || 0;
          const discountPct = item.descuento ? parseFloat(item.descuento) : null;
          const finalPrice = discountPct ? originalPrice * (1 - discountPct / 100) : originalPrice;
          return {
            id: item.id_producto,
            title: item.nombre || item.titulo || 'Producto sin nombre',
            description: item.descripcion || '',
            categoryName: item.categoria_nombre || '',
            categoryId: item.id_categoria,
            price: finalPrice,
            oldPrice: discountPct ? originalPrice : null,
            discount: discountPct ? Math.round(discountPct) : null,
            rating: parseFloat(item.calificacion) || 5,
            reviews: parseInt(item.resenas || item.reseñas) || 0,
            image: item.imagen_url,
            collection: item.categoria_nombre ? item.categoria_nombre.toLowerCase().trim() : 'otros',
            age: item.edad_recomendada || null,
            stock: item.stock || 0,
            isExclusive: (item.edad_recomendada >= 16) || finalPrice > 35000 || (item.categoria_nombre && item.categoria_nombre.toLowerCase().includes('star wars')),
            isComingSoon: !!item.proximo_lanzamiento,
          };
        });
        setProductos(mapped);
        if (mapped.length > 0) {
          const maxP = Math.ceil(Math.max(...mapped.map(p => p.price)));
          setMaxPriceLimit(maxP);
          setPriceRange(maxP);
        }
        setLoading(false);
      })
      .catch(() => { setServerError(true); setLoading(false); });
  }, []);

  useEffect(() => {
    // Cuando el usuario entra al catálogo, o si cambia el location state (viene de otro link), escrolear arriba
    window.scrollTo(0, 0);
    
    if (location.state?.clearFilters) {
      setActiveCategoryId(null);
      setActiveAge(null);
      setOnlyExclusives(false);
      setOnlyComingSoon(false);
      if (maxPriceLimit > 0) setPriceRange(maxPriceLimit);
      setSortBy('default');
      // Limpiar state para que no se re-ejecute
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, maxPriceLimit, navigate, setBusqueda]);

  const resetFilters = () => {
    setActiveCategoryId(null); setActiveAge(null);
    setOnlyExclusives(false); setOnlyComingSoon(false);
    setPriceRange(maxPriceLimit); setSortBy('default');
    if (setBusqueda) setBusqueda('');
  };

  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      if (busqueda && !(p?.title || p?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (activeCategoryId !== null && p?.categoryId !== activeCategoryId) return false;
      if (activeAge && p?.age !== parseInt(activeAge)) return false;
      if (onlyExclusives && !p?.isExclusive) return false;
      if (onlyComingSoon && !p?.isComingSoon) return false;
      if (p?.price > priceRange) return false;
      return true;
    });
  }, [productos, busqueda, activeCategoryId, activeAge, onlyExclusives, onlyComingSoon, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const hasActiveFilters = activeCategoryId !== null || activeAge || onlyExclusives || onlyComingSoon || priceRange < maxPriceLimit || busqueda;

  // ── Active filters bar ──────────────────────────────────────────────────
  const activeFiltersBar = hasActiveFilters ? (
    <div className="active-filters-bar animate-fade-in">
      <span className="active-filters-title">Filtros activos:</span>
      <div className="active-filters-list">
        {busqueda && (
          <span className="active-filter-badge">
            Búsqueda: &ldquo;{busqueda}&rdquo;
            <button className="remove-badge-btn" onClick={() => setBusqueda('')} title="Quitar búsqueda">✖</button>
          </span>
        )}
        {activeCategoryId !== null && (() => {
          const rawName = dbCategories.find(c => c.id_categoria === activeCategoryId)?.nombre || 'Categoría';
          const catName = displayCategoryName(rawName);
          const visuals = getCategoryVisuals(catName);
          return (
            <span className="active-filter-badge">
              {visuals.icon && (
                <>
                  <img src={visuals.icon} alt="" className="active-filter-badge-svg" />
                  {' '}
                </>
              )}
              {catName}
              <button className="remove-badge-btn" onClick={() => setActiveCategoryId(null)}>✖</button>
            </span>
          );
        })()}
        {activeAge && (
          <span className="active-filter-badge">
            Edad: {activeAge}+ años
            <button className="remove-badge-btn" onClick={() => setActiveAge(null)}>✖</button>
          </span>
        )}
        {onlyExclusives && (
          <span className="active-filter-badge">
            ⭐ Exclusivos
            <button className="remove-badge-btn" onClick={() => setOnlyExclusives(false)}>✖</button>
          </span>
        )}
        {onlyComingSoon && (
          <span className="active-filter-badge">
            🔜 Próximamente
            <button className="remove-badge-btn" onClick={() => setOnlyComingSoon(false)}>✖</button>
          </span>
        )}
        {priceRange < maxPriceLimit && (
          <span className="active-filter-badge">
            Precio ≤ ${priceRange.toLocaleString()}
            <button className="remove-badge-btn" onClick={() => setPriceRange(maxPriceLimit)}>✖</button>
          </span>
        )}
        <button className="clear-filters-badge-btn" onClick={resetFilters}>Limpiar todos</button>
      </div>
    </div>
  ) : null;

  // ── Filter dropdown (unchanged) ─────────────────────────────────────────
  const filterDropdownMenu = (
    <div className="filter-controls-container">
      <button
        className={`filter-btn-toggle ${filterMenuOpen ? 'active' : ''}`}
        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
        </svg>
        <span>Filtros</span>
        {hasActiveFilters && <span className="filter-badge-dot" />}
      </button>

      {filterMenuOpen && (
        <>
          <div className="filter-dropdown-overlay" onClick={() => setFilterMenuOpen(false)} />
          <div className="filter-dropdown-menu glassmorphic animate-slide-down">
            <div className="filter-dropdown-header">
              <h4>Filtrar Catálogo</h4>
              <button className="clear-all-link" onClick={resetFilters}>Limpiar todo</button>
            </div>
            <div className="filter-dropdown-body">

              {/* Categorías */}
              <div className="filter-group">
                <label className="filter-label">Categoría</label>
                <div className="filter-pills">
                  {dbCategories.map(cat => (
                    <button
                      key={cat.id_categoria}
                      className={`filter-pill ${activeCategoryId === cat.id_categoria ? 'active' : ''}`}
                      onClick={() => setActiveCategoryId(activeCategoryId === cat.id_categoria ? null : cat.id_categoria)}
                    >
                      {displayCategoryName(cat.nombre)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edad */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <label className="filter-label">Edad Recomendada</label>
                  <span className="price-value">{activeAge ? `${activeAge}+ años` : 'Todas las edades'}</span>
                </div>
                <input
                  type="range" min="0" max="7"
                  value={activeAge ? ['2', '6', '8', '9', '12', '16', '18', 'Todos'].indexOf(activeAge) : 7}
                  onChange={e => {
                    const ages = ['2', '6', '8', '9', '12', '16', '18', 'Todos'];
                    const val = parseInt(e.target.value);
                    setActiveAge(ages[val] === 'Todos' ? null : ages[val]);
                  }}
                  className="price-range-slider age-range-slider"
                />
                <div className="price-range-labels"><span>2+</span><span>Todas</span></div>
              </div>

              {/* Precio */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <label className="filter-label">Precio Máximo</label>
                  <span className="price-value">${priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="0" max={maxPriceLimit || 100000} step="50"
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-range-labels"><span>$0</span><span>${(maxPriceLimit || 100000).toLocaleString()}</span></div>
              </div>

              {/* Especiales */}
              <div className="filter-group specials-group">
                <div className="toggle-item">
                  <span className="toggle-label">Ediciones Exclusivas</span>
                  <label className="switch-toggle">
                    <input type="checkbox" checked={onlyExclusives} onChange={e => setOnlyExclusives(e.target.checked)} />
                    <span className="switch-slider" />
                  </label>
                </div>
                <div className="toggle-item">
                  <span className="toggle-label">Próximos Lanzamientos</span>
                  <label className="switch-toggle">
                    <input type="checkbox" checked={onlyComingSoon} onChange={e => setOnlyComingSoon(e.target.checked)} />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>

              {/* Ordenar */}
              <div className="filter-group">
                <label className="filter-label">Ordenar por</label>
                <div className={`custom-sort-dropdown ${sortMenuOpen ? 'open' : ''}`}>
                  <div className="custom-sort-selected" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
                    <span>
                      {sortBy === 'default' ? 'Por defecto' :
                        sortBy === 'price-asc' ? 'Precio: menor a mayor' :
                          sortBy === 'price-desc' ? 'Precio: mayor a menor' :
                            sortBy === 'rating-desc' ? 'Calificación más alta' :
                              'Nombre: A - Z'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="custom-sort-arrow">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                    </svg>
                  </div>
                  {sortMenuOpen && (
                    <>
                      <div className="custom-sort-overlay" onClick={() => setSortMenuOpen(false)} />
                      <ul className="custom-sort-options">
                        {[
                          { v: 'default', l: 'Por defecto' },
                          { v: 'price-asc', l: 'Precio: menor a mayor' },
                          { v: 'price-desc', l: 'Precio: mayor a menor' },
                          { v: 'rating-desc', l: 'Calificación más alta' },
                          { v: 'name-asc', l: 'Nombre: A - Z' },
                        ].map(({ v, l }) => (
                          <li key={v} className={sortBy === v ? 'active' : ''} onClick={() => { setSortBy(v); setSortMenuOpen(false); }}>
                            {l}
                          </li>
                        ))}
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="catalog-page">
      <Navbar />

      <main className="catalog-main container">

        {serverError ? (
          /* ── Error state ── */
          <div className="server-error-container">
            <div className="error-card-glass animate-fade-in">
              <div className="error-icon-wrapper">
                <div className="floating-brick-error red"></div>
                <div className="floating-brick-error yellow"></div>
                <span className="error-plug-emoji">🔌</span>
              </div>
              <h2>¡Problemas de conexión!</h2>
              <p>No pudimos conectarnos con nuestro catálogo. El servidor de base de datos está en mantenimiento o no se encuentra disponible.</p>
              <button className="error-retry-btn" onClick={() => window.location.reload()}>
                Reintentar Conexión
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Hero strip ── */}
            <div className="catalog-hero-strip">
              <div className="catalog-hero-text">
                <span className="catalog-hero-eyebrow">BloqueMundo · Catálogo oficial</span>
                <h1 className="catalog-hero-title">
                  Nuestros <span className="catalog-hero-highlight">Productos</span>
                </h1>
                <p className="catalog-hero-desc">
                  Encontrá el set LEGO perfecto para vos — desde ciudades épicas hasta galaxias lejanas.
                </p>
              </div>
              <div className="catalog-hero-bricks" aria-hidden="true">
                {dbCategories
                  .map(cat => getCategoryVisuals(cat.nombre).icon)
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((iconPath, i) => (
                    <img
                      key={i}
                      src={iconPath}
                      alt=""
                      className={`catalog-brick catalog-brick-${i + 1}`}
                    />
                  ))
                }
              </div>
            </div>

            {/* ── Categoría chips horizontales ── */}
            <div className="catalog-collection-wrapper">
              {canScrollLeft && (
                <button
                  className="scroll-arrow scroll-arrow-left"
                  onClick={() => handleScroll('left')}
                  aria-label="Desplazar izquierda"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}

              <div className="catalog-collection-strip" ref={stripRef}>
                {categoryError && (
                  <span style={{ color: '#ef5350', fontSize: '13px', padding: '10px 15px', fontWeight: 'bold' }}>
                    ¡Error al cargar categorías!
                  </span>
                )}
                <button
                  className={`col-chip ${activeCategoryId === null ? 'active' : ''}`}
                  style={{
                    '--chip-accent': '#FFD700',
                    '--chip-text': '#1a1a1a'
                  }}
                  onClick={() => setActiveCategoryId(null)}
                >
                  <img src="/imagenes icons/all.svg" alt="" className="col-chip-svg" />
                  <span className="col-chip-label">Todos</span>
                  {activeCategoryId === null && <span className="col-chip-check">✓</span>}
                </button>
                {dbCategories.map(cat => {
                  const visuals = getCategoryVisuals(cat.nombre);
                  return (
                    <button
                      key={cat.id_categoria}
                      className={`col-chip ${activeCategoryId === cat.id_categoria ? 'active' : ''}`}
                      style={{
                        '--chip-accent': visuals.color,
                        '--chip-text': visuals.textColor || '#1a1a1a'
                      }}
                      onClick={() => setActiveCategoryId(cat.id_categoria)}
                    >
                      {visuals.icon && (
                        <img src={visuals.icon} alt="" className="col-chip-svg" />
                      )}
                      <span className="col-chip-label">{displayCategoryName(cat.nombre)}</span>
                      {activeCategoryId === cat.id_categoria && <span className="col-chip-check">✓</span>}
                    </button>
                  );
                })}
              </div>

              {canScrollRight && (
                <button
                  className="scroll-arrow scroll-arrow-right"
                  onClick={() => handleScroll('right')}
                  aria-label="Desplazar derecha"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </div>

            {/* ── Toolbar: contador + filtros ── */}
            <div className="catalog-toolbar">
              <div className="catalog-result-info">
                {loading ? (
                  <div className="skeleton" style={{ width: '160px', height: '16px', borderRadius: '6px' }} />
                ) : (
                  <>
                    <span className="catalog-result-count">{sortedProducts.length}</span>
                    <span className="catalog-result-label">
                      {sortedProducts.length === 1 ? ' producto encontrado' : ' productos encontrados'}
                      {productos.length !== sortedProducts.length && ` de ${productos.length}`}
                    </span>
                  </>
                )}
              </div>
              <div className="catalog-toolbar-right">
                {filterDropdownMenu}
              </div>
            </div>

            {/* ── Active filter tags ── */}
            {activeFiltersBar}

            {/* ── Grid de productos ── */}
            <section className="catalog-grid-section" id="productos">
              <div className="products-grid">
                {loading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map(n => <ProductCardSkeleton key={n} />)
                ) : sortedProducts.length > 0 ? (
                  sortedProducts.map((product, index) => (
                    <div key={product.id} className={`stagger-anim delay-${(index % 8) + 1}`}>
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  <div className="no-products-found animate-fade-in">
                    <div className="no-products-icon">🧱</div>
                    <h3>¡Uy! No hay bloques por aquí</h3>
                    <p>Ningún producto coincide con los filtros aplicados. Intentá ajustarlos para seguir construyendo.</p>
                    <button className="primary-btn-outline" onClick={resetFilters}>Limpiar Filtros</button>
                  </div>
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

export default Catalog;
