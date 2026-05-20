import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function Cart() {
    const { cartItems, vaciarCarrito, API_URL } = useContext(AppContext);
    const [loadingPayment, setLoadingPayment] = useState(false);

    // Calcular el total a pagar
    const total = cartItems.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);

    const handlePagoMercadoPago = async () => {
        if (cartItems.length === 0) return;
        setLoadingPayment(true);
        try {
            const response = await fetch(`${API_URL}/payments/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cartItems }),
            });

            if (!response.ok) {
                throw new Error('Error al crear preferencia en el backend');
            }

            const data = await response.json();
            
            // Redirigir a Mercado Pago usando el init_point
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error('No se recibió la URL de pago de Mercado Pago');
            }
        } catch (error) {
            console.error('Error procesando pago:', error);
            alert('Hubo un problema al conectar con Mercado Pago.');
            setLoadingPayment(false);
        }
    };

    return (
        <main className="cart-page" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1>Tu Carrito 🛒</h1>
            
            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <p>Tu carrito está vacío.</p>
                </div>
            ) : (
                <div className="cart-content">
                    <ul className="cart-items" style={{ listStyle: 'none', padding: 0 }}>
                        {cartItems.map((item, idx) => (
                            <li key={idx} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid #eee'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <img 
                                        src={item.imagen_url || 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=100&q=80'} 
                                        alt={item.nombre} 
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.nombre}</h3>
                                        <span style={{ color: '#666' }}>Cantidad: {item.cantidad || 1}</span>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    ${item.precio * (item.cantidad || 1)}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="cart-summary" style={{ 
                        marginTop: '2rem', 
                        padding: '1.5rem', 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '1rem'
                    }}>
                        <h2 style={{ margin: 0 }}>Total: <span style={{ color: 'var(--lego-blue)' }}>${total}</span></h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={vaciarCarrito}
                                style={{ 
                                    padding: '0.8rem 1.5rem', 
                                    backgroundColor: 'transparent', 
                                    border: '1px solid #ccc', 
                                    borderRadius: '8px',
                                    cursor: 'pointer' 
                                }}
                            >
                                Vaciar Carrito
                            </button>
                            <button 
                                onClick={handlePagoMercadoPago}
                                disabled={loadingPayment}
                                style={{ 
                                    padding: '0.8rem 1.5rem', 
                                    backgroundColor: '#009ee3', // Color MP
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: loadingPayment ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                {loadingPayment ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
