import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Account.css';

// ───────────────────────────────────────────────
// Sub-componente: Sección de Direcciones
// ───────────────────────────────────────────────
function DireccionesSection({ usuario, API_URL }) {
    const [direccion, setDireccion] = useState(null);
    const [localidades, setLocalidades] = useState([]);
    const [loadingDir, setLoadingDir] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', msg: '' });

    const [formDir, setFormDir] = useState({
        calle: '',
        numero: '',
        id_localidad: '',
    });

    const fetchDireccion = useCallback(async () => {
        setLoadingDir(true);
        try {
            const res = await fetch(`${API_URL}/direccion?id_usuario=${usuario.id_usuario}`);
            if (res.ok) {
                const data = await res.json();
                setDireccion(data.direccion); // null o objeto
            }
        } catch (e) {
            console.error('Error al obtener dirección:', e);
        } finally {
            setLoadingDir(false);
        }
    }, [API_URL, usuario.id_usuario]);

    const fetchLocalidades = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/direccion/localidades`);
            if (res.ok) {
                const data = await res.json();
                setLocalidades(data);
            }
        } catch (e) {
            console.error('Error al obtener localidades:', e);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchDireccion();
        fetchLocalidades();
    }, [fetchDireccion, fetchLocalidades]);

    // Pre-llenar form con dirección existente al abrir edición
    const handleEdit = () => {
        if (direccion) {
            setFormDir({
                calle: direccion.calle || '',
                numero: String(direccion.numero || ''),
                id_localidad: String(direccion.id_localidad || ''),
            });
        } else {
            setFormDir({ calle: '', numero: '', id_localidad: '' });
        }
        setFeedback({ type: '', msg: '' });
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setFeedback({ type: '', msg: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formDir.calle.trim() || !formDir.numero || !formDir.id_localidad) {
            setFeedback({ type: 'error', msg: 'Completá todos los campos.' });
            return;
        }
        setIsSaving(true);
        setFeedback({ type: '', msg: '' });
        try {
            const res = await fetch(`${API_URL}/direccion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuario.id_usuario,
                    calle: formDir.calle.trim(),
                    numero: formDir.numero,
                    id_localidad: formDir.id_localidad,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setDireccion(data.direccion);
                setShowForm(false);
                setFeedback({ type: 'success', msg: 'Dirección guardada correctamente.' });
            } else {
                setFeedback({ type: 'error', msg: data.error || 'Error al guardar.' });
            }
        } catch (e) {
            setFeedback({ type: 'error', msg: 'Error de conexión.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que querés eliminar esta dirección?')) return;
        setIsDeleting(true);
        setFeedback({ type: '', msg: '' });
        try {
            const res = await fetch(`${API_URL}/direccion`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario: usuario.id_usuario }),
            });
            const data = await res.json();
            if (res.ok) {
                setDireccion(null);
                setShowForm(false);
                setFeedback({ type: 'success', msg: 'Dirección eliminada.' });
            } else {
                setFeedback({ type: 'error', msg: data.error || 'Error al eliminar.' });
            }
        } catch (e) {
            setFeedback({ type: 'error', msg: 'Error de conexión.' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loadingDir) {
        return (
            <div className="account-placeholder-section">
                <h2 className="account-section-title">Mi Dirección</h2>
                <div className="skeleton" style={{ width: '100%', height: '100px', borderRadius: '8px' }}></div>
            </div>
        );
    }

    return (
        <div className="account-placeholder-section">
            <h2 className="account-section-title">Mi Dirección</h2>

            {feedback.msg && (
                <p className={`save-feedback ${feedback.type}`} style={{ marginBottom: '16px' }}>
                    {feedback.type === 'success' ? '✔ ' : '✖ '}{feedback.msg}
                </p>
            )}

            {/* Dirección actual */}
            {direccion && !showForm && (
                <div className="dir-card">
                    <div className="dir-card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                    </div>
                    <div className="dir-card-body">
                        <p className="dir-card-line">{direccion.calle} {direccion.numero}</p>
                        <p className="dir-card-sub">{direccion.localidad_nombre} — CP {direccion.cp}</p>
                    </div>
                    <div className="dir-card-actions">
                        <button className="dir-btn-edit" onClick={handleEdit}>Editar</button>
                        <button
                            className="dir-btn-delete"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Sin dirección + no mostrando form */}
            {!direccion && !showForm && (
                <div className="placeholder-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                        <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    </svg>
                    <p>Todavía no tenés ninguna dirección guardada.</p>
                </div>
            )}

            {/* Botón agregar (visible cuando no hay form abierto y no hay direccion) */}
            {!showForm && !direccion && (
                <button className="btn-add-dir" onClick={handleEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    Agregar dirección
                </button>
            )}

            {/* Formulario agregar/editar */}
            {showForm && (
                <form className="dir-form" onSubmit={handleSave} noValidate>
                    <h3 className="dir-form-title">{direccion ? 'Editar dirección' : 'Nueva dirección'}</h3>

                    <div className="account-form-grid">
                        <div className="account-form-group">
                            <label htmlFor="dir-calle">Calle</label>
                            <input
                                type="text"
                                id="dir-calle"
                                placeholder="Ej: San Martín"
                                value={formDir.calle}
                                onChange={e => setFormDir(p => ({ ...p, calle: e.target.value }))}
                                maxLength={100}
                            />
                        </div>
                        <div className="account-form-group">
                            <label htmlFor="dir-numero">Número</label>
                            <input
                                type="number"
                                id="dir-numero"
                                placeholder="Ej: 456"
                                value={formDir.numero}
                                onChange={e => setFormDir(p => ({ ...p, numero: e.target.value }))}
                                min="1"
                            />
                        </div>
                        <div className="account-form-group" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="dir-localidad">Localidad</label>
                            <select
                                id="dir-localidad"
                                value={formDir.id_localidad}
                                onChange={e => setFormDir(p => ({ ...p, id_localidad: e.target.value }))}
                                className="dir-select"
                            >
                                <option value="">— Seleccioná una localidad —</option>
                                {localidades.map(loc => (
                                    <option key={loc.id_localidad} value={loc.id_localidad}>
                                        {loc.nombre} (CP {loc.cp})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="account-form-actions">
                        <button type="button" className="btn-cancel" onClick={handleCancelForm} disabled={isSaving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Dirección'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ───────────────────────────────────────────────
// Componente principal: Account
// ───────────────────────────────────────────────
export default function Account() {
    const { usuario, isInitialized, loading, API_URL, setUsuario } = useContext(AppContext);
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('perfil');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
    });

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                correo: usuario.email || usuario.correo || '',
            });
        }
    }, [usuario]);

    useEffect(() => {
        if (!isInitialized) return;
        if (!usuario || !usuario.id_usuario) {
            navigate('/login', { state: { from: '/cuenta' }, replace: true });
        }
    }, [isInitialized, usuario, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaveSuccess(false);
        setSaveError('');
    };

    const handleCancel = () => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                correo: usuario.email || usuario.correo || '',
            });
        }
        setSaveSuccess(false);
        setSaveError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        setSaveError('');

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuario.id_usuario,
                    nombre: formData.nombre.trim(),
                    apellido: formData.apellido.trim(),
                    email: formData.correo.trim(),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                // Actualizar usuario en contexto y storage para que persista
                const updatedUser = { ...usuario, ...data.usuario };
                setUsuario(updatedUser);
                localStorage.setItem('usuario_bloquemundo', JSON.stringify(updatedUser));
                sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(updatedUser));
                setSaveSuccess(true);
            } else {
                setSaveError(data.error || 'Error al guardar los cambios.');
            }
        } catch (e) {
            setSaveError('Error de conexión. Intentá de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Skeleton ───
    if (!isInitialized || loading) {
        return (
            <div className="account-page">
                <Navbar />
                <main className="account-main container">
                    <div className="account-layout">
                        <aside className="account-sidebar">
                            <div className="skeleton" style={{ width: '140px', height: '16px', marginBottom: '20px' }}></div>
                            {[1, 2, 3].map(n => (
                                <div key={n} className="skeleton" style={{ width: '110px', height: '14px', marginBottom: '12px', marginLeft: '12px' }}></div>
                            ))}
                            <div className="skeleton" style={{ width: '120px', height: '16px', margin: '20px 0 12px' }}></div>
                            {[1, 2].map(n => (
                                <div key={n} className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '12px', marginLeft: '12px' }}></div>
                            ))}
                        </aside>
                        <section className="account-content">
                            <div className="skeleton" style={{ width: '180px', height: '26px', marginBottom: '30px' }}></div>
                            <div className="account-form-grid">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="account-form-group">
                                        <div className="skeleton" style={{ width: '80px', height: '13px', marginBottom: '8px' }}></div>
                                        <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '6px' }}></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!usuario) return null;

    const sidebarItems = {
        administrar: [
            { key: 'perfil', label: 'Mi perfil' },
            { key: 'direcciones', label: 'Dirección' },
        ],
        compras: [
            { key: 'pendientes', label: 'Pendientes' },
            { key: 'historial', label: 'Compras Anteriores' },
        ],
    };

    return (
        <div className="account-page">
            <Navbar />

            <main className="account-main container">
                <div className="account-topbar">
                    <div className="breadcrumb">
                        <Link to="/">Inicio</Link>
                        <span className="breadcrumb-sep">›</span>
                        <span className="current">Mi Cuenta</span>
                    </div>
                    <span className="account-welcome">
                        Bienvenido! <strong>{usuario.nombre}</strong>
                    </span>
                </div>

                <div className="account-layout">
                    {/* Sidebar */}
                    <aside className="account-sidebar">
                        <div className="sidebar-group">
                            <p className="sidebar-group-title">Administrar Mi Cuenta</p>
                            <ul>
                                {sidebarItems.administrar.map(item => (
                                    <li key={item.key}>
                                        <button
                                            className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
                                            onClick={() => setActiveSection(item.key)}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="sidebar-group">
                            <p className="sidebar-group-title">Mis Compras</p>
                            <ul>
                                {sidebarItems.compras.map(item => (
                                    <li key={item.key}>
                                        <button
                                            className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
                                            onClick={() => setActiveSection(item.key)}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="sidebar-group">
                            <button
                                className={`sidebar-link sidebar-link-solo ${activeSection === 'favoritos' ? 'active' : ''}`}
                                onClick={() => setActiveSection('favoritos')}
                            >
                                Favoritos
                            </button>
                        </div>
                    </aside>

                    {/* Contenido */}
                    <section className="account-content">

                        {/* ─── Mi Perfil ─── */}
                        {activeSection === 'perfil' && (
                            <form onSubmit={handleSave} noValidate>
                                <h2 className="account-section-title">Editar Tu Perfil</h2>

                                <div className="account-form-grid">
                                    <div className="account-form-group">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="----"
                                        />
                                    </div>
                                    <div className="account-form-group">
                                        <label htmlFor="apellido">Apellido</label>
                                        <input
                                            type="text"
                                            id="apellido"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleChange}
                                            placeholder="----"
                                        />
                                    </div>
                                    <div className="account-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label htmlFor="correo">Correo</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            placeholder="bloquemundo@gmail.com"
                                        />
                                    </div>
                                </div>

                                {/* Cambio de contraseña — no funcional aún */}
                                <div className="password-section">
                                    <h3 className="password-section-title">Cambio de Contraseña</h3>
                                    <p className="password-section-note">
                                        El cambio de contraseña estará disponible cuando se habilite el acceso con cuenta propia.
                                    </p>
                                    <div className="account-form-group">
                                        <input type="password" placeholder="Contraseña actual" disabled className="input-disabled" />
                                    </div>
                                    <div className="account-form-group">
                                        <input type="password" placeholder="Nueva Contraseña" disabled className="input-disabled" />
                                    </div>
                                    <div className="account-form-group">
                                        <input type="password" placeholder="Confirmar Contraseña" disabled className="input-disabled" />
                                    </div>
                                </div>

                                {saveSuccess && <p className="save-feedback success">✔ Cambios guardados correctamente.</p>}
                                {saveError && <p className="save-feedback error">✖ {saveError}</p>}

                                <div className="account-form-actions">
                                    <button type="button" className="btn-cancel" onClick={handleCancel} disabled={isSaving}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-save" disabled={isSaving}>
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ─── Direcciones (funcional) ─── */}
                        {activeSection === 'direcciones' && (
                            <DireccionesSection usuario={usuario} API_URL={API_URL} />
                        )}

                        {/* ─── Compras Pendientes ─── */}
                        {activeSection === 'pendientes' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Compras Pendientes</h2>
                                <div className="placeholder-empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                    </svg>
                                    <p>No tenés compras pendientes.</p>
                                </div>
                            </div>
                        )}

                        {/* ─── Historial ─── */}
                        {activeSection === 'historial' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Compras Anteriores</h2>
                                <div className="placeholder-empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5z"/>
                                        <path d="M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                                    </svg>
                                    <p>Todavía no realizaste ninguna compra.</p>
                                </div>
                            </div>
                        )}

                        {/* ─── Favoritos ─── */}
                        {activeSection === 'favoritos' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Favoritos</h2>
                                <div className="placeholder-empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z"/>
                                    </svg>
                                    <p>Todavía no marcaste productos como favoritos.</p>
                                    <Link to="/" className="btn-save" style={{ marginTop: '16px', display: 'inline-block', textDecoration: 'none' }}>
                                        Explorar productos
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
