import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import mercadopagoLogo from '../../assets/mercadopago-seeklogo.png';
import './Checkout.css';

export default function Checkout() {
    const { cart, API_URL, usuario, productos, loading, isInitialized } = useContext(AppContext);
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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
        } else if (cart !== null && (!cart.items || cart.items.length === 0)) {
            console.log("[Checkout] Cart is empty, redirecting to /carrito.");
            navigate('/carrito', { replace: true });
        }
    }, [usuario, cart, navigate, loading, isInitialized]);

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
    if (!isInitialized || !usuario || !usuario.id_usuario || cart === null) {
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

                                <div className="coupon-section">
                                    <div className="skeleton" style={{ flex: 1, height: '44px' }}></div>
                                    <div className="skeleton" style={{ width: '110px', height: '44px' }}></div>
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
    const hasAnyQtyError = cart && cart.items && productos ? cart.items.some(item => {
        const productData = productos.find(p => p.id_producto === item.id_producto);
        const itemStock = productData ? productData.stock : (item.stock || 0);
        return itemStock && item.cantidad > itemStock;
    }) : false;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
            const cartItems = cart.items.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const response = await fetch(`${API_URL}/mercadopago/create_preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cartItems,
                    id_usuario: usuario.id_usuario
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

    const subtotal = cart.items.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
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
                    <div className="checkout-form-section">
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
                                        placeholder="Número de Teléfono"
                                    />
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
                                {cart.items.map(item => (
                                    <div className="summary-item-row" key={item.id_producto}>
                                        <span className="summary-item-name">{item.nombre} x {item.cantidad}</span>
                                        <span className="summary-item-total">${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                                    </div>
                                ))}
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

                            <div className="coupon-section">
                                <input 
                                    type="text" 
                                    placeholder="Código de Cupón" 
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                />
                                <button className="btn-yellow" type="button">Aplicar Cupón</button>
                            </div>

                            <div className="payment-options-centered">
                                <img src={mercadopagoLogo} alt="Mercado Pago" className="mercadopago-centered-logo" />
                            </div>

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
                                    ⚠️ Por favor, corregí las cantidades en el carrito.
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
