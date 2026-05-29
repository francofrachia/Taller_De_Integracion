import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './MiCuenta.css';

const MiCuenta = () => {
  const { usuario, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('mi-perfil');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    direccion: '',
  });
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved'

  useEffect(() => {
    window.scrollTo(0, 0);
    if (usuario) {
      const nombreCompleto = usuario.nombre || '';
      const partes = nombreCompleto.trim().split(' ');
      const apellido = partes.length > 1 ? partes.slice(1).join(' ') : '';
      const nombre = partes[0] || '';
      setFormData({
        nombre,
        apellido,
        correo: usuario.email || '',
        direccion: usuario.direccion || '',
      });
    }
  }, [usuario]);

  const nombreCompleto = (usuario && usuario.nombre) || '';
  const partes = nombreCompleto.trim().split(' ');
  const origNombre = partes[0] || '';
  const origApellido = partes.length > 1 ? partes.slice(1).join(' ') : '';
  const origCorreo = (usuario && (usuario.email || usuario.correo)) || '';
  const origDireccion = (usuario && usuario.direccion) || '';

  const isDirty = usuario && (
    formData.nombre !== origNombre ||
    formData.apellido !== origApellido ||
    formData.correo !== origCorreo ||
    formData.direccion !== origDireccion
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    // Simulación — cuando implementen el backend de actualización de perfil, conectar aquí
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);
    }, 800);
  };

  const handleCancel = () => {
    if (usuario) {
      const nombreCompleto = usuario.nombre || '';
      const partes = nombreCompleto.trim().split(' ');
      setFormData({
        nombre: partes[0] || '',
        apellido: partes.slice(1).join(' ') || '',
        correo: usuario.email || '',
        direccion: usuario.direccion || '',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Si no hay usuario, redirigir al login
  if (!usuario) {
    return (
      <div className="cuenta-page">
        <Navbar />
        <main className="cuenta-main container">
          <div className="cuenta-no-session">
            <h2>Necesitás iniciar sesión</h2>
            <p>Para ver tu cuenta, por favor iniciá sesión primero.</p>
            <Link to="/login" className="cuenta-btn-primary">Iniciar Sesión</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'mi-perfil':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Editar Tu Perfil</h2>
            <form className="perfil-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cuenta-nombre">Nombre</label>
                  <input
                    id="cuenta-nombre"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cuenta-apellido">Apellido</label>
                  <input
                    id="cuenta-apellido"
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cuenta-correo">Correo</label>
                  <input
                    id="cuenta-correo"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="—"
                    readOnly
                    className="input-readonly"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cuenta-direccion">Dirección</label>
                  <input
                    id="cuenta-direccion"
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
              </div>

              <div className="form-section-title">Cambio de Contraseña</div>
              <div className="form-group full-width">
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  disabled
                  className="input-disabled"
                  title="El cambio de contraseña estará disponible próximamente"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Nueva Contraseña"
                    disabled
                    className="input-disabled"
                    title="El cambio de contraseña estará disponible próximamente"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirmar Contraseña"
                    disabled
                    className="input-disabled"
                    title="El cambio de contraseña estará disponible próximamente"
                  />
                </div>
              </div>

              <div className="form-actions">
                {isDirty && (
                  <button type="button" className="cuenta-btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className={`cuenta-btn-primary${saveStatus === 'saving' ? ' btn-loading' : ''}${saveStatus === 'saved' ? ' btn-saved' : ''}`}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '¡Guardado!' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'direcciones':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Mis Direcciones</h2>
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <p>No tenés direcciones guardadas todavía.</p>
            </div>
          </div>
        );

      case 'datos-pago':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Datos de Pago</h2>
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p>No tenés métodos de pago guardados todavía.</p>
            </div>
          </div>
        );

      case 'pendientes':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Compras Pendientes</h2>
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>No tenés compras pendientes.</p>
            </div>
          </div>
        );

      case 'compras-anteriores':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Compras Anteriores</h2>
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No tenés compras anteriores registradas.</p>
            </div>
          </div>
        );

      case 'favoritos':
        return (
          <div className="cuenta-panel">
            <h2 className="panel-title">Favoritos</h2>
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <p>No tenés productos en favoritos todavía.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nombreMostrado = usuario.nombre || usuario.email || 'Usuario';

  return (
    <div className="cuenta-page">
      <Navbar />
      <main className="cuenta-main">
        <div className="container">

          {/* Breadcrumb + bienvenida */}
          <div className="cuenta-header">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Inicio</Link>
              <span className="breadcrumb-sep">/</span>
              <span>Mi Cuenta</span>
            </nav>
            <span className="cuenta-bienvenida">¡Bienvenido! {nombreMostrado}</span>
          </div>

          {/* Layout de dos columnas */}
          <div className="cuenta-layout">

            {/* Sidebar */}
            <aside className="cuenta-sidebar">
              <div className="sidebar-section">
                <p className="sidebar-section-title">Administrar Mi Cuenta</p>
                <ul>
                  <li>
                    <button
                      className={`sidebar-link${activeSection === 'mi-perfil' ? ' active' : ''}`}
                      onClick={() => setActiveSection('mi-perfil')}
                    >
                      Mi perfil
                    </button>
                  </li>
                  <li>
                    <button
                      className={`sidebar-link${activeSection === 'direcciones' ? ' active' : ''}`}
                      onClick={() => setActiveSection('direcciones')}
                    >
                      Direcciones
                    </button>
                  </li>
                  <li>
                    <button
                      className={`sidebar-link${activeSection === 'datos-pago' ? ' active' : ''}`}
                      onClick={() => setActiveSection('datos-pago')}
                    >
                      Datos de Pago
                    </button>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <p className="sidebar-section-title">Mis Compras</p>
                <ul>
                  <li>
                    <button
                      className={`sidebar-link${activeSection === 'pendientes' ? ' active' : ''}`}
                      onClick={() => setActiveSection('pendientes')}
                    >
                      Pendientes
                    </button>
                  </li>
                  <li>
                    <button
                      className={`sidebar-link${activeSection === 'compras-anteriores' ? ' active' : ''}`}
                      onClick={() => setActiveSection('compras-anteriores')}
                    >
                      Compras Anteriores
                    </button>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <p className="sidebar-section-title">
                  <button
                    className={`sidebar-link${activeSection === 'favoritos' ? ' active' : ''}`}
                    onClick={() => setActiveSection('favoritos')}
                  >
                    Favoritos
                  </button>
                </p>
              </div>

              <div className="sidebar-section sidebar-logout">
                <button className="sidebar-link logout-link" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </aside>

            {/* Contenido principal */}
            <section className="cuenta-content">
              {renderContent()}
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MiCuenta;
