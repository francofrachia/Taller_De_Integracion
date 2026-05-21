import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
    const { busqueda, setBusqueda, cartCount, usuario, logout } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header>
            <nav className="navbar">
                <Link to="/" className="logo">
                    Bloque Mundo 🧱
                </Link>

                <ul className="nav-links">
                    <li>
                        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                            Inicio
                        </NavLink>
                    </li>
                    <li><a href="#contacto">Contacto</a></li>
                    <li><a href="#acerca-de">Acerca de</a></li>
                    {usuario ? (
                        <li>
                            <button 
                                onClick={handleLogout} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    fontFamily: 'inherit',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    padding: 0
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    ) : (
                        <li>
                            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                                Iniciar sesión
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="nav-actions">
                    <div className="search-container">
                        <input 
                            type="text" 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                            placeholder="¿Qué estás buscando?"
                        />
                        <button type="button" aria-label="Buscar">🔍</button>
                    </div>
                    
                    <div className="icons">
                        <span className="icon-heart" role="img" aria-label="Favoritos">🤍</span>
                        <Link to="/carrito" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span className="icon-cart" role="img" aria-label="Carrito">
                                🛒 <small className="cart-count">{cartCount}</small>
                            </span>
                        </Link>
                        
                        {usuario ? (
                            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span className="icon-user" role="img" aria-label="Usuario">👤</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                    {usuario.nombre || usuario.email.split('@')[0]}
                                </span>
                            </div>
                        ) : (
                            <Link to="/login" className="icon-button" aria-label="Perfil">
                                <span className="icon-user" role="img" aria-label="Usuario">👤</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
