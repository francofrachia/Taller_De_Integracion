import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Navbar.css';
import { FiSearch, FiHeart, FiShoppingCart, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { busqueda, setBusqueda, productos, cartCount, favoritos, usuario, logout, loginTooltipVisible, setLoginTooltipVisible } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState(busqueda || '');

  useEffect(() => {
    setLocalSearch(busqueda || '');
  }, [busqueda]);

  const filteredProducts = (localSearch && localSearch.trim().length > 0 && Array.isArray(productos)) 
    ? productos.filter(p => {
        const productName = p?.nombre || p?.title || '';
        return productName.toLowerCase().includes(localSearch.toLowerCase());
      }).slice(0, 5)
    : [];

  const handleProductSelect = (id) => {
    setLocalSearch('');
    setBusqueda('');
    setIsSearchFocused(false);
    navigate(`/producto/${id}`);
  };

  const submitSearch = () => {
    if (localSearch.trim().length > 0) {
      setBusqueda(localSearch);
      setIsSearchFocused(false);
      navigate('/productos', { state: { clearFilters: true } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </button>

        <div className="navbar-logo">
          <Link to="/">
            <h1>
              <span className="logo-word bloq">Bloque</span>
              <span className="logo-word mund">Mundo</span>
            </h1>
          </Link>
        </div>
        
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => isActive ? "active-link" : ""} 
              onClick={() => { setIsMenuOpen(false); setLocalSearch(''); setBusqueda(''); }}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/productos" 
              className={({ isActive }) => isActive ? "active-link" : ""} 
              onClick={() => { setIsMenuOpen(false); setLocalSearch(''); setBusqueda(''); }}
            >
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/nosotros" 
              className={({ isActive }) => isActive ? "active-link" : ""} 
              onClick={() => { setIsMenuOpen(false); setLocalSearch(''); setBusqueda(''); }}
            >
              Sobre la APP
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/promociones" 
              className={({ isActive }) => isActive ? "active-link" : ""} 
              onClick={() => { setIsMenuOpen(false); setLocalSearch(''); setBusqueda(''); }}
            >
              Ofertas
            </NavLink>
          </li>
        </ul>

        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={(e) => {
              setIsSearchFocused(true);
              e.target.select();
            }}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch();
            }}
          />
          <button className="search-btn" onClick={submitSearch} aria-label="Buscar">
            <FiSearch size={18} />
          </button>
          
          {isSearchFocused && localSearch.trim().length > 0 && (
            <div className="navbar-search-dropdown">
              {filteredProducts.length > 0 ? (
                <>
                  {filteredProducts.map(prod => {
                    const prodId = prod.id_producto || prod.id;
                    const prodName = prod.nombre || prod.title || 'Sin título';
                    const prodPrice = prod.precio || prod.price || 0;
                    const prodImg = prod.imagen_url || prod.image || '/images/placeholder.png';

                    return (
                      <div 
                        key={prodId} 
                        className="search-dropdown-item"
                        onMouseDown={() => handleProductSelect(prodId)}
                      >
                        <img src={prodImg} alt={prodName} />
                        <div className="search-dropdown-item-info">
                          <span className="search-dropdown-item-title">{prodName}</span>
                          <span className="search-dropdown-item-price">${prodPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div 
                    className="search-dropdown-view-all"
                    onMouseDown={submitSearch}
                  >
                    Ver todos los resultados
                  </div>
                </>
              ) : (
                <div className="search-dropdown-empty">No hay coincidencias</div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-icons">
          <Link 
            to={usuario ? "/cuenta" : "/login"} 
            state={usuario ? { section: 'favoritos' } : null}
            className="icon-btn favorites-link" 
            title="Favoritos"
          >
            <FiHeart size={20} />
            {favoritos && favoritos.length > 0 && (
              <span className="navbar-badge">
                {favoritos.length}
              </span>
            )}
          </Link>
          
          <Link to="/carrito" className="icon-btn cart-link" title="Carrito">
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="navbar-badge">
                {cartCount}
              </span>
            )}
          </Link>

          {usuario && usuario.id_usuario ? (
            <div className={`user-menu ${usuario.rol === 'admin' ? 'is-admin' : ''}`}>
              {usuario.rol === 'admin' && (
                <button onClick={() => navigate('/admin')} className="icon-btn navbar-admin-btn" title="Panel de Administrador">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 -960 960 960">
                    <path d="M722.5-297.5Q740-315 740-340t-17.5-42.5Q705-400 680-400t-42.5 17.5Q620-365 620-340t17.5 42.5Q655-280 680-280t42.5-17.5ZM680-160q31 0 57-14.5t42-38.5q-22-13-47-20t-52-7q-27 0-52 7t-47 20q16 24 42 38.5t57 14.5ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v227q-19-8-39-14.5t-41-9.5v-147l-240-90-240 90v188q0 47 12.5 94t35 89.5Q310-290 342-254t71 60q11 32 29 61t41 52q-1 0-1.5.5t-1.5.5Zm200 0q-83 0-141.5-58.5T480-280q0-83 58.5-141.5T680-480q83 0 141.5 58.5T880-280q0 83-58.5 141.5T680-80ZM480-494Z"/>
                  </svg>
                </button>
              )}

              <Link
                to="/cuenta"
                className="user-profile-link"
                title="Mi Cuenta"
              >
                <div className="avatar-wrapper">
                  <img 
                    src={usuario.avatar_url || "/images/logo mario.png"} 
                    alt="Avatar" 
                    className="navbar-avatar" 
                  />
                  {usuario.rol === 'admin' && (
                    <div className="admin-badge">
                      ADMIN
                    </div>
                  )}
                </div>
                <span className="username-text">
                  {usuario.nombre}
                </span>
              </Link>
              
              <button onClick={handleLogout} className="icon-btn logout-btn" title="Cerrar Sesión">
                <FiLogOut size={24} />
              </button>
            </div>
          ) : (
            <div className="login-btn-wrapper">
              <Link 
                onClick={() => setLoginTooltipVisible(false)} 
                to="/login" 
                className={`icon-btn login-link ${loginTooltipVisible ? 'tooltip-active' : ''}`} 
                title="Iniciar Sesión"
              >
                <FiUser size={20} />
              </Link>
              {loginTooltipVisible && (
                <>
                  <div 
                    className="login-overlay-backdrop" 
                    onClick={() => setLoginTooltipVisible(false)}
                  />
                  <div className="login-tooltip-bubble">
                    Debes iniciar sesión para realizar esta acción
                    <div className="login-tooltip-arrow"></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {isMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
    </nav>
  );
};

export default Navbar;
