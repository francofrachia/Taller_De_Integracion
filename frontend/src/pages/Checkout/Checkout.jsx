import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import mercadopagoLogo from '../../assets/mercadopago-seeklogo.png';
import './Checkout.css';

export default function Checkout() {
    const { cart, API_URL, usuario, productos, loading, isInitialized, token, removerDelCarrito, actualizarCantidadCarrito } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedItemIds = location.state?.selectedItems || null;
    const directPurchase = location.state?.directPurchase || null;
    const checkoutItems = directPurchase 
        ? [directPurchase]
        : (cart && cart.items ? (selectedItemIds ? cart.items.filter(i => selectedItemIds.includes(String(i.id_producto))) : cart.items) : []);

    const [formData, setFormData] = useState(() => {
        const savedData = sessionStorage.getItem('checkout_form_data');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error("Error parsing saved checkout form data:", e);
            }
        }
        return {
            nombre: '',
            apellido: '',
            codigoPostal: '',
            departamentoPiso: '',
            ciudad: '',
            telefono: '',
            correo: '',
            aceptoTerminos: false
        };
    });

    const [errors, setErrors] = useState({});

    // Guardar cambios del formulario en sessionStorage
    useEffect(() => {
        sessionStorage.setItem('checkout_form_data', JSON.stringify(formData));
    }, [formData]);

    // Seguridad: Redirecciones
    useEffect(() => {
        if (!isInitialized) {
            console.log("[Checkout] App Context aun no inicializado, esperando...");
            return;
        }

        const storedUser = localStorage.getItem('usuario_bloquemundo') || sessionStorage.getItem('usuario_bloquemundo');
        console.log("[Checkout] Checking redirect conditions:", {
            storedUser: storedUser ? "Exists" : "Null",
            usuario: usuario ? (usuario.email || usuario.correo) : "Null",
            cart: cart ? `${cart.items?.length || 0} items` : "Null"
        });

        if (!storedUser && !usuario) {
            console.log("[Checkout] No stored user found and no usuario context, redirecting to /login.");
            navigate('/login', { state: { from: '/checkout' }, replace: true });
        } else if (!directPurchase && cart !== null && (!cart.items || cart.items.length === 0)) {
            console.log("[Checkout] Cart is empty, redirecting to /carrito.");
            navigate('/carrito', { replace: true });
        }
    }, [usuario, cart, navigate, loading, isInitialized, directPurchase]);

    // Pre-llenar datos del usuario (sólo si no están llenos ya en formData)
    useEffect(() => {
        if (usuario) {
            setFormData(prev => ({
                ...prev,
                nombre: prev.nombre || usuario.nombre || '',
                correo: prev.correo || usuario.email || usuario.correo || ''
            }));
        }
    }, [usuario]);

    // Mostrar skeleton si el contexto aun no termino de inicializarse completamente
    if (!isInitialized || !usuario || !usuario.id_usuario || (!directPurchase && cart === null)) {
        return (
            <div className="checkout-page">
                <Navbar />
                
                <main className="checkout-main container">
                    {/* Breadcrumb Skeleton */}
                    <div className="breadcrumb">
                        <span className="skeleton" style={{ width: '50px', height: '14px' }}></span> / <span className="skeleton" style={{ width: '50px', height: '14px' }}></span> / <span className="skeleton" style={{ width: '80px', height: '14px' }}></span>
                    </div>

                    <div className="checkout-layout">
                        {/* Sección Izquierda: Formulario de Facturación Skeleton */}
                        <div className="checkout-form-section">
                            <h2>
                                <span className="skeleton" style={{ width: '100px', height: '28px' }}></span>
                            </h2>
                            <div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><span className="skeleton" style={{ width: '60px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>

                                    <div className="form-group">
                                        <label><span className="skeleton" style={{ width: '60px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>
                                </div>

                                <div className="form-grid grid-3">
                                    <div className="form-group span-2">
                                        <label><span className="skeleton" style={{ width: '90px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>

                                    <div className="form-group">
                                        <label><span className="skeleton" style={{ width: '110px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><span className="skeleton" style={{ width: '50px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>

                                    <div className="form-group">
                                        <label><span className="skeleton" style={{ width: '120px', height: '14px' }}></span></label>
                                        <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label><span className="skeleton" style={{ width: '50px', height: '14px' }}></span></label>
                                    <div className="skeleton" style={{ width: '100%', height: '48px' }}></div>
                                </div>

                                <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
                                    <div className="skeleton" style={{ width: '180px', height: '20px' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Sección Derecha: Resumen de la Orden Skeleton */}
                        <div className="checkout-summary-section">
                            <div className="summary-box">
                                <div className="summary-items" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {[1, 2].map((n) => (
                                        <div className="summary-item-row" key={n} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="skeleton" style={{ width: '120px', height: '14px' }}></span>
                                            <span className="skeleton" style={{ width: '60px', height: '14px' }}></span>
                                        </div>
                                    ))}
                                </div>

                                <hr />

                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="skeleton" style={{ width: '60px', height: '14px' }}></span>
                                    <span className="skeleton" style={{ width: '50px', height: '14px' }}></span>
                                </div>
                                
                                <hr />
                                
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="skeleton" style={{ width: '55px', height: '14px' }}></span>
                                    <span className="skeleton" style={{ width: '40px', height: '14px' }}></span>
                                </div>
                                
                                <hr />
                                
                                <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="skeleton" style={{ width: '70px', height: '20px' }}></span>
                                    <span className="skeleton" style={{ width: '80px', height: '20px' }}></span>
                                </div>


                                <div className="payment-options-centered">
                                    <div className="skeleton" style={{ width: '140px', height: '28px' }}></div>
                                </div>

                                <div className="skeleton" style={{ width: '100%', height: '45px' }}></div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    // Validación de stock en tiempo real
    const hasAnyQtyError = checkoutItems.length > 0 && productos ? checkoutItems.some(item => {
        const productData = productos.find(p => p.id_producto === item.id_producto);
        const itemStock = productData ? productData.stock : (item.stock !== undefined ? item.stock : 0);
        return itemStock !== undefined && item.cantidad > itemStock;
    }) : false;

    // Detectar si hay artículos con problemas de stock para mostrar una alerta en la parte superior
    const itemsConProblemasStock = checkoutItems.length > 0 && productos ? checkoutItems.filter(item => {
        const productData = productos.find(p => p.id_producto === item.id_producto);
        const itemStock = productData ? productData.stock : (item.stock !== undefined ? item.stock : 0);
        return itemStock !== undefined && item.cantidad > itemStock;
    }) : [];

    const handleAutoAdjustCheckout = async () => {
        for (const item of itemsConProblemasStock) {
            const productData = productos.find(p => p.id_producto === item.id_producto);
            const itemStock = productData ? productData.stock : 0;
            if (itemStock === 0) {
                await removerDelCarrito(item.id_producto);
            } else {
                await actualizarCantidadCarrito(item.id_producto, itemStock);
            }
        }
        // Si el carrito se vacía o se limpia, redirigir
        if (cart && cart.items && (cart.items.length <= itemsConProblemasStock.length)) {
            navigate('/carrito');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let finalValue = value;
        if (name === 'telefono') {
            const digits = value.replace(/\D/g, '').slice(0, 10);
            if (digits.length <= 4) {
                finalValue = digits;
            } else {
                finalValue = `${digits.slice(0, 4)}-${digits.slice(4)}`;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : finalValue
        }));
        // Limpiar el error del campo que se está editando
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const tempErrors = {};
        if (!formData.nombre.trim()) tempErrors.nombre = 'El nombre es obligatorio';
        if (!formData.apellido.trim()) tempErrors.apellido = 'El apellido es obligatorio';
        if (!formData.codigoPostal.trim()) tempErrors.codigoPostal = 'El código postal es obligatorio';
        if (!formData.ciudad.trim()) tempErrors.ciudad = 'La ciudad es obligatoria';
        
        if (!formData.correo.trim()) {
            tempErrors.correo = 'El correo es obligatorio';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.correo)) {
                tempErrors.correo = 'El formato del correo es inválido';
            }
        }

        if (formData.telefono) {
            const cleanTel = formData.telefono.replace(/\D/g, '');
            if (cleanTel.length > 0 && cleanTel.length !== 10) {
                tempErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos (ej: 3446-123456)';
            }
        }

        if (!formData.aceptoTerminos) {
            tempErrors.aceptoTerminos = 'Debes aceptar los términos de uso';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasAnyQtyError) {
            alert('Por favor, corregí las cantidades con exceso de stock en el carrito antes de comprar.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            // Mapeamos los items al formato que espera el backend
            const cartItems = checkoutItems.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const response = await fetch(`${API_URL}/mercadopago/create_preference`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    cartItems,
                    isDirectPurchase: !!directPurchase
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.init_point) {
                    window.location.href = data.init_point;
                } else {
                    alert('Error: No se recibió la URL de pago de Mercado Pago.');
                }
            } else {
                const errData = await response.json();
                alert(`Error al procesar el pago: ${errData.error}`);
            }
        } catch (error) {
            console.error('Error al iniciar pago:', error);
            alert('Error al conectar con la pasarela de pagos.');
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = checkoutItems.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
    const shipping = 0; // Envío gratis
    const total = subtotal + shipping;

    return (
        <div className="checkout-page">
            <Navbar />
            
            <main className="checkout-main container">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <Link to="/carrito">Carrito</Link> / <span className="current">Facturación</span>
                </div>

                <div className="checkout-layout">
                    {/* Sección Izquierda: Formulario de Facturación */}
                    <div className={`checkout-form-section ${hasAnyQtyError ? 'checkout-form-blocked' : ''}`}>
                        {hasAnyQtyError && (
                            <div className="checkout-form-overlay animate-fade-in">
                                <div className="overlay-content">
                                    <span className="overlay-icon">🛒</span>
                                    <h3>Tu carrito necesita ajustes</h3>
                                    <p>Algunos productos superaron el stock disponible. Ajustá las cantidades antes de completar la facturación.</p>
                                    <div className="overlay-actions">
                                        <button 
                                            className="btn-yellow"
                                            onClick={handleAutoAdjustCheckout}
                                        >
                                            ⚡ Auto-ajustar cantidades
                                        </button>
                                        <Link to="/carrito" className="btn-outline" style={{ textDecoration: 'none' }}>
                                            Ir al Carrito
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        <h2>Factura</h2>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre*</label>
                                    <input 
                                        type="text" 
                                        id="nombre" 
                                        name="nombre" 
                                        value={formData.nombre} 
                                        onChange={handleChange} 
                                        className={errors.nombre ? 'input-error' : ''} 
                                        placeholder="Nombre"
                                        disabled={hasAnyQtyError}
                                    />
                                    {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="apellido">Apellido*</label>
                                    <input 
                                        type="text" 
                                        id="apellido" 
                                        name="apellido" 
                                        value={formData.apellido} 
                                        onChange={handleChange} 
                                        className={errors.apellido ? 'input-error' : ''} 
                                        placeholder="Apellido"
                                        disabled={hasAnyQtyError}
                                    />
                                    {errors.apellido && <span className="error-text">{errors.apellido}</span>}
                                </div>
                            </div>

                            <div className="form-grid grid-3">
                                <div className="form-group span-2">
                                    <label htmlFor="codigoPostal">Código Postal*</label>
                                    <input 
                                        type="text" 
                                        id="codigoPostal" 
                                        name="codigoPostal" 
                                        value={formData.codigoPostal} 
                                        onChange={handleChange} 
                                        className={errors.codigoPostal ? 'input-error' : ''} 
                                        placeholder="Código Postal"
                                        disabled={hasAnyQtyError}
                                    />
                                    {errors.codigoPostal && <span className="error-text">{errors.codigoPostal}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="departamentoPiso">Departamento/Piso</label>
                                    <input 
                                        type="text" 
                                        id="departamentoPiso" 
                                        name="departamentoPiso" 
                                        value={formData.departamentoPiso} 
                                        onChange={handleChange} 
                                        placeholder="Depto / Piso"
                                        disabled={hasAnyQtyError}
                                    />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="ciudad">Ciudad*</label>
                                    <input 
                                        type="text" 
                                        id="ciudad" 
                                        name="ciudad" 
                                        value={formData.ciudad} 
                                        onChange={handleChange} 
                                        className={errors.ciudad ? 'input-error' : ''} 
                                        placeholder="Ciudad"
                                        disabled={hasAnyQtyError}
                                    />
                                    {errors.ciudad && <span className="error-text">{errors.ciudad}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telefono">Número de Teléfono</label>
                                    <input 
                                        type="tel" 
                                        id="telefono" 
                                        name="telefono" 
                                        value={formData.telefono} 
                                        onChange={handleChange} 
                                        className={errors.telefono ? 'input-error' : ''}
                                        placeholder="Número de Teléfono"
                                        disabled={hasAnyQtyError}
                                    />
                                    {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="correo">Correo*</label>
                                <input 
                                    type="email" 
                                    id="correo" 
                                    name="correo" 
                                    value={formData.correo} 
                                    onChange={handleChange} 
                                    className={errors.correo ? 'input-error' : ''} 
                                    placeholder="Correo Electrónico"
                                    disabled={hasAnyQtyError}
                                />
                                {errors.correo && <span className="error-text">{errors.correo}</span>}
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-container">
                                    <input 
                                        type="checkbox" 
                                        id="aceptoTerminos" 
                                        name="aceptoTerminos" 
                                        checked={formData.aceptoTerminos} 
                                        onChange={handleChange} 
                                        className={errors.aceptoTerminos ? 'input-error' : ''}
                                        disabled={hasAnyQtyError}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-label-text">Acepto los Términos de Uso*</span>
                                </label>
                                {errors.aceptoTerminos && <span className="error-text error-checkbox">{errors.aceptoTerminos}</span>}
                            </div>
                        </form>
                    </div>

                    {/* Sección Derecha: Resumen de la Orden */}
                    <div className="checkout-summary-section">
                        <div className="summary-box">
                            <div className="summary-items">
                                {checkoutItems.map(item => {
                                    const productData = productos ? productos.find(p => p.id_producto === item.id_producto) : null;
                                    const itemStock = productData ? productData.stock : (item.stock !== undefined ? item.stock : Infinity);
                                    const isOverStock = item.cantidad > itemStock;
                                    return (
                                        <div className={`summary-item-row ${isOverStock ? 'summary-item-row--issue' : ''}`} key={item.id_producto}>
                                            <span className="summary-item-name">
                                                {isOverStock && <span className="summary-item-warning">⚠️ </span>}
                                                {item.nombre} x {item.cantidad}
                                            </span>
                                            <span className="summary-item-total">${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr />

                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            
                            <hr />
                            
                            <div className="summary-row">
                                <span>Envío:</span>
                                <span>Free</span>
                            </div>
                            
                            <hr />
                            
                            <div className="summary-row total-row">
                                <span>Total:</span>
                                <span>${total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}</span>
                            </div>


                            <div className="payment-options-centered">
                                <img src={mercadopagoLogo} alt="Mercado Pago" className="mercadopago-centered-logo" />
                            </div>

                            {/* Alerta inline de stock en el resumen del checkout */}
                            {hasAnyQtyError && (
                                <div className="checkout-stock-inline-alert animate-fade-in">
                                    <div className="inline-alert-header">
                                        <span className="inline-alert-icon">⚠️</span>
                                        <strong>Stock insuficiente</strong>
                                    </div>
                                    <ul className="inline-alert-list">
                                        {itemsConProblemasStock.map(item => {
                                            const productData = productos.find(p => p.id_producto === item.id_producto);
                                            const itemStock = productData ? productData.stock : 0;
                                            return (
                                                <li key={item.id_producto}>
                                                    <span className="inline-alert-product">{item.nombre}</span>
                                                    <span>: {itemStock === 0 ? <span className="alert-badge-out">Agotado</span> : <span className="alert-badge-low">Máx {itemStock} u.</span>}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <button 
                                        className="btn-yellow full-width"
                                        onClick={handleAutoAdjustCheckout}
                                        style={{ fontSize: '13px', fontWeight: '700' }}
                                    >
                                        ⚡ Auto-ajustar cantidades
                                    </button>
                                </div>
                            )}

                            <button 
                                type="button" 
                                className="btn-yellow full-width"
                                onClick={handleSubmit}
                                disabled={isProcessing || hasAnyQtyError}
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
                            </button>

                            {hasAnyQtyError && (
                                <p className="checkout-warning-text">
                                    ⚠️ Ajustá las cantidades para poder confirmar.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
