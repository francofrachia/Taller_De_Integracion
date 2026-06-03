import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';

const AdminOrders = () => {
    const { token, API_URL } = useContext(AppContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/compras/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.compras);
            }
        } catch (e) {
            console.error("Error fetching orders", e);
        }
    };

    const handleStatusChange = async (id_compra, newStatus, currentStatus) => {
        if (!newStatus || newStatus === currentStatus) return;

        if (newStatus === 'Cancelado') {
            const confirm = window.confirm("¿Estás seguro de cancelar esta compra? Esto restaurará el stock de los productos involucrados.");
            if (!confirm) return;
        }

        try {
            const res = await fetch(`${API_URL}/compras/admin/${id_compra}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: newStatus })
            });

            if (res.ok) {
                alert('Estado actualizado');
                fetchOrders(); // recargar
            } else {
                const data = await res.json();
                alert(data.error || 'Error al actualizar estado');
            }
        } catch (e) {
            console.error(e);
            alert('Error de red');
        }
    };

    return (
        <div>
            <h2>Gestión de Ventas</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Compra</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id_compra}>
                                <td>{o.id_compra}</td>
                                <td>{new Date(o.fecha).toLocaleString()}</td>
                                <td>{o.usuario_email}</td>
                                <td>${o.total}</td>
                                <td>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '4px',
                                        backgroundColor: o.estado === 'Cancelado' ? '#fee2e2' : '#dcfce7',
                                        color: o.estado === 'Cancelado' ? '#991b1b' : '#166534',
                                        fontSize: '0.85rem'
                                    }}>
                                        {o.estado}
                                    </span>
                                </td>
                                <td>
                                    <select 
                                        value={o.estado}
                                        onChange={(e) => handleStatusChange(o.id_compra, e.target.value, o.estado)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db',
                                            fontFamily: 'inherit',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            backgroundColor: '#f9fafb'
                                        }}
                                    >
                                        <option value="Esperando Pago">Esperando Pago</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En manos del correo">En manos del correo</option>
                                        <option value="Finalizado">Finalizado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
