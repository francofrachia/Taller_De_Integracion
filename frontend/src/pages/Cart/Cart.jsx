import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Cart.css';

export default function Cart() {
    const { cart, actualizarCantidadCarrito, removerDelCarrito, vaciarCarrito, API_URL, usuario, productos, isInitialized } = useContext(AppContext);
    const navigate = useNavigate();
    const [localQuantities, setLocalQuantities] = useState({});

    const handleQuantityChange = (id_producto, currentQty, change, stock) => {
        const baseQty = localQuantities[id_producto] !== undefined 
            ? (parseInt(localQuantities[id_producto], 10) || 1) 
            : currentQty;
        const newQty = baseQty + change;
        if (newQty > 0) {
            setLocalQuantities(prev => ({ ...prev, [id_producto]: newQty }));
            if (!stock || newQty <= stock) {
                actualizarCantidadCarrito(id_producto, newQty);
            }
        }
    };

    const handleRemove = (id_producto) => {
        removerDelCarrito(id_producto);
    };

    const hasAnyQtyError = cart && cart.items && productos ? cart.items.some(item => {
        const qty = localQuantities[item.id_producto] !== undefined 
            ? localQuantities[item.id_producto] 
            : item.cantidad;
        if (qty === '' || isNaN(parseInt(qty, 10)) || parseInt(qty, 10) < 1) {
            return true;
        }
        const productData = productos.find(p => p.id_producto === item.id_producto);
        const itemStock = productData ? productData.stock : (item.stock || 0);
        return itemStock && parseInt(qty, 10) > itemStock;
    }) : false;

    const handleCheckout = () => {
        if (!cart || !cart.items || cart.items.length === 0 || hasAnyQtyError) return;
        navigate('/checkout');
    };

    const subtotal = cart && cart.items ? cart.items.reduce((sum, item) => {
        const qty = localQuantities[item.id_producto] !== undefined 
            ? (parseInt(localQuantities[item.id_producto], 10) || 0) 
            : item.cantidad;
        return sum + (parseFloat(item.precio) * qty);
    }, 0) : 0;
    const shipping = 0; // Envío gratis
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            <Navbar />
            
            <main className="cart-main container">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <span className="current">Carrito</span>
                </div>

                {/* Skeleton mientras el contexto no esta inicializado */}
                {!isInitialized ? (
                    <div className="cart-layout">
                        <div className="cart-items-section">
                            <div className="cart-table-header">
                                <span>Producto</span>
                                <span>Precio</span>
                                <span>Cantidad</span>
                                <span>Total</span>
                            </div>
                            {[1, 2, 3].map(n => (
                                <div className="cart-item" key={n} style={{ opacity: 0.7 }}>
                                    <div className="item-product">
                                        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '4px', flexShrink: 0 }}></div>
                                        <div className="skeleton" style={{ width: '150px', height: '16px', marginLeft: '12px' }}></div>
                                    </div>
                                    <div className="item-price"><div className="skeleton" style={{ width: '60px', height: '16px' }}></div></div>
                                    <div className="item-quantity"><div className="skeleton" style={{ width: '90px', height: '38px', borderRadius: '4px' }}></div></div>
                                    <div className="item-total"><div className="skeleton" style={{ width: '60px', height: '16px' }}></div></div>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary-section">
                            <div className="summary-box">
                                <div className="skeleton" style={{ width: '120px', height: '22px', marginBottom: '20px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '10px' }}></div>
                                <hr />
                                <div className="skeleton" style={{ width: '100%', height: '14px', margin: '10px 0' }}></div>
                                <hr />
                                <div className="skeleton" style={{ width: '100%', height: '20px', margin: '10px 0' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '45px', borderRadius: '4px', marginTop: '15px' }}></div>
                            </div>
                        </div>
                    </div>
                ) : !usuario || !usuario.id_usuario ? (
                    <div className="empty-cart">
                        <h2>Iniciá sesión para ver tu carrito</h2>
                        <Link to="/login" className="primary-btn-outline" style={{marginTop: '20px', display: 'inline-block'}}>
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                ) : !cart || !cart.items || cart.items.length === 0 ? (
                    <div className="empty-cart">
                        <h2>Tu carrito está vacío</h2>
                        <Link to="/" className="primary-btn-outline" style={{marginTop: '20px', display: 'inline-block'}}>
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items-section">
                            <div className="cart-table-header">
                                <span>Producto</span>
                                <span>Precio</span>
                                <span>Cantidad</span>
                                <span>Total</span>
                            </div>

                            <div className="cart-items-list">
                                {cart.items.map(item => {
                                    const qty = localQuantities[item.id_producto] !== undefined 
                                        ? localQuantities[item.id_producto] 
                                        : item.cantidad;
                                    const productData = productos ? productos.find(p => p.id_producto === item.id_producto) : null;
                                    const itemStock = productData ? productData.stock : (item.stock || 0);
                                    const isInvalidQty = qty !== '' && itemStock && parseInt(qty, 10) > itemStock;

                                    return (
                                        <div className="cart-item" key={item.id_producto}>
                                            <div className="item-product">
                                                <button className="remove-btn" onClick={() => handleRemove(item.id_producto)}>×</button>
                                                {/* Si hay imagen, la mostramos. Asumiendo que item.imagenes es un array */}
                                                {item.imagenes && item.imagenes[0] ? (
                                                    <img src={item.imagenes[0]} alt={item.nombre} />
                                                ) : (
                                                    <div className="img-placeholder"></div>
                                                )}
                                                <span className="item-name">{item.nombre}</span>
                                            </div>
                                            <div className="item-price">${item.precio}</div>
                                            <div className="item-quantity">
                                                <div className={`quantity-controls ${isInvalidQty ? 'qty-controls-error' : ''}`}>
                                                    <input 
                                                        type="number" 
                                                        value={qty}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '') {
                                                                setLocalQuantities(prev => ({ ...prev, [item.id_producto]: '' }));
                                                                return;
                                                            }
                                                            const num = parseInt(val, 10);
                                                            if (!isNaN(num)) {
                                                                setLocalQuantities(prev => ({ ...prev, [item.id_producto]: num }));
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            let val = parseInt(e.target.value, 10);
                                                            if (isNaN(val) || val < 1) {
                                                                val = 1;
                                                                setLocalQuantities(prev => ({ ...prev, [item.id_producto]: 1 }));
                                                                if (item.cantidad !== 1) {
                                                                    actualizarCantidadCarrito(item.id_producto, 1);
                                                                }
                                                                return;
                                                            }
                                                            setLocalQuantities(prev => ({ ...prev, [item.id_producto]: val }));
                                                            if (!itemStock || val <= itemStock) {
                                                                if (val !== item.cantidad) {
                                                                    actualizarCantidadCarrito(item.id_producto, val);
                                                                }
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        min="1"
                                                        max={itemStock || undefined}
                                                    />
                                                    <div className="qty-arrows">
                                                        <button onClick={() => handleQuantityChange(item.id_producto, item.cantidad, 1, itemStock)}>▲</button>
                                                        <button onClick={() => handleQuantityChange(item.id_producto, item.cantidad, -1, itemStock)}>▼</button>
                                                    </div>
                                                </div>
                                                {isInvalidQty && (
                                                    <div className="qty-error-msg" style={{ color: '#d32f2f', fontSize: '11px', marginTop: '4px', fontWeight: '500', display: 'block', textAlign: 'center' }}>
                                                        Máx: {itemStock} u
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-total">
                                                ${(item.precio * (qty !== '' ? (parseInt(qty, 10) || 0) : item.cantidad)).toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="cart-actions">
                                <Link to="/" className="btn-outline">Volver al Inicio</Link>
                            </div>
                        </div>

                        <div className="cart-summary-section">
                            <div className="summary-box">
                                <h3>Total Carrito</h3>
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
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <button 
                                    className="btn-yellow full-width" 
                                    onClick={handleCheckout}
                                    disabled={hasAnyQtyError}
                                >
                                    Comprar
                                </button>
                                {hasAnyQtyError && (
                                    <p className="cart-checkout-warning" style={{ color: '#d32f2f', fontSize: '13px', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
                                        ⚠️ Revisá las cantidades antes de comprar.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
