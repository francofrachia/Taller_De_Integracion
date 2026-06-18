import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { MdCheckBox, MdCheckBoxOutlineBlank, MdDeleteOutline } from 'react-icons/md';
import { useToast } from '../../components/Toast/ToastContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Cart.css';

import { getRealStock } from '../../utils/stockHelpers';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

const isProductActive = (item, productos) => {
    if (item.activo !== undefined) return item.activo;
    return productos ? productos.some(p => p.id_producto === item.id_producto) : true;
};

// Componente extraído para adherirse a Single Responsibility Principle
const CartItemComponent = React.memo(({
    item,
    productos,
    selected,
    qty,
    localQtyStr,
    onToggleSelection,
    onRemove,
    onQuantityChange,
    onLocalQtyChange,
    onQuantityBlur,
    cart
}) => {
    const isActive = isProductActive(item, productos);
    const itemStock = getRealStock(item, productos, cart);
    const outOfStock = itemStock === 0;
    const isInvalidQty = qty !== '' && itemStock !== undefined && parseInt(qty, 10) > itemStock;

    return (
        <div className={`cart-item ${!isActive ? 'cart-item--discontinued' : outOfStock ? 'cart-item--out-of-stock' : (isInvalidQty ? 'cart-item--stock-issue' : '')}`}>
            <div className="item-product">
                <button className="remove-btn" onClick={() => onRemove(item.id_producto)} title="Eliminar"><MdDeleteOutline /></button>
                <Link to={`/producto/${item.id_producto}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
                    {item.imagenes && item.imagenes[0] ? (
                        <img src={item.imagenes[0]} alt={item.nombre} />
                    ) : (
                        <div className="img-placeholder"></div>
                    )}
                    <span className="item-name">{item.nombre}</span>
                </Link>
            </div>
            <div className="item-price">{formatPrice(item.precio)}</div>
            <div className="item-quantity">
                {!isActive ? (
                    <div className="cart-discontinued-badge">
                        Discontinuado
                    </div>
                ) : outOfStock ? (
                    <div className="cart-out-of-stock-badge">
                        Agotado
                    </div>
                ) : (
                    <>
                        <div className={`quantity-controls-inline ${isInvalidQty ? 'qty-controls-error' : ''}`}>
                            <button className="qty-btn" onClick={() => onQuantityChange(item.id_producto, item.cantidad, -1, itemStock)}>-</button>
                            <input
                                type="number"
                                value={localQtyStr !== undefined ? localQtyStr : qty}
                                onChange={(e) => onLocalQtyChange(item.id_producto, e.target.value)}
                                onBlur={(e) => onQuantityBlur(item.id_producto, item.cantidad, itemStock, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.target.blur();
                                }}
                                min="1"
                                max={itemStock || undefined}
                            />
                            <button className="qty-btn" onClick={() => onQuantityChange(item.id_producto, item.cantidad, 1, itemStock)}>+</button>
                        </div>
                        {isInvalidQty && (
                            <div className="qty-error-msg">
                                {`Máx: ${itemStock} u`}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="item-total">
                {(outOfStock || !isActive) ? '-' : formatPrice(item.precio * (qty !== '' ? (parseInt(qty, 10) || 0) : item.cantidad))}
            </div>
            <div className="item-select" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button
                    className="select-btn"
                    style={{ background: 'none', border: 'none', cursor: (isActive && itemStock > 0) ? 'pointer' : 'not-allowed', fontSize: '24px', color: (isActive && itemStock > 0 && selected) ? 'var(--primary-yellow)' : '#ccc' }}
                    onClick={() => isActive && itemStock > 0 && onToggleSelection(item.id_producto)}
                >
                    {(isActive && itemStock > 0 && selected) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                </button>
            </div>
        </div>
    );
});

export default function Cart() {
    const { cart, actualizarCantidadCarrito, removerDelCarrito, usuario, productos, isInitialized, mostrarNotificacion } = useContext(AppContext);
    const navigate = useNavigate();
    const toast = useToast();

    // UI Local State
    const [localQuantities, setLocalQuantities] = useState({});
    const [selectedItems, setSelectedItems] = useState({});
    const [hasAlertedOutOfStock, setHasAlertedOutOfStock] = useState(false);

    // Sincronizar items seleccionados por defecto (si hay stock)
    useEffect(() => {
        if (cart && cart.items && productos) {
            setSelectedItems(prev => {
                const newSel = { ...prev };
                let hasChanges = false;
                cart.items.forEach(item => {
                    const itemStock = getRealStock(item, productos, cart);

                    if (newSel[item.id_producto] === undefined) {
                        newSel[item.id_producto] = itemStock > 0;
                        hasChanges = true;
                    } else if (itemStock === 0 && newSel[item.id_producto] === true) {
                        newSel[item.id_producto] = false;
                        hasChanges = true;
                    }
                });
                return hasChanges ? newSel : prev;
            });
        }
    }, [cart, productos]);

    const toggleSelection = (id_producto) => {
        setSelectedItems(prev => ({
            ...prev,
            [id_producto]: !prev[id_producto]
        }));
    };

    // Memoizaciones (Rendimiento)
    const itemsConStock = useMemo(() => {
        if (!cart?.items || !productos) return [];
        return cart.items.filter(item => getRealStock(item, productos, cart) > 0);
    }, [cart, productos]);

    const allSelected = useMemo(() => {
        return itemsConStock.length > 0 && itemsConStock.every(item => selectedItems[item.id_producto]);
    }, [itemsConStock, selectedItems]);

    const handleSelectAll = () => {
        setSelectedItems(prev => {
            const newSel = { ...prev };
            itemsConStock.forEach(item => {
                newSel[item.id_producto] = !allSelected;
            });
            return newSel;
        });
    };

    // Manejo seguro de errores en operaciones asíncronas
    const handleQuantityChange = async (id_producto, currentQty, change, stock) => {
        const baseQty = localQuantities[id_producto] !== undefined
            ? (parseInt(localQuantities[id_producto], 10) || 1)
            : currentQty;
        const newQty = baseQty + change;

        if (newQty > 0 && (!stock || newQty <= stock)) {
            setLocalQuantities(prev => ({ ...prev, [id_producto]: newQty }));
            try {
                await actualizarCantidadCarrito(id_producto, newQty);
            } catch (error) {
                console.error("Error updating quantity:", error);
                toast.error("No se pudo actualizar la cantidad. Por favor, intenta de nuevo.");
                setLocalQuantities(prev => ({ ...prev, [id_producto]: baseQty })); // Rollback UX
            }
        }
    };

    const handleLocalQtyChange = (id_producto, val) => {
        if (val === '') {
            setLocalQuantities(prev => ({ ...prev, [id_producto]: '' }));
            return;
        }
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            setLocalQuantities(prev => ({ ...prev, [id_producto]: num }));
        }
    };

    const handleQuantityBlur = async (id_producto, currentQty, stock, inputVal) => {
        let val = parseInt(inputVal, 10);

        if (isNaN(val) || val < 1) {
            setLocalQuantities(prev => ({ ...prev, [id_producto]: 1 }));
            if (currentQty !== 1) {
                try {
                    await actualizarCantidadCarrito(id_producto, 1);
                } catch (error) {
                    toast.error("No se pudo restaurar la cantidad.");
                }
            }
            return;
        }

        if (stock !== undefined && val > stock) {
            val = stock;
        }

        setLocalQuantities(prev => ({ ...prev, [id_producto]: val }));

        if (val !== currentQty) {
            try {
                await actualizarCantidadCarrito(id_producto, val);
            } catch (error) {
                console.error("Error updating quantity on blur:", error);
                toast.error("No se pudo actualizar la cantidad.");
                setLocalQuantities(prev => ({ ...prev, [id_producto]: currentQty })); // Rollback UX
            }
        }
    };

    const handleRemove = async (id_producto) => {
        try {
            await removerDelCarrito(id_producto);
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("No se pudo eliminar el producto del carrito. Intenta de nuevo.");
        }
    };

    const hasAnyQtyError = useMemo(() => {
        if (!cart?.items || !productos) return false;
        return cart.items.some(item => {
            if (!selectedItems[item.id_producto]) return false;
            const qty = localQuantities[item.id_producto] !== undefined
                ? localQuantities[item.id_producto]
                : item.cantidad;
            if (qty === '' || isNaN(parseInt(qty, 10)) || parseInt(qty, 10) < 1) {
                return true;
            }
            const itemStock = getRealStock(item, productos, cart);
            return itemStock !== undefined && parseInt(qty, 10) > itemStock;
        });
    }, [cart, productos, selectedItems, localQuantities]);

    const itemsConProblemasStock = useMemo(() => {
        if (!cart?.items || !productos) return [];
        return cart.items.filter(item => {
            if (!selectedItems[item.id_producto]) return false;
            const itemStock = getRealStock(item, productos, cart);
            return itemStock !== undefined && item.cantidad > itemStock;
        });
    }, [cart, productos, selectedItems]);

    const hasDiscontinuedItems = useMemo(() => {
        if (!cart?.items || !productos) return false;
        return cart.items.some(item => !isProductActive(item, productos));
    }, [cart, productos]);

    const handleCheckout = () => {
        if (hasDiscontinuedItems) {
            toast.error('Tu carrito tiene productos que no están disponibles para la compra (discontinuados). Por favor eliminalos para continuar.');
            return;
        }

        const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);

        if (selectedIds.length === 0) {
            toast.error('Debes seleccionar al menos un producto para proceder con la compra.');
            return;
        }

        if (hasAnyQtyError) {
            toast.error('Hay productos con cantidades inválidas o que superan el stock disponible. Por favor, ajusta tu carrito.');
            return;
        }

        if (!cart?.items || cart.items.length === 0) return;
        navigate('/checkout', { state: { selectedItems: selectedIds } });
    };

    const subtotal = useMemo(() => {
        if (!cart?.items || !productos) return 0;
        return cart.items.reduce((sum, item) => {
            if (!selectedItems[item.id_producto]) return sum;
            const itemStock = getRealStock(item, productos, cart);
            if (itemStock === 0) return sum;

            const qty = localQuantities[item.id_producto] !== undefined
                ? (parseInt(localQuantities[item.id_producto], 10) || 0)
                : item.cantidad;
            return sum + (parseFloat(item.precio) * qty);
        }, 0);
    }, [cart, productos, selectedItems, localQuantities]);

    const shipping = 0; // Envío gratis
    const total = subtotal + shipping;

    return (
        <div className="cart-page">
            <Navbar />

            <main className="cart-main container">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <span className="current">Carrito</span>
                </div>

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
                ) : !usuario?.id_usuario ? (
                    <div className="empty-cart">
                        <h2>Iniciá sesión para ver tu carrito</h2>
                        <Link to="/login" className="primary-btn-outline" style={{ marginTop: '20px', display: 'inline-block' }}>
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                ) : !cart?.items || cart.items.length === 0 ? (
                    <div className="empty-cart">
                        <h2>Tu carrito está vacío</h2>
                        <Link to="/" className="primary-btn-outline" style={{ marginTop: '20px', display: 'inline-block' }}>
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-layout">
                            <div className="cart-items-section">
                                <div className="cart-table-header">
                                    <span>Producto</span>
                                    <span>Precio</span>
                                    <span>Cantidad</span>
                                    <span>Total</span>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <button
                                            className="select-btn"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: allSelected ? 'var(--primary-yellow)' : '#ccc' }}
                                            onClick={handleSelectAll}
                                        >
                                            {allSelected ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-items-list">
                                    {cart.items.map(item => (
                                        <CartItemComponent
                                            key={item.id_producto}
                                            item={item}
                                            productos={productos}
                                            selected={selectedItems[item.id_producto]}
                                            qty={localQuantities[item.id_producto] !== undefined ? localQuantities[item.id_producto] : item.cantidad}
                                            localQtyStr={localQuantities[item.id_producto]}
                                            onToggleSelection={toggleSelection}
                                            onRemove={handleRemove}
                                            onQuantityChange={handleQuantityChange}
                                            onLocalQtyChange={handleLocalQtyChange}
                                            onQuantityBlur={handleQuantityBlur}
                                            cart={cart}
                                        />
                                    ))}
                                </div>

                                <div className="cart-actions">
                                    <Link to="/" className="btn-outline">← Volver a la tienda</Link>
                                </div>
                            </div>

                            <div className="cart-summary-section">
                                <div className="summary-box">
                                    <h3>Total Carrito</h3>
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <hr />
                                    <div className="summary-row">
                                        <span>Envío:</span>
                                        <span>Gratis</span>
                                    </div>
                                    <hr />
                                    <div className="summary-row total-row">
                                        <span>Total:</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                    {/* Aviso simple de stock entre Total y Comprar */}
                                    {itemsConProblemasStock.length > 0 && (
                                        <div className="cart-stock-warning-simple">
                                            {itemsConProblemasStock.map(item => {
                                                const itemStock = getRealStock(item, productos, cart);
                                                return (
                                                    <p className="stock-warning-item" key={item.id_producto}>
                                                        <strong>{item.nombre}</strong> {itemStock === 0 ? 'está agotado' : `supera el stock disponible (máx: ${itemStock}u.)`}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <button
                                        className="btn-yellow full-width"
                                        onClick={handleCheckout}
                                        disabled={hasAnyQtyError || hasDiscontinuedItems}
                                    >
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
