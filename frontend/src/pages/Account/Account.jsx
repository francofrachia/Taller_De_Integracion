import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import placeholderImg from '../../assets/imagen no existente BM.webp';
import './Account.css';

// ───────────────────────────────────────────────
// Sub-componente: Sección de Direcciones
// ───────────────────────────────────────────────
function DireccionesSection({ API_URL, token }) {
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
        if (!token) return;
        setLoadingDir(true);
        try {
            const res = await fetch(`${API_URL}/direccion`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setDireccion(data.direccion); // null o objeto
            } else {
                console.error('Error al obtener dirección: status', res.status);
            }
        } catch (e) {
            console.error('Error al obtener dirección:', e);
        } finally {
            setLoadingDir(false);
        }
    }, [API_URL, token]);

    const fetchLocalidades = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/direccion/localidades`);
            if (res.ok) {
                const data = await res.json();
                setLocalidades(data);
            } else {
                console.error('Error al obtener localidades: status', res.status);
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
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
                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
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
                        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                        <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </svg>
                    <p>Todavía no tenés ninguna dirección guardada.</p>
                </div>
            )}

            {/* Botón agregar (visible cuando no hay form abierto y no hay direccion) */}
            {!showForm && !direccion && (
                <button className="btn-add-dir" onClick={handleEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
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
// Sub-componente: Tarjeta de Compra
// ───────────────────────────────────────────────
function PurchaseCard({ compra, isActive }) {
    const [copied, setCopied] = useState(false);

    const formattedDate = new Date(compra.fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusClass = compra.estado ? compra.estado.toLowerCase().replace(/\s+/g, '-') : '';

    const translatePaymentMethod = (method) => {
        switch (method) {
            case 'mercado_pago': return 'Mercado Pago';
            case 'tarjeta': return 'Tarjeta de Crédito/Débito';
            case 'transferencia': return 'Transferencia Bancaria';
            case 'efectivo': return 'Efectivo';
            default: return method || 'Mercado Pago';
        }
    };

    const handleCopy = () => {
        if (compra.codigo_seguimiento) {
            navigator.clipboard.writeText(compra.codigo_seguimiento);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Calcular progreso e índice del stepper
    let progressWidth = '0%';
    let currentStepIndex = 0; // 0: Pago, 1: Prep, 2: Camino, 3: Entregado

    if (compra.estado === 'Esperando Pago') {
        progressWidth = '0%';
        currentStepIndex = 0;
    } else if (compra.estado === 'Pago confirmado') {
        progressWidth = '33%';
        currentStepIndex = 1;
    } else if (compra.estado === 'Preparando Pedido') {
        progressWidth = '50%';
        currentStepIndex = 1;
    } else if (compra.estado === 'Pedido Despachado') {
        progressWidth = '66%';
        currentStepIndex = 2;
    } else if (compra.estado === 'En Camino') {
        progressWidth = '83%';
        currentStepIndex = 2;
    } else if (compra.estado === 'Entregado') {
        progressWidth = '100%';
        currentStepIndex = 3;
    }

    return (
        <div className="purchase-card">
            <div className="purchase-header">
                <div className="purchase-meta">
                    <span className="purchase-id">Compra #{compra.id_compra}</span>
                    <span className="purchase-date">{formattedDate} hs</span>
                </div>
                <div className="purchase-status-container">
                    <span className={`purchase-status-badge ${statusClass}`}>
                        {compra.estado}
                    </span>
                </div>
            </div>

            <div className="purchase-items-list">
                {compra.lineas && compra.lineas.map((linea, index) => (
                    <div className="purchase-item-row" key={index}>
                        <div className="purchase-item-img-wrapper">
                            <img
                                src={linea.imagen_url || placeholderImg}
                                alt={linea.nombre}
                                className="purchase-item-img"
                                onError={(e) => { e.target.src = placeholderImg; }}
                            />
                        </div>
                        <div className="purchase-item-details">
                            <div>
                                <h4 className="purchase-item-name">{linea.nombre}</h4>
                                <span className="purchase-item-qty">Cantidad: {linea.cantidad}</span>
                            </div>
                            <span className="purchase-item-price">
                                ${parseFloat(linea.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nueva sección: Línea de Tiempo de Seguimiento (Solo si isActive es true) */}
            {isActive && (
                <div className="purchase-timeline-wrapper">
                    <p className="timeline-section-title">Seguimiento de tu pedido</p>
                    <div className="purchase-tracking-timeline">
                        {/* Línea de progreso de fondo */}
                        <div className="timeline-progress-bar">
                            <div className="timeline-progress-fill" style={{ width: progressWidth }}></div>
                        </div>

                        {/* Pasos de la Línea de Tiempo */}
                        {[
                            { label: 'Pago', key: 'pago', emoji: '💰', desc: compra.estado === 'Esperando Pago' ? 'Esperando Pago' : 'Aprobado' },
                            { label: 'Preparación', key: 'prep', emoji: '📦', desc: compra.estado === 'Preparando Pedido' ? 'Armando paquete' : (compra.estado === 'Pago confirmado' ? 'En espera' : (currentStepIndex > 1 ? 'Completado' : 'Pendiente')) },
                            { label: 'En Camino', key: 'camino', emoji: '🚚', desc: compra.estado === 'En Camino' ? 'En tránsito' : (compra.estado === 'Pedido Despachado' ? 'Despachado' : (currentStepIndex > 2 ? 'Completado' : 'Pendiente')) },
                            { label: 'Entregado', key: 'entregado', emoji: '🏠', desc: compra.estado === 'Entregado' ? '¡Entregado!' : 'Pendiente' }
                        ].map((step, index) => {
                            let stepClass = 'pending';
                            if (index < currentStepIndex || (index === 0 && compra.estado !== 'Esperando Pago')) {
                                stepClass = 'completed';
                            } else if (index === currentStepIndex) {
                                stepClass = compra.estado === 'Esperando Pago' ? 'active-warning' : 'active';
                            }

                            return (
                                <div className={`timeline-step ${stepClass}`} key={step.key}>
                                    <div className="step-circle">
                                        <span className="step-emoji">{step.emoji}</span>
                                        {stepClass === 'completed' && (
                                            <div className="step-check-badge">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <span className="step-label">{step.label}</span>
                                    <span className="step-desc">{step.desc}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Código de Seguimiento de Envío */}
            {isActive && compra.codigo_seguimiento && (
                <div className="tracking-code-container">
                    <div className="tracking-code-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="tracking-icon">
                            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732-1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                        </svg>
                        <span className="tracking-label">Código de Seguimiento:</span>
                        <code className="tracking-code-val">{compra.codigo_seguimiento}</code>
                    </div>
                    <button
                        type="button"
                        className={`btn-copy-tracking ${copied ? 'copied' : ''}`}
                        onClick={handleCopy}
                    >
                        {copied ? '¡Copiado! ✓' : 'Copiar código'}
                    </button>
                </div>
            )}

            <div className="purchase-summary">
                <span className="purchase-payment-method">
                    Método de Pago: <strong>{translatePaymentMethod(compra.metodo_pago)}</strong>
                </span>
                <span className="purchase-total-price">
                    Total: <span>${parseFloat(compra.total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────
// Componente principal: Account
// ───────────────────────────────────────────────
export default function Account() {
    const { usuario, isInitialized, loading, API_URL, setUsuario, productos, favoritos, token, actualizarAvatar } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [activeSection, setActiveSection] = useState(location.state?.section || 'perfil');

    useEffect(() => {
        if (location.state?.section) {
            setActiveSection(location.state.section);
        }
    }, [location.state]);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFeedback, setAvatarFeedback] = useState({ type: '', msg: '' });

    const [compras, setCompras] = useState([]);
    const [loadingCompras, setLoadingCompras] = useState(true);

    const comprasPendientes = useMemo(() => compras.filter(c => c.estado !== 'Entregado' && c.estado !== 'Cancelado'), [compras]);
    const comprasHistorial = useMemo(() => compras.filter(c => c.estado === 'Entregado' || c.estado === 'Cancelado'), [compras]);

    const fetchCompras = useCallback(async () => {
        if (!token) return;
        setLoadingCompras(true);
        try {
            const res = await fetch(`${API_URL}/compras`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCompras(data.compras || []);
            } else {
                console.error('Error al obtener compras: status', res.status);
                setCompras([]);
            }
        } catch (e) {
            console.error('Error al obtener compras:', e);
        } finally {
            setLoadingCompras(false);
        }
    }, [API_URL, token]);

    useEffect(() => {
        fetchCompras();
    }, [fetchCompras]);

    // ── Sección cambio de contraseña ──
    // passStep: 'locked' | 'verifying' | 'unlocked'
    const [passStep, setPassStep] = useState('locked');
    const [unlockPassValue, setUnlockPassValue] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [showUnlockEye, setShowUnlockEye] = useState(false);
    const [showPassNueva, setShowPassNueva] = useState(false);
    const [showPassConfirmar, setShowPassConfirmar] = useState(false);
    const [passwordData, setPasswordData] = useState({ nueva: '', confirmar: '' });
    const [passError, setPassError] = useState('');

    const handleAvatarChange = async (path) => {
        if (!usuario) return;
        const currentAvatar = usuario.avatar_url || '/images/logo mario.png';
        if (currentAvatar === path) return; // Ya está seleccionado
        setAvatarFeedback({ type: '', msg: '' });
        try {
            const res = await actualizarAvatar(path);
            if (res.success) {
                setAvatarFeedback({ type: 'success', msg: '¡Avatar actualizado con éxito!' });
                setTimeout(() => {
                    setAvatarFeedback({ type: '', msg: '' });
                }, 3000);
            } else {
                setAvatarFeedback({ type: 'error', msg: res.error || 'Error al actualizar el avatar.' });
            }
        } catch (err) {
            setAvatarFeedback({ type: 'error', msg: 'Error de conexión al actualizar avatar.' });
        }
    };

    const handlePassChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPassError('');
    };

    // Verifica la contraseña actual de forma local (el servidor la valida al guardar)
    const handleUnlock = () => {
        if (!unlockPassValue) {
            setUnlockError('Ingresá tu contraseña actual para continuar.');
            return;
        }
        setUnlockError('');
        setPassStep('unlocked');
    };

    const handleLockPass = () => {
        setPassStep('locked');
        setUnlockPassValue('');
        setUnlockError('');
        setPasswordData({ nueva: '', confirmar: '' });
        setPassError('');
    };

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
    });

    const resetFormData = useCallback(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                correo: usuario.email || usuario.correo || '',
                telefono: usuario.telefono || '',
            });
        }
    }, [usuario]);

    useEffect(() => {
        resetFormData();
    }, [resetFormData]);

    const isDirty = usuario && (
        formData.nombre !== (usuario.nombre || '') ||
        formData.apellido !== (usuario.apellido || '') ||
        formData.telefono !== (usuario.telefono || '') ||
        (passStep === 'unlocked' && (passwordData.nueva !== '' || passwordData.confirmar !== ''))
    );

    useEffect(() => {
        if (!isInitialized) return;
        if (!usuario || !usuario.id_usuario) {
            navigate('/login', { state: { from: '/cuenta' }, replace: true });
        }
    }, [isInitialized, usuario, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === 'telefono') {
            // Eliminar todo lo que no sea número
            const digits = value.replace(/\D/g, '').slice(0, 10);
            if (digits.length <= 4) {
                finalValue = digits;
            } else {
                finalValue = `${digits.slice(0, 4)}-${digits.slice(4)}`;
            }
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        setSaveSuccess(false);
        setSaveError('');
    };

    const handleCancel = () => {
        resetFormData();
        handleLockPass();
        setSaveSuccess(false);
        setSaveError('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveSuccess(false);
        setSaveError('');
        setPassError('');

        // Validar formato del teléfono si fue ingresado
        if (formData.telefono) {
            const cleanTel = formData.telefono.replace(/\D/g, '');
            if (cleanTel.length > 0 && cleanTel.length < 10) {
                setSaveError('El número de teléfono debe tener exactamente 10 dígitos (ej: 3446-123456).');
                return;
            }
        }

        // Validar campos de nueva contraseña si está desbloqueada
        if (passStep === 'unlocked') {
            const nue = passwordData.nueva;
            const conf = passwordData.confirmar;
            if (nue || conf) {
                if (!nue || !conf) {
                    setPassError('Completá ambos campos de contraseña.');
                    return;
                }
                if (nue.length < 6 || nue.length > 50) {
                    setPassError('La nueva contraseña debe tener entre 6 y 50 caracteres.');
                    return;
                }
                if (nue !== conf) {
                    setPassError('Las contraseñas no coinciden.');
                    return;
                }
                if (nue === unlockPassValue) {
                    setPassError('La nueva contraseña debe ser diferente a la actual.');
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            // 1. Guardar datos del perfil
            const profileRes = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    apellido: formData.apellido.trim(),
                    email: formData.correo.trim(),
                    telefono: formData.telefono.trim(),
                }),
            });
            const profileData = await profileRes.json();
            if (!profileRes.ok) {
                setSaveError(profileData.error || 'Error al guardar los cambios.');
                return;
            }
            const updatedUser = { ...usuario, ...profileData.usuario };
            setUsuario(updatedUser);
            localStorage.setItem('usuario_bloquemundo', JSON.stringify(updatedUser));
            sessionStorage.setItem('usuario_bloquemundo', JSON.stringify(updatedUser));

            // 2. Cambiar contraseña si hay datos
            if (passStep === 'unlocked' && passwordData.nueva) {
                const passRes = await fetch(`${API_URL}/auth/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        contrasenaActual: unlockPassValue,
                        contrasenaNueva: passwordData.nueva,
                        confirmarContrasena: passwordData.confirmar,
                    }),
                });
                const passData = await passRes.json();
                if (!passRes.ok) {
                    setSaveError(passData.error || 'Error al cambiar la contraseña.');
                    return;
                }
                // Reset sección de contraseña tras éxito
                handleLockPass();
            }

            setSaveSuccess(true);
        } catch (err) {
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

                                {/* Panel de Avatares */}
                                <div className="avatar-selection-panel">
                                    <label className="avatar-panel-label">Tu Personaje Lego</label>
                                    <p className="avatar-panel-desc">
                                        Elegí el avatar que te represente. Aparecerá en el menú de navegación superior:
                                    </p>

                                    <div className="avatar-grid">
                                        {[
                                            { id: 'mario', path: '/images/logo mario.png', name: 'Lego Mario' },
                                            { id: 'luigi', path: '/images/lego_luigi.png', name: 'Lego Luigi' },
                                            { id: 'batman', path: '/images/lego_batman.png', name: 'Lego Batman' }
                                        ].map(av => {
                                            const isSelected = (usuario.avatar_url || '/images/logo mario.png') === av.path;
                                            return (
                                                <div
                                                    key={av.id}
                                                    className={`avatar-option-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleAvatarChange(av.path)}
                                                    title={`Seleccionar ${av.name}`}
                                                >
                                                    <div className="avatar-img-wrapper">
                                                        <img src={av.path} alt={av.name} className="avatar-option-img" />
                                                        {isSelected && (
                                                            <div className="avatar-check-badge">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="avatar-option-name">{av.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {avatarFeedback.msg && (
                                        <p className={`save-feedback ${avatarFeedback.type}`} style={{ marginTop: '16px', marginBottom: '0' }}>
                                            {avatarFeedback.type === 'success' ? '✔ ' : '✖ '}{avatarFeedback.msg}
                                        </p>
                                    )}
                                </div>

                                <div className="account-form-grid">
                                    <div className="account-form-group">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
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
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                    <div className="account-form-group">
                                        <label htmlFor="telefono">Teléfono</label>
                                        <input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="Ej: 3446-123456"
                                        />
                                    </div>
                                    <div className="account-form-group">
                                        <label htmlFor="correo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Correo
                                            <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                🔒 Protegido
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            disabled
                                            style={{
                                                backgroundColor: '#f5f5f5',
                                                color: '#888',
                                                cursor: 'not-allowed',
                                                border: '1px solid #ddd'
                                            }}
                                            placeholder="bloquemundo@gmail.com"
                                        />
                                        <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0 4px' }}>
                                            El correo electrónico es el identificador principal de tu cuenta y no puede ser modificado.
                                        </p>
                                    </div>
                                </div>

                                {/* Nueva sección premium de datos informativos de la cuenta */}
                                <div className="account-info-panel" style={{
                                    marginTop: '25px',
                                    padding: '18px 24px',
                                    background: '#f8f9fa',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '20px',
                                    marginBottom: '30px'
                                }}>
                                    <div className="info-panel-item">
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>
                                            ID de Usuario
                                        </span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', display: 'block', marginTop: '4px' }}>
                                            #{usuario.id_usuario}
                                        </span>
                                    </div>
                                    <div className="info-panel-item">
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>
                                            Tipo de Cuenta
                                        </span>
                                        <span className={`role-badge ${usuario.rol}`} style={{
                                            display: 'inline-block',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            marginTop: '6px',
                                            textTransform: 'uppercase',
                                            backgroundColor: usuario.rol === 'administrador' ? '#EF5350' : '#FFD700',
                                            color: usuario.rol === 'administrador' ? '#ffffff' : '#1a1a1a'
                                        }}>
                                            {usuario.rol === 'administrador' ? 'Administrador' : 'Cliente'}
                                        </span>
                                    </div>
                                    <div className="info-panel-item">
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>
                                            Miembro Desde
                                        </span>
                                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginTop: '6px' }}>
                                            {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            }) : 'Reciente'}
                                        </span>
                                    </div>
                                </div>

                                {/* Cambio de contraseña */}
                                <div className="password-section">
                                    <h3 className="password-section-title">Cambio de Contraseña</h3>

                                    {usuario.contrasena === 'OAUTH_USER' ? (
                                        <div className="oauth-password-warning">
                                            <div className="oauth-warning-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                                                </svg>
                                            </div>
                                            <div className="oauth-warning-text">
                                                <p><strong>Inicio de Sesión con Google Activo</strong></p>
                                                <p>Tu cuenta se autentica a través de Google. No necesitas configurar o cambiar contraseñas locales en BloqueMundo.</p>
                                            </div>
                                        </div>
                                    ) : passStep === 'locked' ? (
                                        /* ── Estado bloqueado ── */
                                        <div className="pass-locked-gate">
                                            <div className="pass-locked-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                                </svg>
                                            </div>
                                            <div className="pass-locked-text">
                                                <p className="pass-locked-title">Contraseña protegida</p>
                                                <p className="pass-locked-desc">Para modificar tu contraseña debés verificar tu identidad primero.</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-unlock-pass"
                                                onClick={() => setPassStep('verifying')}
                                            >
                                                Quiero cambiar mi contraseña
                                            </button>
                                        </div>
                                    ) : passStep === 'verifying' ? (
                                        /* ── Verificar identidad ── */
                                        <div className="pass-verify-gate">
                                            <p className="password-section-note" style={{ marginBottom: '14px' }}>
                                                Ingresá tu contraseña actual para habilitar el cambio:
                                            </p>
                                            <div className="account-form-group" style={{ marginBottom: '12px' }}>
                                                <label htmlFor="pass-unlock">Contraseña Actual</label>
                                                <div className="pass-input-wrapper">
                                                    <input
                                                        type={showUnlockEye ? 'text' : 'password'}
                                                        id="pass-unlock"
                                                        value={unlockPassValue}
                                                        onChange={e => { setUnlockPassValue(e.target.value); setUnlockError(''); }}
                                                        onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                                                        placeholder="Ingresá tu contraseña actual"
                                                        autoComplete="current-password"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        className="eye-toggle"
                                                        onClick={() => setShowUnlockEye(p => !p)}
                                                        tabIndex={-1}
                                                        aria-label="Mostrar/ocultar contraseña"
                                                    >
                                                        {showUnlockEye ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                                {unlockError && <p className="save-feedback error" style={{ marginTop: '8px', marginBottom: 0 }}>✖ {unlockError}</p>}
                                            </div>
                                            <div className="pass-verify-actions">
                                                <button type="button" className="btn-cancel" onClick={handleLockPass}>Cancelar</button>
                                                <button type="button" className="btn-save" onClick={handleUnlock}>Continuar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Desbloqueada: ingresar nueva contraseña ── */
                                        <div className="password-fields-container">
                                            <div className="pass-unlocked-badge">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z" />
                                                </svg>
                                                Identidad verificada — ingresá tu nueva contraseña
                                                <button type="button" className="pass-relock-btn" onClick={handleLockPass} title="Cancelar cambio">
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="account-form-group" style={{ marginBottom: '16px' }}>
                                                <label htmlFor="pass-nueva">Nueva Contraseña</label>
                                                <div className="pass-input-wrapper">
                                                    <input
                                                        type={showPassNueva ? 'text' : 'password'}
                                                        id="pass-nueva"
                                                        name="nueva"
                                                        value={passwordData.nueva}
                                                        onChange={handlePassChange}
                                                        placeholder="Mínimo 6 caracteres"
                                                        autoComplete="new-password"
                                                    />
                                                    <button type="button" className="eye-toggle" onClick={() => setShowPassNueva(p => !p)} tabIndex={-1}>
                                                        {showPassNueva ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="account-form-group" style={{ marginBottom: '8px' }}>
                                                <label htmlFor="pass-confirmar">Confirmar Nueva Contraseña</label>
                                                <div className="pass-input-wrapper">
                                                    <input
                                                        type={showPassConfirmar ? 'text' : 'password'}
                                                        id="pass-confirmar"
                                                        name="confirmar"
                                                        value={passwordData.confirmar}
                                                        onChange={handlePassChange}
                                                        placeholder="Repetir nueva contraseña"
                                                        autoComplete="new-password"
                                                    />
                                                    <button type="button" className="eye-toggle" onClick={() => setShowPassConfirmar(p => !p)} tabIndex={-1}>
                                                        {showPassConfirmar ? <FiEyeOff /> : <FiEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            {passError && <p className="save-feedback error" style={{ marginTop: '8px' }}>✖ {passError}</p>}
                                        </div>
                                    )}
                                </div>

                                {saveSuccess && <p className="save-feedback success">✔ Cambios guardados correctamente.</p>}
                                {saveError && <p className="save-feedback error">✖ {saveError}</p>}

                                <div className="account-form-actions">
                                    {isDirty && (
                                        <button type="button" className="btn-cancel" onClick={handleCancel} disabled={isSaving}>
                                            Cancelar
                                        </button>
                                    )}
                                    <button type="submit" className="btn-save" disabled={isSaving}>
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        )}



                        {/* ─── Direcciones (funcional) ─── */}
                        {activeSection === 'direcciones' && (
                            <DireccionesSection API_URL={API_URL} token={token} />
                        )}

                        {/* ─── Compras Pendientes ─── */}
                        {activeSection === 'pendientes' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Compras en Curso y Pendientes</h2>
                                {loadingCompras ? (
                                    <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '10px' }}></div>
                                ) : comprasPendientes.length === 0 ? (
                                    <div className="placeholder-empty">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                        </svg>
                                        <p>No tenés compras activas o pendientes en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="purchases-list">
                                        {comprasPendientes.map(compra => (
                                            <PurchaseCard key={compra.id_compra} compra={compra} isActive={true} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Historial ─── */}
                        {activeSection === 'historial' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Compras Anteriores y Entregas</h2>
                                {loadingCompras ? (
                                    <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '10px' }}></div>
                                ) : comprasHistorial.length === 0 ? (
                                    <div className="placeholder-empty">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5z" />
                                            <path d="M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                                        </svg>
                                        <p>No tenés compras finalizadas en tu historial.</p>
                                    </div>
                                ) : (
                                    <div className="purchases-list">
                                        {comprasHistorial.map(compra => (
                                            <PurchaseCard key={compra.id_compra} compra={compra} isActive={false} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Favoritos ─── */}
                        {activeSection === 'favoritos' && (
                            <div className="account-placeholder-section">
                                <h2 className="account-section-title">Favoritos</h2>
                                {favoritos.length === 0 ? (
                                    <div className="placeholder-empty">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748z" />
                                        </svg>
                                        <p>Todavía no marcaste productos como favoritos.</p>
                                        <Link to="/" className="btn-save" style={{ marginTop: '16px', display: 'inline-block', textDecoration: 'none' }}>
                                            Explorar productos
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="products-grid" style={{ marginTop: '20px' }}>
                                        {productos
                                            .filter(p => favoritos.includes(p.id_producto))
                                            .map(item => {
                                                const precioNum = parseFloat(item.precio) || 0;
                                                const productMapped = {
                                                    id: item.id_producto,
                                                    title: item.nombre || item.titulo || 'Producto sin nombre',
                                                    description: item.descripcion || '',
                                                    categoryName: item.categoria_nombre || '',
                                                    price: precioNum,
                                                    oldPrice: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
                                                    discount: item.descuento || null,
                                                    rating: item.calificacion || 5,
                                                    reviews: item.reseñas || 0,
                                                    image: item.imagen_url,
                                                    collection: item.tipo_coleccion ? item.tipo_coleccion.toLowerCase().trim() : 'otros',
                                                    age: item.edad_recomendada || null,
                                                    stock: item.stock || 0
                                                };
                                                return <ProductCard key={productMapped.id} product={productMapped} />;
                                            })}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
